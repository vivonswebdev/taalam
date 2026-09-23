import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import type { PluginListenerHandle } from "@capacitor/core";

/**
 * Single native (iOS/Android) speech session on top of the Capacitor plugin.
 *
 * The plugin ends a recognition task on its own (iOS ≈1 min limit, "no speech"
 * errors, final result) and only reports it through the `listeningState` event.
 * This wrapper listens for it, restarts transparently in continuous mode while
 * keeping the text already recognised, and always removes its listeners.
 */

const MAX_AUTO_RESTARTS = 10;
// After stop(), iOS may still deliver the final transcription for a moment
const FINAL_RESULT_GRACE_MS = 400;

export interface NativeSpeechOptions {
  lang: string;
  continuous?: boolean;
  onTranscript: (text: string) => void;
  onEnd: () => void;
  onError?: (code: "not-allowed" | "capacitor-error") => void;
}

export interface NativeSpeechSession {
  stop: () => Promise<void>;
}

let activeSession: NativeSpeechSession | null = null;

export async function ensureNativeSpeechPermission(): Promise<boolean> {
  const status = await SpeechRecognition.checkPermissions();
  if (status.speechRecognition === "granted") return true;
  const requested = await SpeechRecognition.requestPermissions();
  return requested.speechRecognition === "granted";
}

export async function startNativeSpeech(opts: NativeSpeechOptions): Promise<NativeSpeechSession | null> {
  if (activeSession) await activeSession.stop();
  // Make sure no engine from another screen is still running ("Ongoing speech recognition")
  await SpeechRecognition.stop().catch(() => {});

  if (!(await ensureNativeSpeechPermission())) {
    opts.onError?.("not-allowed");
    return null;
  }

  let committed = "";
  let current = "";
  let wanted = true;
  let finished = false;
  let restarts = 0;
  const handles: PluginListenerHandle[] = [];

  const finish = (notify = true) => {
    if (finished) return;
    finished = true;
    handles.forEach((h) => { h.remove().catch(() => {}); });
    if (activeSession === session) activeSession = null;
    if (notify) opts.onEnd();
  };

  const begin = () =>
    SpeechRecognition.start({ language: opts.lang, partialResults: true, popup: false, maxResults: 1 });

  const session: NativeSpeechSession = {
    stop: async () => {
      if (!wanted) return;
      wanted = false;
      await SpeechRecognition.stop().catch(() => {});
      setTimeout(() => finish(), FINAL_RESULT_GRACE_MS);
    },
  };
  activeSession = session;

  handles.push(
    await SpeechRecognition.addListener("partialResults", (data) => {
      const text = data?.matches?.[0] ?? "";
      if (!text || finished) return;
      current = text;
      opts.onTranscript(`${committed} ${current}`.trim());
    }),
    await SpeechRecognition.addListener("listeningState", (data) => {
      if (data.status !== "stopped" || finished) return;
      if (wanted && opts.continuous && restarts < MAX_AUTO_RESTARTS) {
        restarts++;
        committed = `${committed} ${current}`.trim();
        current = "";
        begin().catch((e) => {
          console.warn("[NativeSpeech] restart failed:", e);
          wanted = false;
          finish();
        });
        return;
      }
      wanted = false;
      setTimeout(() => finish(), FINAL_RESULT_GRACE_MS);
    }),
  );

  try {
    await begin();
  } catch (e) {
    console.error("[NativeSpeech] start failed:", e);
    wanted = false;
    opts.onError?.("capacitor-error");
    finish(false);
    return null;
  }
  return session;
}
