# Passation Taaloum — 25/09/2026 (session Claude Code, sortie iOS)

> Reprise sur le Mac mini. Ce fichier remplace la passation Lovable du 23/09,
> conservée telle quelle en annexe (section 9).

## 1. Objectif

Sortir **Taaloum** sur l'App Store le plus vite possible, avec une récitation vocale
qui fonctionne vraiment sur iPhone.

- **Stack** : React 18 + Vite + TypeScript + Tailwind/shadcn, Supabase (auth, base, fonctions serveur).
- **iOS** : Capacitor 8 (Swift Package Manager). Le projet iOS est dans `ios/App`.
- **Code d'origine** : Lovable, dépôt privé `https://github.com/vivonswebdev/taalam`.
- **Identifiant de l'app** : `app.taalam.eu`, iOS 15 minimum.

## 2. État du projet (dossier `taaloum-app`)

Dépôt git local, branche `main`. **Les commits ne sont pas encore poussés sur GitHub.**

| Commit | Contenu |
|---|---|
| `98e5647` | Base : zip Lovable du 29 mars 2026 |
| `126d080` | Zip Lovable du 23 sept. 2026 (`taaloum (1).zip`), la vraie version à jour |
| `5be44c1` | Voix native, notation, notifications, build Capacitor |
| `ca3bed8` | Projet iOS : plugin vocal natif, Info.plist App Store, CLI Capacitor |
| `5a3d72d` | Erreurs 401 après le durcissement sécurité, notation Tahaddi/Hifz |
| `9db8616` | Voix iOS réellement branchée, Mode Facile réel, fonctions simulées masquées |

Les mêmes corrections existent en fichiers `.patch` dans `Downloads/taaloum-correctifs/`
(4 fichiers, à appliquer sur le dépôt GitHub avec `git am`).

**Vérifié le 25/09 :**
- `npx tsc` sans erreur ;
- `npm test` : 18/18 ;
- `npm run build` OK ;
- build Xcode OK et lancement dans le simulateur iPhone 16 Pro (iOS 18.6).
- Voix de bout en bout dans le simulateur :
  - An-Nas récitée (voix « Majed » du Mac) : 20/20 mots, **100 %** ;
  - Al-Ikhlas récitée alors qu'An-Nas était choisie : **5 %** ;
  - enregistrement vide : message « Enregistrement vide », sans score ni XP.
- **Pas encore testé sur un vrai iPhone.**

## 3. Bugs corrigés (et pourquoi)

### Voix / récitation
1. **Le plugin vocal iOS n'était jamais chargé.**
   - `@capacitor-community/speech-recognition` n'a pas de `Package.swift`, donc Capacitor 8 (SPM) l'ignore.
   - → Réimplémenté en Swift dans `ios/App/App/MainViewController.swift` (même nom JS `SpeechRecognition`).
   - → `SceneDelegate.swift` crée `MainViewController()` au lieu de `CAPBridgeViewController()`. Capacitor 8 passe par le SceneDelegate et ignore le storyboard.
2. **Imports Capacitor non résolus dans le build.** `vite.config.ts` déclarait les plugins en `external`, ce qui cassait micro, notifications, adhan et barre d'état. → Retiré.
3. **Micro bloqué sur « écoute ».** iOS arrête seul la reconnaissance (environ 1 min, ou « no speech ») via l'événement `listeningState`, que personne n'écoutait.
   - → `src/lib/nativeSpeech.ts` : une seule session, relance automatique qui garde le texte déjà reconnu, nettoyage des écouteurs.
   - Utilisé par `useVoiceRecognition.ts` et `useTarteelAyah.ts`.
4. **Notation trop permissive.** Elle comptait des lettres (« ملك » = « كلم » → 100 %).
   - → Distance d'édition partagée dans `src/lib/arabicMatch.ts`.
   - Utilisée par useVoiceRecognition, useTarteelAyah, useTahaddiSession, useHifzSession et useLiveWordFeedback.
5. **Scores par ayah décalés** dès qu'un mot était en trop (`compareSurahDictation`). → Corrigé.
6. **Caractère invisible U+200F** qu'iOS place en tête de transcription : la basmala n'était pas reconnue et tout le texte se décalait.
   - → Retiré dans `normalizeArabic`.
   - → `stripLeadingBasmala()` enlève la basmala récitée avant de comparer.
7. **Mode serveur (web)** : seule la 1re seconde d'audio était décodable, et le type MIME était faux sous Safari.
   - → Segments audio autonomes de 4 s, et type MIME envoyé à `stt-chunk`.

### Fonctions qui donnaient des résultats inventés
8. **Mode Facile** (`src/pages/tarteel-easy/SimpleRecorder.tsx`) renvoyait un score **aléatoire de 60 à 80 %**.
   - → Il utilise maintenant la vraie reconnaissance, comparée au texte complet de la sourate.
   - Le texte vient de `getSurahAyahs()` (dans `useMushafPageData.ts`) qui lit `public/mushaf-text.json` : 114 sourates, 6 236 versets, vérifié par un test.
9. **Mode Offline** : score aléatoire, et faux scores écrits dans la table `tarteel_scores`. → **Masqué.**
10. **Duels en famille** : « Participer » donnait un score aléatoire. → **Masqué.**
    - Pour les deux, le réglage est dans `src/config/features.ts`. Ne le repasser à `true` qu'une fois la fonction réellement implémentée.

### Sécurité / serveur
11. **Erreurs 401 pour tout le monde** après le durcissement sécurité de Lovable.
    - Cause : `FindAyah.tsx` et `elevenLabsTTS.ts` envoyaient la clé publique (rôle anon, sans `sub`).
    - → `src/lib/edgeFunctionAuth.ts` envoie le jeton de session de l'utilisateur.
    - Sans connexion, un message traduit s'affiche (clés `findAyah.loginRequired` et `stories.loginRequired`).
12. **Notifications natives** : le jeton n'était jamais enregistré (utilisateur figé), les écouteurs étaient en double et `register()` n'était pas appelé au lancement. → Corrigé dans `usePushNotifications.ts`.

### Configuration iOS / build
13. `capacitor.config.ts` pointait vers l'aperçu Lovable (`server.url`) : Apple rejette ça. → Retiré.
14. `react-leaflet@5` demande React 19, ce qui cassait l'installation. → Version 4.2.1.
15. `Info.plist` :
    - textes d'autorisation micro, reconnaissance vocale et localisation en français ;
    - `arm64` au lieu de `armv7` ;
    - modes d'arrière-plan `audio` et `remote-notification` ;
    - `ITSAppUsesNonExemptEncryption = false` ;
    - langues fr, ar, en.
16. **Popup « localhost aimerait utiliser votre position ».**
    - → `src/lib/nativeGeolocation.ts` fait passer `navigator.geolocation` par `@capacitor/geolocation`.
17. Service worker PWA désactivé dans l'app native (`src/main.tsx`).

## 4. Décisions prises avec Chaimae (25/09)

- **Design** : refonte de la base (couleurs, typographie, cartes) pour toute l'app, plus refonte complète de l'**Accueil**, de la **barre d'onglets** (bouton central) et de **Tarteel**.
  - Inspiration : l'image « Who's Late? ». Cartes sombres très arrondies, tuiles pastel (lavande, menthe, pêche, bleu ciel), avatars illustrés, titre manuscrit, classement en lignes colorées, micro-animations. Le lien X envoyé porte sur l'animation de maquettes.
  - **Montrer une maquette avant de coder.**
- **iPhone pliable** (« iPhone duo ») : l'app doit s'adapter quand on plie/déplie, avec une mise en page 2 colonnes sur grand écran et une gestion du redimensionnement en direct.
- **ElevenLabs → VoiceStudio** (`Downloads/VoiceStudio-main.zip`, licence AGPL-3.0, modèle OmniVoice sous Apache 2.0) : **pré-générer sur le Mac** les audios des histoires Kids (environ 420 répliques dans `src/data/islamicStories.ts`, plus 67 sous-titres × 6 langues dans `islamicStoriesVideo.ts`), puis les livrer en MP3 avec l'app.
  - Plus d'appel ElevenLabs ni de 401, et ça marche hors ligne.
  - Voix iOS intégrée (AVSpeechSynthesizer) en secours pour les textes non prévus.
  - Il faut **environ 10 Go libres**, macOS 13.3+ et Apple Silicon.
  - Guide pour agent : `docs/install/agent.md` dans le zip. Demander avant chaque téléchargement de modèle.

## 5. Prochaines étapes (dans l'ordre)

1. **Installer l'environnement sur le Mac mini** : Xcode (et l'ouvrir une fois), Node 22+, puis dans le dossier `npm ci`.
2. **Pousser sur GitHub** sur une branche `claude/ios-release`, pas sur `main`, pour ne rien écraser dans Lovable. Relire, puis fusionner.
   - Il faut une authentification GitHub : `gh auth login`, ou un jeton *fine-grained* limité au dépôt, avec *Contents : Read and write*.
3. **Maquette du design** (Accueil + onglets + Tarteel, iPhone plié et déplié) → validation → code.
4. **Support de l'iPhone pliable** (mise en page adaptative, simulateur grand format et iPad pour tester).
5. **VoiceStudio** : installation, génération des audios des histoires, intégration dans `IslamicStoriesPlayer` et `IslamicStoryVideoPlayer`.
6. **Bloquants App Store restants** :
   - suppression de compte dans l'app : **obligatoire**, absente aujourd'hui ;
   - icône et écran de lancement Ta'alam (actuellement ceux de Capacitor par défaut) ;
   - notifications serveur : `check-notifications` utilise l'API FCM *legacy*, fermée depuis 2024. Passer à FCM HTTP v1 avec Firebase côté iOS, ou lancer la v1 avec seulement les notifications locales ;
   - Xcode : équipe de signature, capacité *Push Notifications* ;
   - demander la localisation au moment d'ouvrir Prières/Qibla plutôt qu'au lancement.
7. **Actions manuelles de Chaimae** :
   - Leaked Password Protection (Cloud → Auth → Email) ;
   - redéployer la fonction `stt-chunk` ;
   - tester la voix sur un **vrai iPhone**.
8. **Plus tard** :
   - réimplémenter pour de vrai le Mode Offline et les duels ;
   - environ 1 700 avertissements de lint (`any`, `catch` vides) ;
   - bundle principal de 800 Ko à découper.

## 6. Commandes utiles

```bash
npm ci                    # installer
npx tsc -p tsconfig.app.json --noEmit
npm test                  # 18 tests
npm run build && npx cap sync ios
cd ios/App && xcodebuild -project App.xcodeproj -scheme App -configuration Debug \
  -destination "platform=iOS Simulator,name=iPhone 16 Pro" CODE_SIGNING_ALLOWED=NO build
```

**Tester la voix sans parler :** lancer un enregistrement dans l'app, puis sur le Mac :
`say -v Majed -r 120 "قل أعوذ برب الناس. ملك الناس. إله الناس."`
Le simulateur écoute le micro du Mac. Au tout premier lancement, macOS demande l'accès micro pour Simulator : l'accepter, sinon l'app plante dans `AURemoteIO::Initialize`.

**Journaux de l'app :** `xcrun simctl launch --console-pty <UDID> app.taalam.eu`. Les appels au plugin apparaissent en `To Native -> SpeechRecognition …`.

## 7. Pièges connus

- `src/integrations/supabase/client.ts` et `previewAuthStorage.ts` sont **générés par Lovable** : ne pas les éditer.
- Après `npx cap sync ios`, vérifier que `MainViewController.swift`, `SceneDelegate.swift` et `Info.plist` sont intacts (cap sync ne touche pas à la cible App, mais c'est à vérifier).
- `src/types/capacitor-plugins.d.ts` a été supprimé exprès : il masquait les vrais types des plugins.
- Règle i18n du projet : jamais de texte en dur, tout via `t("clé")` dans les 6 langues (fr, en, nl, ar, tr, ur).
- Style de `StatusBar` : `Style.Light` = texte **foncé** (c'est correct pour le fond clair).

## 8. Fichiers clés ajoutés ou modifiés par cette session

- `ios/App/App/MainViewController.swift` : plugin de reconnaissance vocale natif
- `ios/App/App/SceneDelegate.swift`, `ios/App/App/Info.plist`
- `src/lib/nativeSpeech.ts`, `arabicMatch.ts`, `edgeFunctionAuth.ts`, `nativeGeolocation.ts`
- `src/config/features.ts`
- `src/hooks/useVoiceRecognition.ts`, `useTarteelAyah.ts`, `usePushNotifications.ts`, `useMushafPageData.ts`
- `src/pages/tarteel-easy/SimpleRecorder.tsx`
- `src/hooks/__tests__/voiceCompare.test.ts`, `getSurahAyahs.test.ts`
- `supabase/functions/stt-chunk/index.ts`

---

## 9. Annexe — Passation Lovable du 23/09/2026 (inchangée)

### 1. Objectif
Taaloum : application multilingue (FR, AR, EN, NL, UR, TR) d'apprentissage du Coran pour tous les âges.
Fonctions clés : lecture du Mushaf, mémorisation (SRS), récitation vocale (Tarteel), 99 Noms d'Allah (/moods/asma-ul-husna), États du cœur, Athkâr, espace Kids, gestion famille/école, gamification (XP, niveaux, leaderboards), Mode TV.

### 2. Problématique de la session
- **Sécurité (dernier travail)** : scan de sécurité → 36 findings sélectionnés. 30 corrigés (edge functions protégées par auth : find-verse, speech-to-text, elevenlabs-tts, score-tajwid ; policies RLS périmées remplacées ; storage objects owner unbound). 5 marqués « not a problem ». **1 restant : Leaked Password Protection disabled → action MANUELLE dans le Cloud (Users → Auth Settings → Email → HIBP check).**
- Fiabilité audio (iOS Safari) : lecture échouait 1 fois sur 2 → migration vers CDN everyayah.com + création de l'objet Audio au clic.
- i18n : pages non traduites → scan complet, ~80 clés ajoutées dans useLanguage.tsx.
- Mode Hard (récitation sourate complète sans interruption) : avance trop vite → correction via useLiveWordFeedback sur tous les versets + currentAyahIdx dérivé des mots correspondus.
- Mode TV : adaptation iPhone (bouton ✕ disparaît avec les contrôles, safe-area, AirPlay/plein écran dans les réglages, tous les récitateurs, 8 polices de calligraphie).
- Cache audio hors ligne : localStorage (5 Mo) insuffisant → migration IndexedDB (Dexie), cache TTS jusqu'à 200 Mo.

### 3. Fichiers importants
- `src/hooks/useLanguage.tsx` — i18n 6 langues (règle absolue : jamais de texte en dur, tout via `t("clé")`)
- `src/pages/AsmaUlHusnaPage.tsx`, `src/components/AsmaLearnView.tsx`, `AsmaPhonothequeView.tsx`, `src/data/asmaUlHusnaData.ts` — audio des 99 Noms via CDN jsDelivr (0.mp3 = « Allah », donc nom n°1 → 1.mp3), nasheed rejoué séquentiellement (0→99)
- `src/components/FullSurahDictation.tsx`, `src/components/DictationMode.tsx` — étape « Écoute » obligatoire avant « Récite », mode Hard
- `src/components/IslamicStoriesPlayer.tsx`, `IslamicStoryVideoPlayer`, `src/data/islamicStoriesVideo.ts` — voix enfant ElevenLabs (4p5WXd3ZuWR9pPtRQuxC), voix pré-intégrées testées : Brian ✅, Sarah ✅, Alice ✅
- `src/pages/TVModePage.tsx` — Mode TV (récitateurs everyayah.com, polices arabes, AirPlay/plein écran)
- `src/lib/mushafDB.ts` — cache IndexedDB (audios hors ligne, téléchargement par sourate)
- `src/services/elevenLabsTTS.ts` — TTS (protégé par auth après fix sécurité)
- `src/components/MicPermissionModal.tsx` — permissions micro via API natives Capacitor (iOS WKWebView)
- `src/integrations/supabase/client.ts` — AUTO-GÉNÉRÉ, ne jamais éditer

> Note du 25/09 : `AsmaLearnView.tsx`, `AsmaPhonothequeView.tsx`, `find-verse` et `speech-to-text`
> n'existent pas dans le code. Les équivalents réels sont `components/kids/…`, `find-ayah` et `stt`/`stt-chunk`.

### 4. Ce qui a raté
- **Voix enfant ElevenLabs 0bKGtCCpdKSI5NjGhU3z** : voix de bibliothèque communautaire → 401 (compte payant requis). Non résolu.
- Voix « Lily » ElevenLabs : ❌ non fonctionnelle.
- Certaines URLs vidéo Pexels : 403 (3 remplacées, il peut en rester).
- api.alquran.cloud : peu fiable → abandonné au profit d'everyayah.com.
- Safari iOS : `new Audio()` créé dans un `.then()` async perdait le contexte d'interaction → corrigé (création au clic).
- raw.githubusercontent.com force le téléchargement (content-disposition) → utiliser jsDelivr pour l'audio.

### 5. Prochaines étapes (Lovable)
1. **Activer Leaked Password Protection** manuellement dans le Cloud (Users → Auth Settings → Email).
2. Relancer un scan de sécurité complet.
3. Finir l'i18n restant : Recitation, HifzTodayPage, jeux Kids, Auth.
4. Vérifier les 6 langues + routes après chaque modification.
5. Retester les vidéos d'histoires (Pexels) et les voix sur appareil iOS réel (micro + audio).
