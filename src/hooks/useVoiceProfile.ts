import { useState, useCallback } from "react";

export type VoiceType = "adult" | "child";
export type SpeakerOrigin = "native" | "non_native";
export type ScoringMode = "beginner" | "strict";

const VOICE_KEY = "asr_voice_profile";
const ORIGIN_KEY = "asr_speaker_origin";
const SCORING_KEY = "asr_scoring_mode";

function load(key: string, fallback: string): string {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

/**
 * Voice profile settings for ASR scoring adjustments.
 * - child/adult: adjusts tolerance thresholds
 * - native/non_native: adjusts expected accuracy
 * - beginner/strict: beginner is more forgiving, strict penalizes tajwid errors
 */
export function useVoiceProfile() {
  const [voiceType, setVoiceTypeState] = useState<VoiceType>(() => load(VOICE_KEY, "adult") as VoiceType);
  const [speakerOrigin, setSpeakerOriginState] = useState<SpeakerOrigin>(() => load(ORIGIN_KEY, "native") as SpeakerOrigin);
  const [scoringMode, setScoringModeState] = useState<ScoringMode>(() => load(SCORING_KEY, "beginner") as ScoringMode);

  const setVoiceType = useCallback((v: VoiceType) => {
    setVoiceTypeState(v);
    try { localStorage.setItem(VOICE_KEY, v); } catch {}
  }, []);

  const setSpeakerOrigin = useCallback((v: SpeakerOrigin) => {
    setSpeakerOriginState(v);
    try { localStorage.setItem(ORIGIN_KEY, v); } catch {}
  }, []);

  const setScoringMode = useCallback((v: ScoringMode) => {
    setScoringModeState(v);
    try { localStorage.setItem(SCORING_KEY, v); } catch {}
  }, []);

  /**
   * Get the similarity threshold for "correct" word matching.
   * Lower = more forgiving.
   */
  const getWordThreshold = useCallback((): number => {
    let base = 0.6; // default from compareTexts

    if (scoringMode === "strict") base = 0.75;
    if (voiceType === "child") base -= 0.08;
    if (speakerOrigin === "non_native") base -= 0.05;

    return Math.max(0.4, Math.min(0.85, base));
  }, [voiceType, speakerOrigin, scoringMode]);

  /**
   * Get the score threshold for considering an ayah "correct".
   */
  const getPassThreshold = useCallback((): number => {
    if (scoringMode === "strict") return 85;
    if (voiceType === "child" || speakerOrigin === "non_native") return 60;
    return 70;
  }, [voiceType, speakerOrigin, scoringMode]);

  return {
    voiceType, setVoiceType,
    speakerOrigin, setSpeakerOrigin,
    scoringMode, setScoringMode,
    getWordThreshold,
    getPassThreshold,
  };
}
