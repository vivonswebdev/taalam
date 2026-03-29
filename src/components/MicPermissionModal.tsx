import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Settings, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

/** Detect if running inside a Capacitor native shell */
function isCapacitorNative(): boolean {
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

const MIC_GRANTED_KEY = "micGranted";

/**
 * Returns true if the user already granted mic permission (stored in localStorage).
 */
export function isMicGranted(): boolean {
  try {
    return localStorage.getItem(MIC_GRANTED_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Reusable cached MediaStream to avoid repeated permission popups on iOS/Android.
 * Once a stream is acquired, its tracks are kept alive so subsequent getUserMedia
 * calls from the same origin reuse the cached permission.
 */
let cachedStream: MediaStream | null = null;

export function getCachedMicStream(): MediaStream | null {
  return cachedStream;
}

export function releaseCachedMicStream() {
  if (cachedStream) {
    cachedStream.getTracks().forEach(t => t.stop());
    cachedStream = null;
  }
}

interface MicPermissionModalProps {
  onGranted?: () => void;
  onDismissed?: () => void;
}

export default function MicPermissionModal({ onGranted, onDismissed }: MicPermissionModalProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [denied, setDenied] = useState(false);
  const alreadyShownRef = useRef(false);

  useEffect(() => {
    // Don't show if already granted or already shown this session
    if (isMicGranted() || alreadyShownRef.current) return;

    // Check if permission API is available to determine state
    if (navigator.permissions) {
      navigator.permissions.query({ name: "microphone" as PermissionName }).then(status => {
        if (status.state === "granted") {
          localStorage.setItem(MIC_GRANTED_KEY, "true");
          return;
        }
        // Show modal for "prompt" or "denied" states
        alreadyShownRef.current = true;
        setVisible(true);
        if (status.state === "denied") setDenied(true);
      }).catch(() => {
        // Permissions API not supported (iOS Safari), show modal
        alreadyShownRef.current = true;
        setVisible(true);
      });
    } else {
      alreadyShownRef.current = true;
      setVisible(true);
    }
  }, []);

  const handleGrant = useCallback(async () => {
    setRequesting(true);
    setDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Cache the stream so dictation components can reuse without re-prompt
      cachedStream = stream;
      localStorage.setItem(MIC_GRANTED_KEY, "true");
      setVisible(false);
      onGranted?.();
    } catch (err: any) {
      console.warn("[MicPermission] getUserMedia denied:", err);
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setDenied(true);
      }
    } finally {
      setRequesting(false);
    }
  }, [onGranted]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    onDismissed?.();
  }, [onDismissed]);

  const openBrowserSettings = useCallback(() => {
    // Can't programmatically open browser settings, but give guidance
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      alert("Sur iOS : Réglages → Safari → Microphone → Autoriser pour ce site.");
    } else if (isAndroid) {
      alert("Sur Android : Appuie sur l'icône 🔒 dans la barre d'adresse → Autorisations → Microphone → Autoriser.");
    } else {
      alert("Clique sur l'icône 🔒 à gauche de l'URL dans la barre d'adresse → Autorisations → Microphone → Autoriser.");
    }
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header icon */}
          <div className="flex justify-center pt-7 pb-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              denied ? "bg-destructive/15" : "bg-primary/15"
            }`}>
              {denied ? (
                <AlertTriangle size={32} className="text-destructive" />
              ) : (
                <Mic size={32} className="text-primary" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-2 text-center space-y-2">
            <h3 className="text-lg font-bold text-foreground">
              {denied ? "Micro bloqué" : "🎙️ Accès micro requis"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {denied
                ? "L'accès au micro a été refusé. Active-le dans les réglages de ton navigateur pour utiliser la dictée coranique."
                : "Pour la dictée de versets coraniques, l'app a besoin d'accéder à ton microphone. Donner accès maintenant ?"
              }
            </p>
          </div>

          {/* Buttons */}
          <div className="px-6 pb-6 pt-4 space-y-3">
            {denied ? (
              <>
                <button
                  onClick={openBrowserSettings}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                >
                  <Settings size={18} />
                  Ouvrir les réglages
                </button>
                <button
                  onClick={handleGrant}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-border text-foreground font-medium text-sm active:scale-[0.98] transition-transform"
                >
                  <Mic size={16} />
                  Réessayer
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleGrant}
                  disabled={requesting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {requesting ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Mic size={18} />
                  )}
                  {requesting ? "Demande en cours…" : "Oui, autoriser 🎙️"}
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-border text-muted-foreground font-medium text-sm active:scale-[0.98] transition-transform"
                >
                  <X size={16} />
                  Non, plus tard
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
