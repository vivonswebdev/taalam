# ♿ Audit d'accessibilité WCAG 2.1 - Taaloum

## 📋 Résumé exécutif

Ce document présente un audit d'accessibilité complet de l'application Taaloum selon les critères WCAG 2.1 niveau AA, avec une attention particulière pour les seniors et personnes en situation de handicap.

**Date de l'audit** : Mars 2026  
**Version analysée** : Dernière version sur GitHub  
**Niveau cible** : WCAG 2.1 AA

---

## 🎯 Principes WCAG

### 1. Perceptible
L'information et les composants de l'interface doivent être présentés de manière perceptible.

### 2. Utilisable
Les composants de l'interface et la navigation doivent être utilisables.

### 3. Compréhensible
L'information et l'utilisation de l'interface doivent être compréhensibles.

### 4. Robuste
Le contenu doit être assez robuste pour être interprété par diverses technologies d'assistance.

---

## ✅ Points forts actuels

### Texte et typographie
- ✅ Police system (-apple-system, BlinkMacSystemFont) lisible
- ✅ Tailles de police relativement bonnes (text-sm à text-2xl)
- ✅ Espacement entre lignes adéquat

### Navigation
- ✅ Navigation inférieure (BottomNav) claire avec icônes
- ✅ Structure de routage cohérente avec React Router
- ✅ Breadcrumbs implicites via la navigation

### Multimédia
- ✅ Lecteur audio avec contrôles (AudioPlayer.tsx)
- ✅ Possibilité de pause/lecture
- ✅ Indicateur de niveau audio (AudioLevelIndicator)

### Responsive
- ✅ Design mobile-first (max-w-lg mx-auto)
- ✅ Classes Tailwind responsives

---

## ⚠️ Problèmes critiques identifiés

### 🔴 Niveau A - Critique

#### 1.1.1 Contenu non textuel (Images)
**Problème** : Beaucoup d'icônes emoji (🕌, 📖, 🎯) sans attribut `aria-label`

**Impact** : Lecteurs d'écran ne peuvent pas décrire les icônes

**Solution** :
```tsx
// ❌ Avant
<span className="text-lg">{item.icon}</span>

// ✅ Après
<span className="text-lg" aria-label={item.iconLabel} role="img">
  {item.icon}
</span>
```

**Fichiers concernés** :
- `src/pages/More.tsx`
- `src/pages/KidsHomePage.tsx`
- Tous les composants utilisant des emojis

---

#### 1.4.3 Contraste des couleurs (Niveau AA : 4.5:1)
**Problème** : Textes `text-muted-foreground` peuvent avoir un contraste insuffisant

**Test requis** :
```css
/* Vérifier ces combinaisons */
.text-muted-foreground sur background
.text-accent sur card
```

**Solution** :
```typescript
// tailwind.config.ts - Ajuster les couleurs
export default {
  theme: {
    extend: {
      colors: {
        'muted-foreground': 'hsl(var(--muted-foreground))', // Min 4.5:1
      }
    }
  }
}
```

**Outil recommandé** : [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

#### 2.1.1 Clavier (Navigation au clavier)
**Problème** : Certains composants interactifs sans support clavier complet

**Composants à vérifier** :
- `MushafReader.tsx` - Navigation entre pages
- `AudioPlayer.tsx` - Contrôles audio
- Modals et sheets (Dialog, Sheet)

**Solution** :
```tsx
// Ajouter support clavier
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    // Page précédente
  } else if (e.key === 'ArrowRight') {
    // Page suivante
  } else if (e.key === ' ' || e.key === 'k') {
    // Play/Pause
  }
};

<div onKeyDown={handleKeyDown} tabIndex={0}>
  {/* Contenu */}
</div>
```

---

#### 2.4.1 Contourner les blocs
**Problème** : Absence de lien "Aller au contenu principal"

**Impact** : Utilisateurs clavier doivent naviguer tous les liens avant le contenu

**Solution** :
```tsx
// App.tsx
function App() {
  return (
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground"
      >
        Aller au contenu principal
      </a>
      
      <div id="main-content">
        {/* Contenu */}
      </div>
    </>
  );
}
```

**CSS utilitaire** :
```css
/* globals.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

### 🟠 Niveau AA - Important

#### 1.4.4 Redimensionnement du texte (200%)
**Problème** : Layout peut casser au zoom 200%

**Test** :
1. Zoom navigateur à 200%
2. Vérifier tous les composants
3. Tester sur mobile ET desktop

**Solution** :
```css
/* Utiliser rem au lieu de px */
.text-base { font-size: 1rem; }     /* 16px */
.text-lg { font-size: 1.125rem; }   /* 18px */
.text-xl { font-size: 1.25rem; }    /* 20px */

/* Éviter les hauteurs fixes */
.card {
  min-height: 100px; /* ✅ */
  /* height: 100px; ❌ */
}
```

---

#### 1.4.11 Contraste des éléments non textuels
**Problème** : Bordures et icônes peuvent manquer de contraste

**Exemples** :
- Bordures de cartes (`border-border`)
- Icônes d'état (checkmarks, bullets)
- Indicateurs de focus

**Solution** :
```css
/* Assurer 3:1 minimum */
.border-border {
  border-color: hsl(var(--border)); /* Min 3:1 avec background */
}

.focus-visible:focus {
  outline: 2px solid hsl(var(--ring)); /* Min 3:1 */
  outline-offset: 2px;
}
```

---

#### 2.4.7 Focus visible
**Problème** : Indicateur de focus peut être insuffisant

**Solution globale** :
```css
/* globals.css */
*:focus-visible {
  outline: 3px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: 4px;
}

/* Pour les éléments sombres */
.dark *:focus-visible {
  outline-color: hsl(var(--ring));
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.5);
}
```

---

#### 3.2.4 Identification cohérente
**Problème** : Même action peut avoir des libellés différents

**Audit nécessaire** :
- Boutons "Fermer" vs "X" vs "Annuler"
- Boutons "Suivant" vs "Continuer" vs "→"
- Boutons "Enregistrer" vs "Sauvegarder" vs "OK"

**Solution** :
```typescript
// Créer un dictionnaire de labels cohérents
const ACTION_LABELS = {
  close: { fr: 'Fermer', en: 'Close', ar: 'إغلاق' },
  next: { fr: 'Suivant', en: 'Next', ar: 'التالي' },
  save: { fr: 'Enregistrer', en: 'Save', ar: 'حفظ' },
} as const;
```

---

## 🎯 Recommandations spécifiques pour seniors

### Taille de texte minimale
```css
/* globals.css */
:root {
  --text-base-senior: 18px; /* Au lieu de 16px */
}

body.senior-mode {
  font-size: var(--text-base-senior);
}

.senior-mode .text-sm {
  font-size: 1rem; /* 18px au lieu de 14px */
}
```

### Mode senior dans Settings
```tsx
// Settings.tsx
const [seniorMode, setSeniorMode] = useState(false);

useEffect(() => {
  if (seniorMode) {
    document.body.classList.add('senior-mode');
  } else {
    document.body.classList.remove('senior-mode');
  }
}, [seniorMode]);

// UI
<div className="flex items-center justify-between">
  <div>
    <h3>Mode Seniors</h3>
    <p className="text-sm text-muted-foreground">
      Textes plus grands et interface simplifiée
    </p>
  </div>
  <Switch checked={seniorMode} onCheckedChange={setSeniorMode} />
</div>
```

### Espacement augmenté
```css
.senior-mode button,
.senior-mode .interactive-element {
  min-height: 48px; /* Au lieu de 40px */
  padding: 16px 24px; /* Plus généreux */
}

.senior-mode .gap-2 {
  gap: 1rem; /* Au lieu de 0.5rem */
}
```

---

## 🎨 Attributs ARIA à ajouter

### Navigation
```tsx
// BottomNav.tsx
<nav aria-label="Navigation principale">
  <Link 
    to="/" 
    aria-label="Accueil" 
    aria-current={location.pathname === '/' ? 'page' : undefined}
  >
    <Home size={20} />
  </Link>
  {/* ... */}
</nav>
```

### Formulaires
```tsx
// Tous les inputs
<label htmlFor="email">Email</label>
<input 
  id="email" 
  type="email"
  aria-required="true"
  aria-invalid={errors.email ? 'true' : 'false'}
  aria-describedby="email-error"
/>
{errors.email && (
  <span id="email-error" role="alert" className="text-destructive">
    {errors.email}
  </span>
)}
```

### Boutons d'action
```tsx
// Boutons sans texte
<button aria-label="Lire le verset" onClick={playAudio}>
  <Play size={20} aria-hidden="true" />
</button>

<button aria-label="Ajouter aux favoris" onClick={bookmark}>
  <Bookmark size={20} aria-hidden="true" />
</button>
```

### Listes dynamiques
```tsx
<div role="list" aria-label="Sourates du Coran">
  {surahs.map(surah => (
    <div key={surah.id} role="listitem">
      {/* Contenu */}
    </div>
  ))}
</div>
```

### États de chargement
```tsx
{isLoading && (
  <div role="status" aria-live="polite">
    <Loader className="animate-spin" aria-hidden="true" />
    <span className="sr-only">Chargement en cours...</span>
  </div>
)}
```

### Modals et dialogs
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent aria-labelledby="dialog-title" aria-describedby="dialog-description">
    <DialogTitle id="dialog-title">Titre du dialog</DialogTitle>
    <DialogDescription id="dialog-description">
      Description du contenu
    </DialogDescription>
    {/* Contenu */}
  </DialogContent>
</Dialog>
```

---

## 📱 Accessibilité mobile

### Zones tactiles
```css
/* Minimum 44x44px (iOS) ou 48x48px (Android) */
.touch-target {
  min-width: 48px;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### Gestes alternatifs
```tsx
// Éviter les gestes complexes obligatoires
// ❌ Swipe uniquement
// ✅ Swipe OU boutons

<div className="flex gap-2">
  <button onClick={prevPage} aria-label="Page précédente">
    <ChevronLeft />
  </button>
  
  <div 
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
    className="flex-1"
  >
    {/* Contenu swipeable */}
  </div>
  
  <button onClick={nextPage} aria-label="Page suivante">
    <ChevronRight />
  </button>
</div>
```

---

## 🧪 Tests d'accessibilité

### Outils automatisés
1. **axe DevTools** (Chrome Extension)
2. **WAVE** (WebAIM)
3. **Lighthouse** (Chrome DevTools)

### Tests manuels

#### Test clavier (30 min)
```
1. Débrancher la souris
2. Naviguer avec Tab/Shift+Tab
3. Activer avec Enter/Space
4. Échapper avec Esc
5. Vérifier tous les chemins critiques
```

#### Test lecteur d'écran (1h)
```
Mac: VoiceOver (Cmd + F5)
Windows: NVDA (gratuit) ou JAWS
Mobile: TalkBack (Android) ou VoiceOver (iOS)

Scénarios à tester:
- Créer un compte
- Lire une sourate
- Faire un quiz
- Naviguer le menu More
```

#### Test zoom (15 min)
```
1. Zoomer à 200% (Cmd/Ctrl + "+")
2. Vérifier layout sur toutes les pages principales
3. Zoomer à 400% (test extrême)
```

#### Test daltonisme
```
Outil: Color Oracle (gratuit)
Tester 3 types:
- Deutéranopie (rouge-vert)
- Protanopie (rouge-vert)
- Tritanopie (bleu-jaune)
```

---

## 📊 Checklist de validation

### Avant chaque release

- [ ] Tous les `img` ont un `alt`
- [ ] Tous les boutons icône ont un `aria-label`
- [ ] Navigation clavier complète testée
- [ ] Contraste vérifié (min 4.5:1 texte, 3:1 UI)
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Formulaires avec labels et erreurs accessibles
- [ ] Modals avec focus trap et Esc pour fermer
- [ ] Lecteur d'écran testé sur 5 pages principales
- [ ] Zoom 200% OK sans scroll horizontal
- [ ] Test mobile avec TalkBack/VoiceOver
- [ ] Pas de timeout < 20 secondes (ou ajustable)
- [ ] Vidéos avec sous-titres (si applicable)
- [ ] Audio avec transcription textuelle alternative

---

## 🚀 Plan d'action prioritaire

### Phase 1 - Court terme (1 semaine)
1. Ajouter `aria-label` sur tous les emojis et icônes
2. Implémenter "Aller au contenu principal"
3. Améliorer focus visible (outline 3px)
4. Audit contraste automatisé (axe DevTools)

### Phase 2 - Moyen terme (2 semaines)
1. Navigation clavier complète (AudioPlayer, MushafReader)
2. Test lecteur d'écran complet
3. Mode senior avec textes agrandis
4. Documentation accessibilité pour développeurs

### Phase 3 - Long terme (1 mois)
1. Tests utilisateurs avec personnes en situation de handicap
2. Certification WCAG 2.1 AA
3. Formation équipe développement
4. Processus de tests accessibilité continus

---

## 📚 Ressources

### Documentation
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/fr/docs/Web/Accessibility)

### Outils
- [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
- [WAVE](https://wave.webaim.org/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Oracle](https://colororacle.org/)

### Communauté
- [a11y Slack](https://web-a11y.slack.com/)
- [WebAIM Forum](https://webaim.org/discussion/)

---

**L'accessibilité n'est pas une fonctionnalité optionnelle, c'est un droit fondamental. Chaque personne mérite d'accéder au savoir du Coran, peu importe ses capacités.** 🤲