## ⚠️ Je ne veux PAS de texte en dur dans QuranHub.tsx ni ailleurs.

Rappel important : l’app Taaloum est MULTILINGUE (FR, AR, EN, NL, URDU, TR). On doit donc absolument garder `t("…")` et créer les clés manquantes, pas les supprimer.

Merci de remplacer TON plan par celui‑ci :

1) Garder i18n dans QuranHub.tsx

- On laisse les appels `t("quranHub.xxx")`.

- On NE remplace pas par des chaînes en dur.

- On supprime uniquement les imports inutilisés (ArrowLeft, BookOpen, etc.) si vraiment non utilisés.

2) Créer les clés i18n manquantes pour 6 langues

Dans les fichiers de langue (fr, ar, en, nl, urdu, tr), ajouter au minimum :

- `quranHub.title`

  - FR : "Coran"

  - EN : "Qur’an"

  - AR : "القرآن"

  - NL : "Koran"

  - UR : "قرآن"

  - TR : "Kur’an"

- `quranHub.subtitle`

  - FR : "Choisissez votre façon de lire le Coran"

  - EN : "Choose how you read the Qur’an"

  - AR : "اختر طريقة قراءتك للقرآن"

  - NL : "Kies hoe je de Koran wilt lezen"

  - UR : "قرآن پڑھنے کا طریقہ منتخب کریں"

  - TR : "Kur’an’ı nasıl okumak istiyorsun?"

- `quranHub.mushafTitle`

  - FR : "Mushaf"

  - EN : "Mushaf"

  - AR : "المصحف"

  - NL : "Mushaf"

  - UR : "مصحف"

  - TR : "Mushaf"

- `quranHub.mushafSubtitle`

  - FR : "Lecture simple du Coran"

  - EN : "Simple Qur’an reading"

  - AR : "قراءة القرآن فقط"

  - NL : "Eenvoudige Koranlezing"

  - UR : "سادہ قرآن کی تلاوت"

  - TR : "Sade Kur’an okuma"

- `quranHub.mushafDesc`

  - FR : "Comme un vrai mushaf, idéal pour la lecture tranquille."

  - EN : "Like a physical mushaf, ideal for calm reading."

  - AR : "مثل المصحف الورقي، مثالي لقراءة هادئة."

  - NL : "Net als een echt mushaf, ideaal om rustig te lezen."

  - UR : "بلکل مصحف کی طرح، پرسکون تلاوت کے لیے بہترین۔"

  - TR : "Gerçek mushaf gibi, sakin okumalar için ideal."

- `quranHub.readingTitle`

  - FR : "Lecture avec audio"

  - EN : "Reading with audio"

  - AR : "قراءة مع الصوت"

  - NL : "Lezen met audio"

  - UR : "آواز کے ساتھ تلاوت"

  - TR : "Sesli okuma"

- `quranHub.readingSubtitle`

  - FR : "Texte + traduction + audio"

  - EN : "Text + translation + audio"

  - AR : "نص + ترجمة + صوت"

  - NL : "Tekst + vertaling + audio"

  - UR : "متن + ترجمہ + آواز"

  - TR : "Metin + meâl + ses"

- `quranHub.readingDesc`

  - FR : "Pour lire, écouter et utiliser les outils de mémorisation."

  - EN : "For reading, listening, and using memorization tools."

  - AR : "للقراءة والاستماع واستخدام أدوات الحفظ."

  - NL : "Om te lezen, luisteren en geheugentools te gebruiken."

  - UR : "پڑھنے، سننے اور حفظ کے ٹولز استعمال کرنے کے لیے۔"

  - TR : "Okumak, dinlemek ve ezber araçlarını kullanmak için."

- `quranHub.quickLinks`

  - FR : "Accès rapide"

  - EN : "Quick access"

  - AR : "وصول سريع"

  - NL : "Snelle toegang"

  - UR : "فوری رسائی"

  - TR : "Hızlı erişim"

- `quranHub.tarteelButton`

  - FR : "Commencer votre Tarteel"

  - EN : "Start your Tarteel"

  - AR : "ابدأ ترتيلك"

  - NL : "Begin je Tarteel"

  - UR : "اپنی ترتیل شروع کریں"

  - TR : "Tarteel’e başla"

- `quranHub.tarteelShort`

  - FR : "Réciter et corriger votre lecture"

  - EN : "Recite and correct your reading"

  - AR : "رتّل وصحّح تلاوتك"

  - NL : "Reciteer en verbeter je lezing"

  - UR : "تلاوت کریں اور اپنی پڑھائی درست کریں"

  - TR : "Tilavet et ve okumanı düzelt"

- `quranHub.liveTitle`

  - FR : "Live Coran"

  - EN : "Live Qur’an"

  - AR : "القرآن المباشر"

  - NL : "Koran live"

  - UR : "لائیو قرآن"

  - TR : "Canlı Kur’an"

- `quranHub.liveShort`

  - FR : "Écouter le Coran en direct"

  - EN : "Listen to the Qur’an live"

  - AR : "استمع للقرآن مباشرة"

  - NL : "Luister live naar de Koran"

  - UR : "قرآن براہِ راست سنیں"

  - TR : "Kur’an’ı canlı dinle"

3) Utilisation dans QuranHub.tsx

Dans le composant, utiliser UNIQUEMENT `t()` :

- Header :

  - Titre : `📖 {t("quranHub.title")}`

  - Sous-titre : `{t("quranHub.subtitle")}`

- Carte Mushaf :

  - Titre : `{t("quranHub.mushafTitle")}`

  - Sous-titre (en gras) : `{t("quranHub.mushafSubtitle")}`

  - Description : `{t("quranHub.mushafDesc")}`

- Carte Lecture audio :

  - Titre : `{t("quranHub.readingTitle")}`

  - Sous-titre : `{t("quranHub.readingSubtitle")}`

  - Description : `{t("quranHub.readingDesc")}`

- Section raccourcis :

  - Titre section : `{t("quranHub.quickLinks")}`

  - Bouton Tarteel :

    - Titre : `{t("quranHub.tarteelButton")}`

    - Sous-titre : `{t("quranHub.tarteelShort")}`

  - Bouton Live :

    - Titre : `{t("quranHub.liveTitle")}`

    - Sous-titre : `{t("quranHub.liveShort")}`

4) Vérification

Après implémentation :

- tester la page en FR, EN, AR, NL au minimum,

- vérifier qu’aucune clé `quranHub.xxx` brute n’apparaît à l’écran.

En résumé : on NE met plus jamais de texte en dur pour QuranHub, tout passe par i18n, pour mes 6 langues (FR, AR, EN, NL, URDU, TR).

&nbsp;