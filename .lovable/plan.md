

## Plan : Widget Hifz SRS sur la page d'accueil

### Changement

Ajouter un widget compact entre le bloc Hifz Plan (BLOC 3) et le bloc Communauté (BLOC 4) dans `src/pages/Home.tsx`.

### Implémentation

**1. Import** : Ajouter `useHifzSRS` dans Home.tsx.

**2. Widget** : Après le BLOC 3 (ligne ~401), insérer un bandeau conditionnel qui s'affiche uniquement si l'utilisateur a des items SRS (`items.length > 0`).

Structure du widget :
- Bandeau pleine largeur style `bg-gradient-to-r from-violet-700/40 to-purple-900/20 border border-violet-400/30 rounded-2xl p-4`
- Icône 🧠 à gauche
- Texte principal : nombre de passages à réviser aujourd'hui (`todayItems.length`)
- Stats secondaires : learning / reviewing / mastered counts
- Bouton "Réviser →" qui navigue vers `/hifz-today`

**3. i18n** : Textes en dur pour cette itération (cohérent avec le style existant des autres widgets Home qui utilisent déjà du texte FR en dur comme "Lire le Coran (Mushaf)").

