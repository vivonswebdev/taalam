import UIKit
import Capacitor
import Speech
import AVFoundation

/// Root view controller (see Main.storyboard). Registers plugins that live in the
/// app target: @capacitor-community/speech-recognition ships no Package.swift, so
/// Capacitor's SPM integration can't link it — its native side is implemented here.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(SpeechRecognitionPlugin())
    }
}

/// Native side of `@capacitor-community/speech-recognition` (same JS name, methods and events).
@objc(SpeechRecognitionPlugin)
public class SpeechRecognitionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SpeechRecognitionPlugin"
    public let jsName = "SpeechRecognition"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "available", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getSupportedLanguages", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isListening", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermissions", returnType: CAPPluginReturnPromise)
    ]

    private let defaultMatches = 5
    private var speechRecognizer: SFSpeechRecognizer?
    private var audioEngine: AVAudioEngine?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?

    @objc func available(_ call: CAPPluginCall) {
        call.resolve(["available": SFSpeechRecognizer()?.isAvailable ?? false])
    }

    @objc func isListening(_ call: CAPPluginCall) {
        call.resolve(["listening": audioEngine?.isRunning ?? false])
    }

    @objc func getSupportedLanguages(_ call: CAPPluginCall) {
        call.resolve(["languages": SFSpeechRecognizer.supportedLocales().map { $0.identifier }])
    }

    @objc override public func checkPermissions(_ call: CAPPluginCall) {
        call.resolve(["speechRecognition": permissionState()])
    }

    @objc override public func requestPermissions(_ call: CAPPluginCall) {
        SFSpeechRecognizer.requestAuthorization { status in
            guard status == .authorized else {
                call.resolve(["speechRecognition": self.permissionState()])
                return
            }
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                call.resolve(["speechRecognition": granted ? "granted" : "denied"])
            }
        }
    }

    @objc func start(_ call: CAPPluginCall) {
        if audioEngine?.isRunning == true {
            call.reject("Ongoing speech recognition")
            return
        }
        guard SFSpeechRecognizer.authorizationStatus() == .authorized else {
            call.reject("Missing permission")
            return
        }

        AVAudioSession.sharedInstance().requestRecordPermission { granted in
            guard granted else {
                call.reject("User denied access to microphone")
                return
            }
            DispatchQueue.main.async { self.beginRecognition(call) }
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if self.audioEngine?.isRunning == true {
                // endAudio() lets iOS deliver the final transcription through the task handler
                self.recognitionRequest?.endAudio()
                self.tearDownAudio()
                self.notifyListeners("listeningState", data: ["status": "stopped"])
            }
            call.resolve()
        }
    }

    // MARK: - Private

    private func permissionState() -> String {
        switch SFSpeechRecognizer.authorizationStatus() {
        case .authorized: return "granted"
        case .denied, .restricted: return "denied"
        default: return "prompt"
        }
    }

    private func beginRecognition(_ call: CAPPluginCall) {
        let language = call.getString("language") ?? "en-US"
        let maxResults = call.getInt("maxResults") ?? defaultMatches
        let partialResults = call.getBool("partialResults") ?? false

        recognitionTask?.cancel()
        recognitionTask = nil

        guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: language)), recognizer.isAvailable else {
            call.reject("Speech recognition unavailable for \(language)")
            return
        }
        speechRecognizer = recognizer

        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetooth, .allowBluetoothA2DP])
            try session.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            call.reject("Microphone is already in use by another application.")
            return
        }

        let engine = AVAudioEngine()
        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = partialResults
        audioEngine = engine
        recognitionRequest = request

        recognitionTask = recognizer.recognitionTask(with: request) { [weak self] result, error in
            guard let self = self else { return }
            if let result = result {
                let matches = result.transcriptions.prefix(max(maxResults, 1)).map { $0.formattedString }
                if partialResults {
                    self.notifyListeners("partialResults", data: ["matches": matches])
                } else {
                    call.resolve(["matches": matches])
                }
            }
            if error != nil || result?.isFinal == true {
                DispatchQueue.main.async {
                    let wasRunning = self.audioEngine === engine && engine.isRunning
                    if self.audioEngine === engine { self.tearDownAudio() }
                    if wasRunning { self.notifyListeners("listeningState", data: ["status": "stopped"]) }
                }
                if let error = error, !partialResults { call.reject(error.localizedDescription) }
            }
        }

        let inputNode = engine.inputNode
        let format = inputNode.outputFormat(forBus: 0)
        guard format.sampleRate > 0, format.channelCount > 0 else {
            tearDownAudio()
            call.reject("No microphone input available")
            return
        }
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
            request.append(buffer)
        }

        engine.prepare()
        do {
            try engine.start()
            notifyListeners("listeningState", data: ["status": "started"])
            if partialResults { call.resolve() }
        } catch {
            tearDownAudio()
            call.reject("Unknown error occured")
        }
    }

    private func tearDownAudio() {
        if let engine = audioEngine {
            engine.stop()
            engine.inputNode.removeTap(onBus: 0)
        }
        audioEngine = nil
        recognitionRequest = nil
        recognitionTask = nil
        // Hand the audio session back so Quran playback isn't stuck in record mode
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
    }
}
