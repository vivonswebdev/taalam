# Passation Taaloum — 23/09/2026

## 1. Objectif
Taaloum : application multilingue (FR, AR, EN, NL, UR, TR) d'apprentissage du Coran pour tous les âges.
Fonctions clés : lecture du Mushaf, mémorisation (SRS), récitation vocale (Tarteel), 99 Noms d'Allah (/moods/asma-ul-husna), États du cœur, Athkâr, espace Kids, gestion famille/école, gamification (XP, niveaux, leaderboards), Mode TV.

## 2. Problématique de la session
- **Sécurité (dernier travail)** : scan de sécurité → 36 findings sélectionnés. 30 corrigés (edge functions protégées par auth : find-verse, speech-to-text, elevenlabs-tts, score-tajwid ; policies RLS périmées remplacées ; storage objects owner unbound). 5 marqués « not a problem ». **1 restant : Leaked Password Protection disabled → action MANUELLE dans le Cloud (Users → Auth Settings → Email → HIBP check).**
- Fiabilité audio (iOS Safari) : lecture échouait 1 fois sur 2 → migration vers CDN everyayah.com + création de l'objet Audio au clic.
- i18n : pages non traduites → scan complet, ~80 clés ajoutées dans useLanguage.tsx.
- Mode Hard (récitation sourate complète sans interruption) : avance trop vite → correction via useLiveWordFeedback sur tous les versets + currentAyahIdx dérivé des mots correspondus.
- Mode TV : adaptation iPhone (bouton ✕ disparaît avec les contrôles, safe-area, AirPlay/plein écran dans les réglages, tous les récitateurs, 8 polices de calligraphie).
- Cache audio hors ligne : localStorage (5 Mo) insuffisant → migration IndexedDB (Dexie), cache TTS jusqu'à 200 Mo.

## 3. Fichiers importants
- `src/hooks/useLanguage.tsx` — i18n 6 langues (règle absolue : jamais de texte en dur, tout via `t("clé")`)
- `src/pages/AsmaUlHusnaPage.tsx`, `src/components/AsmaLearnView.tsx`, `AsmaPhonothequeView.tsx`, `src/data/asmaUlHusnaData.ts` — audio des 99 Noms via CDN jsDelivr (0.mp3 = « Allah », donc nom n°1 → 1.mp3), nasheed rejoué séquentiellement (0→99)
- `src/components/FullSurahDictation.tsx`, `src/components/DictationMode.tsx` — étape « Écoute » obligatoire avant « Récite », mode Hard
- `src/components/IslamicStoriesPlayer.tsx`, `IslamicStoryVideoPlayer`, `src/data/islamicStoriesVideo.ts` — voix enfant ElevenLabs (4p5WXd3ZuWR9pPtRQuxC), voix pré-intégrées testées : Brian ✅, Sarah ✅, Alice ✅
- `src/pages/TVModePage.tsx` — Mode TV (récitateurs everyayah.com, polices arabes, AirPlay/plein écran)
- `src/lib/mushafDB.ts` — cache IndexedDB (audios hors ligne, téléchargement par sourate)
- `src/services/elevenLabsTTS.ts` — TTS (protégé par auth après fix sécurité)
- `src/components/MicPermissionModal.tsx` — permissions micro via API natives Capacitor (iOS WKWebView)
- `src/integrations/supabase/client.ts` — AUTO-GÉNÉRÉ, ne jamais éditer

## 4. Ce qui a raté
- **Voix enfant ElevenLabs 0bKGtCCpdKSI5NjGhU3z** : voix de bibliothèque communautaire → 401 (compte payant requis). Non résolu.
- Voix « Lily » ElevenLabs : ❌ non fonctionnelle.
- Certaines URLs vidéo Pexels : 403 (3 remplacées, il peut en rester).
- api.alquran.cloud : peu fiable → abandonné au profit d'everyayah.com.
- Safari iOS : `new Audio()` créé dans un `.then()` async perdait le contexte d'interaction → corrigé (création au clic).
- raw.githubusercontent.com force le téléchargement (content-disposition) → utiliser jsDelivr pour l'audio.

## 5. Prochaines étapes
1. **Activer Leaked Password Protection** manuellement dans le Cloud (Users → Auth Settings → Email) — dernier finding du lot sélectionné, puis appeler manage_security_finding si besoin.
2. Relancer un scan de sécurité complet (le scan actuel ne fait pas de pentest avancé).
3. Finir l'i18n restant : Recitation, HifzTodayPage, jeux Kids, Auth.
4. Vérifier les 6 langues + routes après chaque modification (checklist projet).
5. Retester les vidéos d'histoires (Pexels) et les voix sur appareil iOS réel (micro + audio).
