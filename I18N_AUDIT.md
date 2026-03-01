# 🌍 Audit d'internationalisation (i18n) - Taaloum

## 📋 Vue d'ensemble

Taaloum supporte actuellement **6 langues** :
- 🇫🇷 **Français** (par défaut)
- 🇬🇧 **English**
- 🇳🇱 **Nederlands**
- 🇸🇦 **العربية** (Arabe - RTL)
- 🇹🇷 **Türkçe**
- 🇵🇰 **اردو** (Ourdou - RTL)

**Système actuel** : Hook personnalisé `useLanguage` avec dictionnaire de traductions intégré.

---

## ✅ Points forts du système actuel

1. **Changement de langue dynamique** sans rechargement
2. **Persistance** dans localStorage
3. **Support RTL** pour arabe et ourdou
4. **Context API** pour accès global
5. **TypeScript** avec types pour les clés de traduction

---

## 🔍 Analyse des traductions

### Structure actuelle
```typescript
// src/hooks/useLanguage.tsx
type TranslationKey = 
  | 'nav.home'
  | 'nav.quran'
  | 'nav.learn'
  // ... 500+ clés

const translations: Record<string, Record<string, string>> = {
  fr: { /* ... */ },
  en: { /* ... */ },
  nl: { /* ... */ },
  ar: { /* ... */ },
  tr: { /* ... */ },
  ur: { /* ... */ },
};
```

### Statistiques
- **Nombre de clés estimé** : ~500-600
- **Fichier actuel** : `useLanguage.tsx` (~5000 lignes estimées)
- **Taille** : Peut devenir difficile à maintenir

---

## ⚠️ Problèmes identifiés

### 1. Traductions manquantes

#### Catégories non traduites
Certaines nouvelles fonctionnalités peuvent manquer de traductions :

```typescript
// À vérifier dans chaque langue
const keysToAudit = [
  // Menu More (ajouts récents)
  'more.communityDesc',
  'more.athkar',
  'more.athkarDesc',
  'more.advancedListening',
  'more.advancedListeningDesc',
  'more.notifications',
  'more.notificationsDesc',
  'more.helpFaq',
  'more.helpFaqDesc',
  'more.noorani',
  'more.nooraniDesc',
  'more.favoritesNotes',
  'more.favoritesNotesDesc',
  'more.teacherDashboard',
  'more.teacherDashboardDesc',
  'more.installApp',
  'more.installAppDesc',
  'more.hifzSrs',
  'more.hifzSrsDesc',
  
  // Sections du menu More
  'more.sectionCommunity',
  'more.sectionQuranPractice',
  'more.sectionProgress',
  'more.sectionAccountSettings',
  'more.sectionStudyModules',
  'more.sectionFamily',
  'more.sectionInstall',
  
  // Communauté
  'community.title',
  'community.topics',
  'community.myPosts',
  'community.newPost',
  
  // Mode enfants
  'kids.stories',
  'kids.quiz',
  'kids.duas',
  'kids.hajj',
  'kids.mosque',
];
```

#### Script de vérification
```typescript
// scripts/check-translations.ts
import { translations } from '../src/hooks/useLanguage';

const languages = ['fr', 'en', 'nl', 'ar', 'tr', 'ur'];
const baseLanguage = 'fr';

const frKeys = Object.keys(translations.fr);
const missingTranslations: Record<string, string[]> = {};

languages.forEach(lang => {
  if (lang === baseLanguage) return;
  
  const missing = frKeys.filter(key => !translations[lang][key]);
  if (missing.length > 0) {
    missingTranslations[lang] = missing;
  }
});

console.log('Traductions manquantes:', missingTranslations);
```

---

### 2. Cohérence terminologique

#### Termes islamiques
Assurer l'utilisation correcte des termes :

| Français | English | Nederlands | العربية |
|----------|---------|------------|-------|
| Coran | Quran | Koran | القرآن |
| Sourate | Surah | Soera | سورة |
| Verset | Ayah/Verse | Vers | آية |
| Hifz | Memorization | Memorisatie | حفظ |
| Tajwid | Tajweed | Tajwied | تجويد |
| Juz | Juz | Joez | جزء |
| Prière | Prayer | Gebed | صلاة |
| Invocation | Dua | Smeekbede | دعاء |

#### Recommandation
Créer un glossaire centralisé :
```typescript
// src/i18n/glossary.ts
export const ISLAMIC_TERMS = {
  quran: {
    fr: 'Coran',
    en: 'Quran',
    nl: 'Koran',
    ar: 'القرآن',
    tr: 'Kuran',
    ur: 'قرآن',
  },
  // ...
} as const;
```

---

### 3. Support RTL (Right-to-Left)

#### Problèmes actuels
L'arabe et l'ourdou nécessitent un layout RTL complet.

**Vérifications nécessaires** :
```typescript
// App.tsx ou Layout.tsx
useEffect(() => {
  if (language === 'ar' || language === 'ur') {
    document.dir = 'rtl';
    document.documentElement.lang = language;
  } else {
    document.dir = 'ltr';
    document.documentElement.lang = language;
  }
}, [language]);
```

**CSS pour RTL** :
```css
/* globals.css */
[dir="rtl"] .text-left {
  text-align: right;
}

[dir="rtl"] .text-right {
  text-align: left;
}

/* Marges et paddings */
[dir="rtl"] .ml-4 {
  margin-left: 0;
  margin-right: 1rem;
}

[dir="rtl"] .mr-4 {
  margin-right: 0;
  margin-left: 1rem;
}

/* Icônes de navigation */
[dir="rtl"] .chevron-right {
  transform: scaleX(-1);
}
```

**Tailwind RTL Plugin** :
```bash
npm install tailwindcss-rtl
```

```typescript
// tailwind.config.ts
import rtl from 'tailwindcss-rtl';

export default {
  plugins: [rtl],
};
```

Utilisation :
```tsx
<div className="ms-4 me-2"> {/* margin-start/end */}
  <p className="text-start"> {/* text-align start */}
```

---

### 4. Formats de date et nombres

#### Dates
Utiliser `Intl.DateTimeFormat` :

```typescript
// src/utils/dateFormatter.ts
export const formatDate = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Exemples
formatDate(new Date(), 'fr-FR'); // "1 mars 2026"
formatDate(new Date(), 'en-US'); // "March 1, 2026"
formatDate(new Date(), 'ar-SA'); // "١ مارس ٢٠٢٦"
```

#### Nombres
```typescript
export const formatNumber = (num: number, locale: string) => {
  return new Intl.NumberFormat(locale).format(num);
};

// Exemples
formatNumber(1234.56, 'fr-FR'); // "1 234,56"
formatNumber(1234.56, 'en-US'); // "1,234.56"
formatNumber(1234.56, 'ar-SA'); // "١٬٢٣٤٫٥٦"
```

#### Monnaies (si applicable)
```typescript
export const formatCurrency = (amount: number, locale: string, currency: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};
```

---

### 5. Pluralisation

#### Problème actuel
Pluriel probablement géré manuellement ou pas du tout.

**Exemple incorrect** :
```typescript
// ❌ Mauvaise pratique
t('verses.count').replace('{n}', count.toString())
// "3 verse(s)" en anglais (incorrect)
```

**Solution avec `Intl.PluralRules`** :
```typescript
// src/utils/pluralize.ts
const pluralRules: Record<string, Intl.PluralRules> = {
  fr: new Intl.PluralRules('fr-FR'),
  en: new Intl.PluralRules('en-US'),
  ar: new Intl.PluralRules('ar-SA'),
};

const pluralForms = {
  fr: {
    verses: { one: 'verset', other: 'versets' },
  },
  en: {
    verses: { one: 'verse', other: 'verses' },
  },
  ar: {
    verses: { 
      zero: 'آية',
      one: 'آية واحدة',
      two: 'آيتان',
      few: 'آيات',
      many: 'آية',
      other: 'الآيات',
    },
  },
};

export const pluralize = (
  key: string, 
  count: number, 
  locale: string
) => {
  const rule = pluralRules[locale].select(count);
  return `${count} ${pluralForms[locale][key][rule]}`;
};

// Utilisation
pluralize('verses', 1, 'fr'); // "1 verset"
pluralize('verses', 3, 'fr'); // "3 versets"
pluralize('verses', 3, 'ar'); // "٣ آيات"
```

---

## 🛠️ Recommandations d'amélioration

### 1. Migration vers i18next

**Avantages** :
- Standard de l'industrie
- Pluralisation intégrée
- Interpolation avancée
- Namespace pour organisation
- Plugins (détection langue, backend)

**Installation** :
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

**Configuration** :
```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

**Utilisation** :
```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{t('welcome', { name: 'Ahmed' })}</p>
      <p>{t('verses', { count: 3 })}</p>
    </div>
  );
}
```

---

### 2. Organisation des fichiers

Plutôt qu'un seul gros fichier, organiser par namespaces :

```
src/i18n/
├── locales/
│   ├── fr/
│   │   ├── common.json      # Navigation, boutons communs
│   │   ├── quran.json       # Tout lié au Coran
│   │   ├── auth.json        # Authentification
│   │   ├── settings.json    # Paramètres
│   │   ├── kids.json        # Mode enfants
│   │   └── community.json   # Communauté
│   ├── en/
│   │   ├── common.json
│   │   └── ...
│   └── ar/
│       ├── common.json
│       └── ...
├── config.ts
└── types.ts
```

**Exemple `fr/common.json`** :
```json
{
  "nav": {
    "home": "Accueil",
    "quran": "Coran",
    "learn": "Apprendre",
    "more": "Plus"
  },
  "actions": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Éditer"
  }
}
```

**Utilisation avec namespace** :
```tsx
const { t } = useTranslation('common');
t('nav.home'); // "Accueil"

const { t: tQuran } = useTranslation('quran');
tQuran('surah.name'); // "Sourate"
```

---

### 3. Validation des traductions

**Script npm** :
```json
// package.json
{
  "scripts": {
    "i18n:check": "node scripts/check-translations.js",
    "i18n:sort": "node scripts/sort-translations.js"
  }
}
```

**Script de vérification avancé** :
```javascript
// scripts/check-translations.js
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/i18n/locales');
const languages = ['fr', 'en', 'nl', 'ar', 'tr', 'ur'];
const namespaces = ['common', 'quran', 'auth', 'settings', 'kids', 'community'];

function getKeys(obj, prefix = '') {
  return Object.keys(obj).flatMap(key => {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      return getKeys(value, fullKey);
    }
    return [fullKey];
  });
}

const report = [];

namespaces.forEach(ns => {
  const baseFile = path.join(localesDir, 'fr', `${ns}.json`);
  const baseKeys = getKeys(JSON.parse(fs.readFileSync(baseFile, 'utf8')));
  
  languages.forEach(lang => {
    if (lang === 'fr') return;
    
    const langFile = path.join(localesDir, lang, `${ns}.json`);
    const langKeys = getKeys(JSON.parse(fs.readFileSync(langFile, 'utf8')));
    
    const missing = baseKeys.filter(k => !langKeys.includes(k));
    const extra = langKeys.filter(k => !baseKeys.includes(k));
    
    if (missing.length > 0) {
      report.push(`[${lang}/${ns}] Manquantes: ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
      report.push(`[${lang}/${ns}] En trop: ${extra.join(', ')}`);
    }
  });
});

if (report.length > 0) {
  console.error('\n⚠️  Problèmes de traduction détectés:\n');
  report.forEach(line => console.error(line));
  process.exit(1);
} else {
  console.log('✅ Toutes les traductions sont complètes!');
}
```

---

### 4. Interface de traduction collaborative

**Options** :
1. **Locize** - Service en ligne pour gérer traductions
2. **Tolgee** - Open source, self-hosted
3. **Crowdin** - Plateforme collaborative populaire

**Avantages** :
- Traducteurs non-techniques peuvent contribuer
- Suivi des traductions manquantes
- Historique des modifications
- Suggestions automatiques

---

## 📋 Checklist de complétude

### Par langue

#### Français (base)
- [ ] Toutes les pages principales traduites
- [ ] Messages d'erreur
- [ ] Tooltips et labels
- [ ] Emails de notification
- [ ] Glossaire termes islamiques cohérent

#### Anglais
- [ ] Complétude 100% par rapport au français
- [ ] Revue par native speaker
- [ ] Termes islamiques standard (Quran, Surah, Ayah)

#### Néerlandais
- [ ] Complétude 100%
- [ ] Revue par native speaker
- [ ] Adaptation culturelle (Pays-Bas vs Belgique)

#### Arabe
- [ ] Complétude 100%
- [ ] **RTL testé sur toutes les pages**
- [ ] Termes islamiques en arabe classique
- [ ] Nombres en chiffres arabes ou indiens selon préférence

#### Turc
- [ ] Complétude 100%
- [ ] Revue par native speaker
- [ ] Termes islamiques turcs standard

#### Ourdou
- [ ] Complétude 100%
- [ ] **RTL testé**
- [ ] Revue par native speaker
- [ ] Adaptation pour audience pakistanaise

---

## 👥 Workflow de traduction

### Ajouter une nouvelle clé

1. **Développeur** ajoute la clé en français (langue de référence)
```json
// fr/common.json
{
  "newFeature": {
    "title": "Nouvelle fonctionnalité",
    "description": "Description ici"
  }
}
```

2. **Script automatique** détecte clé manquante dans autres langues
```bash
npm run i18n:check
# ⚠️  [en/common] Manquantes: newFeature.title, newFeature.description
```

3. **Traducteur** ou service de traduction complète
```json
// en/common.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Description here"
  }
}
```

4. **CI/CD** valide avant merge
```yaml
# .github/workflows/i18n-check.yml
name: Check Translations
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm run i18n:check
```

---

## 📊 Tableau de bord des traductions

Créer une page admin pour suivre la complétude :

```tsx
// src/pages/AdminTranslationsPage.tsx
function AdminTranslationsPage() {
  const stats = {
    fr: { total: 587, completed: 587, percentage: 100 },
    en: { total: 587, completed: 580, percentage: 98.8 },
    nl: { total: 587, completed: 520, percentage: 88.6 },
    ar: { total: 587, completed: 505, percentage: 86.0 },
    tr: { total: 587, completed: 490, percentage: 83.5 },
    ur: { total: 587, completed: 475, percentage: 80.9 },
  };
  
  return (
    <div>
      <h1>Statut des traductions</h1>
      <table>
        <thead>
          <tr>
            <th>Langue</th>
            <th>Complétude</th>
            <th>Manquantes</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stats).map(([lang, data]) => (
            <tr key={lang}>
              <td>{lang.toUpperCase()}</td>
              <td>
                <ProgressBar value={data.percentage} />
                {data.percentage.toFixed(1)}%
              </td>
              <td>{data.total - data.completed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🚀 Plan d'action

### Phase 1 - Audit (1 semaine)
1. Exécuter script de vérification
2. Lister toutes les clés manquantes
3. Identifier les incohérences terminologiques
4. Tester RTL sur toutes les pages pour arabe/ourdou

### Phase 2 - Complétude (2 semaines)
1. Traduire toutes les clés manquantes
2. Standardiser glossaire termes islamiques
3. Implémenter corrections RTL
4. Ajouter formatage dates/nombres localisés

### Phase 3 - Optimisation (1 semaine)
1. Migration vers i18next (optionnel)
2. Mettre en place CI/CD pour validation
3. Créer documentation pour contributeurs
4. Former l'équipe sur workflow

### Phase 4 - Maintenance continue
1. Review par native speakers
2. Tests utilisateurs par langue
3. Ajustements culturels
4. Mise à jour continue

---

## 📚 Ressources

### Services de traduction
- [DeepL](https://www.deepl.com/) - Traduction IA de qualité
- [Google Translate](https://translate.google.com/)
- [Microsoft Translator](https://www.microsoft.com/en-us/translator/)

### Communautés pour revue
- Reddit r/translator
- Fiverr pour traducteurs professionnels
- Communautés musulmanes locales

### Outils
- [i18next](https://www.i18next.com/)
- [react-i18next](https://react.i18next.com/)
- [Locize](https://locize.com/)
- [Crowdin](https://crowdin.com/)

---

**Une application islamique se doit d'être accessible dans la langue de chaque musulman. L'exactitude des traductions, surtout pour les termes religieux, est cruciale.** 🤲