# 📖 Taaloum - Application d'apprentissage du Coran

## 🌟 Vue d'ensemble

Taaloum est une application web progressive (PWA) complète pour l'apprentissage, la mémorisation et la pratique du Coran. Elle combine des fonctionnalités pédagogiques avancées avec une interface intuitive adaptée aux apprenants de tous âges.

## 🎯 Fonctionnalités principales

### 📚 Lecture et Étude du Coran
- **Mushaf complet** - Lecture du Coran avec interface fluide type lecteur
- **Mode lecture** - Affichage par sourate avec traductions multiples
- **Juz & Hizb** - Navigation par divisions du Coran
- **Recherche d'Ayah** - Recherche avancée dans le texte coranique
- **Tafsir intégré** - Exégèses disponibles pour chaque verset
- **Audio** - Écoute avec plusieurs récitateurs (Mishary, Husary, etc.)
- **Tajwid coloré** - Règles de tajwid visuelles

### 🎤 Modes d'entraînement vocal
- **Mode Récitation** - Évaluation de la récitation avec IA
- **Mode Dictée** - Compléter les versets manquants
- **Mode Tahaddi** - Défi de récitation chronométré
- **Dictée complète de sourate** - Exercice intensif
- **Test d'écoute** - Identifier les versets entendus

### 🧠 Mémorisation (Hifz)
- **Carte Hifz** - Visualisation de la progression de mémorisation
- **Plan de Hifz** - Planification personnalisée de mémorisation
- **Hifz Today** - Système SRS (Spaced Repetition) pour révisions
- **Habitudes** - Suivi quotidien des pratiques
- **Statistiques détaillées** - Graphiques de progression

### 🎓 Apprentissage
- **Qaida Noorani** - Cours interactif de lecture arabe (17 leçons)
- **Quiz** - Questions sur le Coran et l'Islam
- **Mode Étude** - Fiches de révision par sourate
- **Tutoriels** - Guides pour microphone et devoirs

### 👨‍👩‍👧 Gestion familiale et classes
- **Dashboard Parent** - Suivi de plusieurs enfants
- **Dashboard Enseignant** - Gestion de classes et élèves
- **Dashboard Admin** - Administration globale
- **Classes virtuelles** - Rejoindre via code d'invitation
- **Devoirs** - Attribution et suivi des assignments
- **Rapports détaillés** - Progression par enfant/élève
- **Leaderboard** - Classements et compétitions

### 🌙 Pratique spirituelle
- **Horaires de prières** - Calcul précis selon localisation
- **Athkar & Duas** - Invocations quotidiennes
- **Humeurs/Situations** - Versets selon l'état d'esprit
- **Maladies** - Versets de guérison
- **Mode Live Quran** - Radio en direct

### 👶 Mode Enfants
- **Interface adaptée** - Design coloré et simplifié
- **Histoires des prophètes** - Récits illustrés
- **Quiz enfants** - Questions adaptées à l'âge
- **Checklist** - Suivi des pratiques quotidiennes
- **Carte mosquée** - Localiser les mosquées à proximité
- **Guide Hajj/Umra** - Explication des rituels
- **Duas enfants** - Invocations simplifiées
- **Guide prière** - Apprentissage de la salat

### 🌍 Communauté
- **Forums** - Discussion par thèmes
- **Partage** - Publier des réflexions
- **Interactions** - Likes, commentaires
- **Profils** - Suivre d'autres utilisateurs

### ⚙️ Personnalisation
- **6 langues** - Français, Anglais, Néerlandais, Arabe, Turc, Ourdou
- **Thèmes** - Clair/Sombre avec personnalisation
- **Fonds d'écran** - Collection d'images islamiques
- **Avatars** - Personnalisation du profil
- **Paramètres avancés** - Contrôle fin de l'expérience

## 📊 Structure du projet

### Pages (59 fichiers)
```
src/pages/
├── Home.tsx                      # Page d'accueil principale
├── Auth.tsx                       # Authentification (login/signup)
├── Quran.tsx                      # Lecteur Coran principal (46KB)
├── MushafPage.tsx                 # Mode Mushaf (44KB)
├── Recitation.tsx                 # Mode récitation vocale (47KB)
├── Reading.tsx                    # Lecture par sourate
├── Listening.tsx                  # Écoute avancée
├── Quiz.tsx                       # Quiz interactif (24KB)
├── Learn.tsx / LearnDetail.tsx   # Apprentissage par sourate
├── Study.tsx                      # Mode étude
├── Noorani.tsx / NooraniLesson.tsx # Qaida Noorani
├── HifzMap.tsx                    # Carte de mémorisation
├── HifzPlanPage.tsx               # Planification Hifz
├── HifzTodayPage.tsx              # Révisions SRS
├── Habits.tsx                     # Suivi des habitudes (32KB)
├── Prayers.tsx / PrayerSettings.tsx # Prières
├── Moods.tsx / MoodDetail.tsx / MoodRead.tsx # États d'âme
├── MaladieDetail.tsx              # Versets de guérison
├── AthkarDetail.tsx               # Détail Athkar
├── LiveQuran.tsx                  # Radio en direct
├── Juz.tsx                        # Navigation Juz/Hizb
├── FindAyahPage.tsx               # Recherche d'Ayah
├── QuranHub.tsx                   # Hub central Coran
├── Bookmarks.tsx                  # Signets
├── FavoritesNotesPage.tsx         # Favoris et notes
├── Leaderboard.tsx                # Classement général
├── PerfectLeaderboard.tsx         # Classement parfait
├── ParentDashboard.tsx            # Dashboard parent
├── FamilyDashboard.tsx            # Dashboard famille (23KB)
├── ChildDetail.tsx / ChildReport.tsx # Détails enfant
├── TeacherDashboardPage.tsx       # Dashboard enseignant
├── AdminDashboardPage.tsx         # Dashboard admin (12KB)
├── Classrooms.tsx / ClassroomDetail.tsx # Gestion classes (27KB)
├── JoinClassroom.tsx              # Rejoindre une classe
├── AssignmentsTutorial.tsx        # Tutoriel devoirs
├── CommunityPage.tsx / CommunityDetail.tsx # Communauté
├── Announcements.tsx              # Annonces
├── KidsHomePage.tsx               # Accueil mode enfants
├── KidsPrayerPage.tsx             # Guide prière enfants
├── KidsHajjUmraPage.tsx           # Guide Hajj enfants
├── KidsDuasPage.tsx               # Duas enfants
├── KidsProphetStoriesPage.tsx     # Histoires prophètes
├── KidsProphetStoryDetail.tsx     # Détail histoire
├── KidsQuizPage.tsx               # Quiz enfants
├── KidsChecklist.tsx              # Checklist enfants
├── KidsMosqueMapPage.tsx          # Carte mosquées
├── Settings.tsx                   # Paramètres (16KB)
├── NotificationSettings.tsx       # Paramètres notifications
├── FaqAndTermsPage.tsx            # FAQ et conditions
├── InstallAppPage.tsx             # Installation PWA
├── More.tsx                       # Menu complémentaire
└── NotFound.tsx / Index.tsx / Progress.tsx
```

### Composants (53 fichiers)
```
src/components/
├── AudioPlayer.tsx                # Lecteur audio (21KB)
├── MushafReader.tsx               # Lecteur Mushaf (31KB)
├── AyahRenderer.tsx               # Rendu d'Ayah (14KB)
├── DictationMode.tsx              # Mode dictée (23KB)
├── TahaddiMode.tsx                # Mode défi (29KB)
├── FullSurahDictation.tsx         # Dictée complète (44KB)
├── HifzControl.tsx                # Contrôles Hifz (29KB)
├── DailyTarteelChallenge.tsx      # Défi quotidien (17KB)
├── FindAyah.tsx                   # Recherche Ayah (16KB)
├── MiniPlayer.tsx                 # Mini lecteur flottant
├── BottomNav.tsx                  # Navigation inférieure
├── StudySheet.tsx                 # Fiche d'étude
├── TafsirSheet.tsx                # Fiche Tafsir
├── TajwidBar.tsx / TajwidTutorialSheet.tsx # Tajwid
├── WeeklyChallengeCard.tsx        # Défi hebdomadaire
├── PersonalStatsDashboard.tsx     # Statistiques personnelles
├── HifzHabitCard.tsx              # Carte habitude Hifz
├── ClassLeaderboardFullscreen.tsx # Classement classe
├── ActiveChildBanner.tsx          # Bannière enfant actif
├── AsrReportButton.tsx            # Bouton rapport ASR
├── AudioLevelIndicator.tsx        # Indicateur niveau audio
├── AyahFeedback.tsx               # Feedback sur Ayah
├── BackgroundPicker.tsx           # Sélecteur fond d'écran
├── Confetti.tsx                   # Animation confettis
├── DedicationPopup.tsx            # Popup dédicace
├── FloatingXpWidget.tsx           # Widget XP flottant
├── HijriCalendar.tsx              # Calendrier hégirien
├── IslamicAvatarPicker.tsx        # Sélecteur avatar
├── KidsMosqueLeafletMap.tsx       # Carte Leaflet mosquées
├── LanguageSwitcher.tsx           # Changement de langue
├── LigueBadge.tsx                 # Badge ligue
├── MicPermissionModal.tsx         # Permissions micro
├── MicTutorial.tsx                # Tutoriel micro
├── ModeSelector.tsx               # Sélecteur de rôle
├── NavLink.tsx                    # Lien navigation
├── OfflineMoodDownloader.tsx      # Téléchargement hors ligne
├── ParentStatsPlaceholder.tsx     # Placeholder stats parent
├── ProgressBarDuolingo.tsx        # Barre de progression
├── ProphetFlashcards.tsx          # Cartes flash prophètes
├── ReadOnlyMode.tsx               # Mode lecture seule
├── ReciterPicker.tsx              # Sélecteur récitateur
├── RoundActionButton.tsx          # Bouton action rond
├── StickerReward.tsx              # Récompense autocollant
├── SurahCard.tsx                  # Carte sourate
├── TajwidAyahText.tsx             # Texte Ayah avec Tajwid
├── TeacherStatsSection.tsx        # Section stats enseignant
├── VoiceProfileSettings.tsx       # Paramètres profil vocal
├── WeakCardsPanel.tsx             # Panneau cartes faibles
├── WeakSurahsSection.tsx          # Section sourates faibles
└── ui/                            # Composants UI (shadcn/ui)
```

### Hooks personnalisés
```typescript
src/hooks/
├── useLanguage.tsx         # Gestion multilingue (6 langues)
├── useActiveChild.tsx      # Contexte enfant actif
├── useGlobalAudio.tsx      # Lecteur audio global
├── useUserMode.tsx         # Rôle utilisateur (solo/parent/teacher/kid/admin)
├── useAdminSettings.tsx    # Paramètres admin
├── usePrayerTimes.tsx      # Calcul horaires prières
└── ...
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase (base de données)

### Installation locale
```bash
# Cloner le repository
git clone https://github.com/vivonswebdev/taaloum.git
cd taaloum

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# Lancer en développement
npm run dev
```

### Déploiement sur Lovable
1. Connectez votre compte GitHub à Lovable
2. Importez le repository `vivonswebdev/taaloum`
3. Lovable détectera automatiquement la configuration Vite
4. Configurez les variables d'environnement dans Lovable
5. Déployez en un clic

## 🔧 Configuration

### Variables d'environnement
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

### Structure de la base de données Supabase

Tables principales :
- `users` - Profils utilisateurs
- `children` - Profils enfants
- `classrooms` - Classes virtuelles
- `classroom_students` - Relations élèves-classes
- `hifz_progress` - Progression mémorisation
- `habits` - Suivi habitudes
- `bookmarks` - Signets
- `notes` - Notes personnelles
- `announcements` - Annonces
- `community_posts` - Publications communauté
- `admin_settings` - Paramètres globaux

## 🎨 Technologies utilisées

### Frontend
- **React 18** - Library UI
- **TypeScript** - Typage statique
- **Vite** - Build tool rapide
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Composants UI accessibles
- **Framer Motion** - Animations fluides
- **Lucide React** - Icônes

### Backend & Services
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Storage)
- **Tanstack Query** - Gestion état serveur
- **Tarteel AI** - Reconnaissance vocale coranique
- **Quran.com API** - Données coraniques

### Autres
- **React Router v6** - Routing SPA
- **date-fns** - Manipulation dates
- **Leaflet** - Cartes interactives
- **Howler.js** - Audio avancé

## 📱 Progressive Web App (PWA)

L'application est configurée comme PWA avec :
- Installation sur écran d'accueil
- Mode hors ligne pour contenu téléchargé
- Notifications push
- Expérience native sur mobile

## 🌐 Internationalisation

Langues supportées :
- 🇫🇷 Français (par défaut)
- 🇬🇧 English
- 🇳🇱 Nederlands
- 🇸🇦 العربية (RTL)
- 🇹🇷 Türkçe
- 🇵🇰 اردو (RTL)

## 🔐 Sécurité et Permissions

### Rôles utilisateurs
- **Solo** - Utilisateur individuel standard
- **Parent** - Accès dashboard parent et enfants
- **Teacher** - Gestion classes et élèves
- **Kid** - Interface simplifiée enfant
- **Admin** - Accès administration globale

### Permissions microphone
L'application demande l'accès au microphone pour :
- Évaluation de récitation
- Modes dictée et tahaddi
- Enregistrement de profil vocal

## 📈 Métriques et Gamification

### Système de points (XP)
- Quiz : 10-50 XP par réponse
- Récitation : 5-20 XP par Ayah
- Hifz : 100 XP par page mémorisée
- Habitudes : 10 XP par jour

### Ligues et classements
- Bronze, Argent, Or, Platine, Diamant
- Classements hebdomadaires et mensuels
- Badges de réussite

## 🐛 Débogage

Activer les logs en développement :
```typescript
// Dans src/main.tsx ou App.tsx
if (import.meta.env.DEV) {
  console.log('Mode développement activé');
}
```

## 🤝 Contribution

Contributions bienvenues ! Pour contribuer :
1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez (`git commit -m 'Add AmazingFeature'`)
4. Pushez (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence privée. Tous droits réservés.

## 📞 Support

Pour toute question ou support :
- GitHub Issues : [Issues](https://github.com/vivonswebdev/taaloum/issues)
- Email : support@taaloum.app

## 🙏 Remerciements

- Communauté Quran.com pour les données coraniques
- Tarteel.ai pour la technologie de reconnaissance vocale
- Tous les contributeurs et testeurs

---

**Qu'Allah accepte nos efforts et fasse de cette application un moyen bénéfique pour apprendre et pratiquer Sa Parole. Ameen.** 🤲