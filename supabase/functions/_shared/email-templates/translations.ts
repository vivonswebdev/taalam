export type EmailLang = 'fr' | 'en' | 'ar' | 'nl' | 'tr' | 'ur'

export const DEFAULT_LANG: EmailLang = 'fr'

// RTL languages
export const RTL_LANGS: EmailLang[] = ['ar', 'ur']

export function isRtl(lang: EmailLang): boolean {
  return RTL_LANGS.includes(lang)
}

export const t: Record<string, Record<EmailLang, string>> = {
  // Common
  'common.salam': {
    fr: 'Assalamou alaykoum,',
    en: 'Assalamu alaykum,',
    ar: 'السلام عليكم،',
    nl: 'Assalamu alaykum,',
    tr: 'Selamün aleyküm,',
    ur: 'السلام علیکم،',
  },

  // Signup
  'signup.preview': {
    fr: "Confirmez votre email pour Ta'alam",
    en: "Confirm your email for Ta'alam",
    ar: 'أكّد بريدك الإلكتروني لتعلّم',
    nl: "Bevestig je e-mail voor Ta'alam",
    tr: "Ta'alam için e-postanızı onaylayın",
    ur: "تعلّم کے لیے اپنا ای میل تصدیق کریں",
  },
  'signup.heading': {
    fr: 'Assalamou alaykoum 🌙',
    en: 'Assalamu alaykum 🌙',
    ar: 'السلام عليكم 🌙',
    nl: 'Assalamu alaykum 🌙',
    tr: 'Selamün aleyküm 🌙',
    ur: 'السلام علیکم 🌙',
  },
  'signup.welcome': {
    fr: "Bienvenue sur",
    en: "Welcome to",
    ar: "مرحبًا بك في",
    nl: "Welkom bij",
    tr: "Hoş geldiniz:",
    ur: "خوش آمدید",
  },
  'signup.welcomeSuffix': {
    fr: "! Nous sommes ravis de vous accompagner dans votre parcours coranique.",
    en: "! We're delighted to support you on your Quranic journey.",
    ar: "! يسعدنا مرافقتك في رحلتك القرآنية.",
    nl: "! We zijn verheugd je te begeleiden op je Koranreis.",
    tr: "! Kur'an yolculuğunuzda size eşlik etmekten mutluluk duyarız.",
    ur: "! ہمیں آپ کے قرآنی سفر میں ساتھ دینے کی خوشی ہے۔",
  },
  'signup.confirmText': {
    fr: "Veuillez confirmer votre adresse email (",
    en: "Please confirm your email address (",
    ar: "يرجى تأكيد عنوان بريدك الإلكتروني (",
    nl: "Bevestig je e-mailadres (",
    tr: "Lütfen e-posta adresinizi doğrulayın (",
    ur: "براہ کرم اپنا ای میل ایڈریس تصدیق کریں (",
  },
  'signup.confirmTextSuffix': {
    fr: ") en cliquant sur le bouton ci-dessous :",
    en: ") by clicking the button below:",
    ar: ") بالنقر على الزر أدناه:",
    nl: ") door op de onderstaande knop te klikken:",
    tr: ") aşağıdaki düğmeye tıklayarak:",
    ur: ") نیچے بٹن پر کلک کر کے:",
  },
  'signup.button': {
    fr: 'Confirmer mon email ✨',
    en: 'Confirm my email ✨',
    ar: 'تأكيد بريدي الإلكتروني ✨',
    nl: 'Bevestig mijn e-mail ✨',
    tr: 'E-postamı onayla ✨',
    ur: 'میرا ای میل تصدیق کریں ✨',
  },
  'signup.footer': {
    fr: "Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.",
    en: "If you didn't create an account, you can safely ignore this email.",
    ar: 'إذا لم تنشئ حسابًا، يمكنك تجاهل هذا البريد بأمان.',
    nl: 'Als je geen account hebt aangemaakt, kun je deze e-mail veilig negeren.',
    tr: 'Bir hesap oluşturmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz.',
    ur: 'اگر آپ نے اکاؤنٹ نہیں بنایا، تو آپ اس ای میل کو نظرانداز کر سکتے ہیں۔',
  },

  // Recovery
  'recovery.preview': {
    fr: "Réinitialisez votre mot de passe Ta'alam",
    en: "Reset your Ta'alam password",
    ar: "إعادة تعيين كلمة مرور تعلّم",
    nl: "Stel je Ta'alam-wachtwoord opnieuw in",
    tr: "Ta'alam şifrenizi sıfırlayın",
    ur: "اپنا تعلّم پاسورڈ ری سیٹ کریں",
  },
  'recovery.heading': {
    fr: 'Réinitialisation du mot de passe 🔐',
    en: 'Password Reset 🔐',
    ar: 'إعادة تعيين كلمة المرور 🔐',
    nl: 'Wachtwoord resetten 🔐',
    tr: 'Şifre Sıfırlama 🔐',
    ur: 'پاسورڈ ری سیٹ 🔐',
  },
  'recovery.text': {
    fr: "Nous avons reçu une demande de réinitialisation de votre mot de passe Ta'alam. Utilisez le code ci-dessous dans l'application pour choisir un nouveau mot de passe.",
    en: "We received a request to reset your Ta'alam password. Use the code below in the app to choose a new password.",
    ar: "تلقينا طلبًا لإعادة تعيين كلمة مرور تعلّم الخاصة بك. استخدم الرمز أدناه في التطبيق لاختيار كلمة مرور جديدة.",
    nl: "We hebben een verzoek ontvangen om je Ta'alam-wachtwoord opnieuw in te stellen. Gebruik de onderstaande code in de app om een nieuw wachtwoord te kiezen.",
    tr: "Ta'alam şifrenizi sıfırlamak için bir talep aldık. Yeni bir şifre seçmek için uygulamada aşağıdaki kodu kullanın.",
    ur: "ہمیں آپ کے تعلّم پاسورڈ ری سیٹ کرنے کی درخواست موصول ہوئی۔ نیا پاسورڈ منتخب کرنے کے لیے ایپ میں نیچے دیا گیا کوڈ استعمال کریں۔",
  },
  'recovery.codeLabel': {
    fr: 'Votre code de vérification :',
    en: 'Your verification code:',
    ar: 'رمز التحقق الخاص بك:',
    nl: 'Je verificatiecode:',
    tr: 'Doğrulama kodunuz:',
    ur: 'آپ کا تصدیقی کوڈ:',
  },
  'recovery.footer': {
    fr: "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email. Votre mot de passe ne sera pas modifié.",
    en: "If you didn't request this, ignore this email. Your password won't be changed.",
    ar: "إذا لم تكن أنت من طلب ذلك، تجاهل هذا البريد. لن يتم تغيير كلمة مرورك.",
    nl: "Als je dit niet hebt aangevraagd, negeer deze e-mail. Je wachtwoord wordt niet gewijzigd.",
    tr: "Bu talebi siz yapmadıysanız, bu e-postayı görmezden gelin. Şifreniz değiştirilmeyecektir.",
    ur: "اگر آپ نے یہ درخواست نہیں کی، تو اس ای میل کو نظرانداز کریں۔ آپ کا پاسورڈ تبدیل نہیں ہوگا۔",
  },
  'recovery.footer': {
    fr: "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email. Votre mot de passe ne sera pas modifié.",
    en: "If you didn't request this, ignore this email. Your password won't be changed.",
    ar: "إذا لم تكن أنت من طلب ذلك، تجاهل هذا البريد. لن يتم تغيير كلمة مرورك.",
    nl: "Als je dit niet hebt aangevraagd, negeer deze e-mail. Je wachtwoord wordt niet gewijzigd.",
    tr: "Bu talebi siz yapmadıysanız, bu e-postayı görmezden gelin. Şifreniz değiştirilmeyecektir.",
    ur: "اگر آپ نے یہ درخواست نہیں کی، تو اس ای میل کو نظرانداز کریں۔ آپ کا پاسورڈ تبدیل نہیں ہوگا۔",
  },

  // Magic Link
  'magiclink.preview': {
    fr: "Votre lien de connexion Ta'alam",
    en: "Your Ta'alam login link",
    ar: "رابط تسجيل الدخول الخاص بك في تعلّم",
    nl: "Je Ta'alam-inloglink",
    tr: "Ta'alam giriş bağlantınız",
    ur: "آپ کا تعلّم لاگ ان لنک",
  },
  'magiclink.heading': {
    fr: 'Votre lien de connexion 🌙',
    en: 'Your login link 🌙',
    ar: 'رابط تسجيل الدخول 🌙',
    nl: 'Je inloglink 🌙',
    tr: 'Giriş bağlantınız 🌙',
    ur: 'آپ کا لاگ ان لنک 🌙',
  },
  'magiclink.text': {
    fr: "Cliquez sur le bouton ci-dessous pour vous connecter à Ta'alam. Ce lien expirera dans quelques minutes.",
    en: "Click the button below to log in to Ta'alam. This link will expire in a few minutes.",
    ar: "انقر على الزر أدناه لتسجيل الدخول إلى تعلّم. ستنتهي صلاحية هذا الرابط في بضع دقائق.",
    nl: "Klik op de onderstaande knop om in te loggen bij Ta'alam. Deze link verloopt over enkele minuten.",
    tr: "Ta'alam'a giriş yapmak için aşağıdaki düğmeye tıklayın. Bu bağlantı birkaç dakika içinde geçerliliğini yitirecektir.",
    ur: "تعلّم میں لاگ ان کرنے کے لیے نیچے بٹن پر کلک کریں۔ یہ لنک چند منٹوں میں ختم ہو جائے گا۔",
  },
  'magiclink.button': {
    fr: 'Se connecter',
    en: 'Log in',
    ar: 'تسجيل الدخول',
    nl: 'Inloggen',
    tr: 'Giriş yap',
    ur: 'لاگ ان کریں',
  },
  'magiclink.footer': {
    fr: "Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email en toute sécurité.",
    en: "If you didn't request this link, you can safely ignore this email.",
    ar: "إذا لم تطلب هذا الرابط، يمكنك تجاهل هذا البريد بأمان.",
    nl: "Als je deze link niet hebt aangevraagd, kun je deze e-mail veilig negeren.",
    tr: "Bu bağlantıyı talep etmediyseniz, bu e-postayı güvenle görmezden gelebilirsiniz.",
    ur: "اگر آپ نے یہ لنک نہیں مانگا، تو آپ اس ای میل کو نظرانداز کر سکتے ہیں۔",
  },

  // Invite
  'invite.preview': {
    fr: "Vous êtes invité(e) à rejoindre Ta'alam",
    en: "You're invited to join Ta'alam",
    ar: "تمت دعوتك للانضمام إلى تعلّم",
    nl: "Je bent uitgenodigd voor Ta'alam",
    tr: "Ta'alam'a katılmaya davet edildiniz",
    ur: "آپ کو تعلّم میں شامل ہونے کی دعوت دی گئی ہے",
  },
  'invite.heading': {
    fr: 'Vous êtes invité(e) 🤝',
    en: "You're invited 🤝",
    ar: 'تمت دعوتك 🤝',
    nl: 'Je bent uitgenodigd 🤝',
    tr: 'Davet edildiniz 🤝',
    ur: 'آپ کو دعوت دی گئی ہے 🤝',
  },
  'invite.text': {
    fr: "Vous avez été invité(e) à rejoindre",
    en: "You've been invited to join",
    ar: "تمت دعوتك للانضمام إلى",
    nl: "Je bent uitgenodigd om deel te nemen aan",
    tr: "Katılmaya davet edildiniz:",
    ur: "آپ کو شامل ہونے کی دعوت دی گئی ہے",
  },
  'invite.textSuffix': {
    fr: ". Cliquez ci-dessous pour accepter l'invitation et créer votre compte.",
    en: ". Click below to accept the invitation and create your account.",
    ar: ". انقر أدناه لقبول الدعوة وإنشاء حسابك.",
    nl: ". Klik hieronder om de uitnodiging te accepteren en je account aan te maken.",
    tr: ". Daveti kabul etmek ve hesabınızı oluşturmak için aşağıya tıklayın.",
    ur: ". دعوت قبول کرنے اور اپنا اکاؤنٹ بنانے کے لیے نیچے کلک کریں۔",
  },
  'invite.button': {
    fr: "Accepter l'invitation ✨",
    en: 'Accept the invitation ✨',
    ar: 'قبول الدعوة ✨',
    nl: 'Uitnodiging accepteren ✨',
    tr: 'Daveti kabul et ✨',
    ur: 'دعوت قبول کریں ✨',
  },
  'invite.footer': {
    fr: "Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.",
    en: "If you weren't expecting this invitation, you can ignore this email.",
    ar: 'إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذا البريد.',
    nl: 'Als je deze uitnodiging niet verwachtte, kun je deze e-mail negeren.',
    tr: 'Bu daveti beklemiyorsanız, bu e-postayı görmezden gelebilirsiniz.',
    ur: 'اگر آپ کو اس دعوت کی توقع نہیں تھی، تو آپ اس ای میل کو نظرانداز کر سکتے ہیں۔',
  },

  // Email Change
  'emailChange.preview': {
    fr: "Confirmez votre changement d'email Ta'alam",
    en: "Confirm your Ta'alam email change",
    ar: "أكّد تغيير بريدك الإلكتروني في تعلّم",
    nl: "Bevestig je Ta'alam e-mailwijziging",
    tr: "Ta'alam e-posta değişikliğinizi onaylayın",
    ur: "اپنی تعلّم ای میل تبدیلی کی تصدیق کریں",
  },
  'emailChange.heading': {
    fr: "Changement d'email 📧",
    en: 'Email Change 📧',
    ar: 'تغيير البريد الإلكتروني 📧',
    nl: 'E-mailwijziging 📧',
    tr: 'E-posta Değişikliği 📧',
    ur: 'ای میل تبدیلی 📧',
  },
  'emailChange.text': {
    fr: "Vous avez demandé à changer votre adresse email de",
    en: "You requested to change your email from",
    ar: "لقد طلبت تغيير بريدك الإلكتروني من",
    nl: "Je hebt gevraagd om je e-mail te wijzigen van",
    tr: "E-posta adresinizi değiştirmek istediniz:",
    ur: "آپ نے اپنا ای میل تبدیل کرنے کی درخواست کی ہے",
  },
  'emailChange.to': {
    fr: 'vers',
    en: 'to',
    ar: 'إلى',
    nl: 'naar',
    tr: 'şuna:',
    ur: 'سے',
  },
  'emailChange.confirmText': {
    fr: 'Cliquez ci-dessous pour confirmer ce changement :',
    en: 'Click below to confirm this change:',
    ar: 'انقر أدناه لتأكيد هذا التغيير:',
    nl: 'Klik hieronder om deze wijziging te bevestigen:',
    tr: 'Bu değişikliği onaylamak için aşağıya tıklayın:',
    ur: 'اس تبدیلی کی تصدیق کے لیے نیچے کلک کریں:',
  },
  'emailChange.button': {
    fr: 'Confirmer le changement',
    en: 'Confirm the change',
    ar: 'تأكيد التغيير',
    nl: 'Wijziging bevestigen',
    tr: 'Değişikliği onayla',
    ur: 'تبدیلی کی تصدیق کریں',
  },
  'emailChange.footer': {
    fr: "Si vous n'êtes pas à l'origine de cette demande, sécurisez votre compte immédiatement.",
    en: "If you didn't request this, secure your account immediately.",
    ar: 'إذا لم تكن أنت من طلب ذلك، قم بتأمين حسابك فورًا.',
    nl: 'Als je dit niet hebt aangevraagd, beveilig dan onmiddellijk je account.',
    tr: 'Bu talebi siz yapmadıysanız, hesabınızı hemen güvence altına alın.',
    ur: 'اگر آپ نے یہ درخواست نہیں کی، تو فوری طور پر اپنا اکاؤنٹ محفوظ کریں۔',
  },

  // Reauthentication
  'reauth.preview': {
    fr: "Votre code de vérification Ta'alam",
    en: "Your Ta'alam verification code",
    ar: "رمز التحقق الخاص بك في تعلّم",
    nl: "Je Ta'alam-verificatiecode",
    tr: "Ta'alam doğrulama kodunuz",
    ur: "آپ کا تعلّم تصدیقی کوڈ",
  },
  'reauth.heading': {
    fr: 'Code de vérification 🔐',
    en: 'Verification Code 🔐',
    ar: 'رمز التحقق 🔐',
    nl: 'Verificatiecode 🔐',
    tr: 'Doğrulama Kodu 🔐',
    ur: 'تصدیقی کوڈ 🔐',
  },
  'reauth.text': {
    fr: 'Voici votre code pour confirmer votre identité :',
    en: 'Here is your code to confirm your identity:',
    ar: 'إليك رمزك لتأكيد هويتك:',
    nl: 'Hier is je code om je identiteit te bevestigen:',
    tr: 'Kimliğinizi doğrulamak için kodunuz:',
    ur: 'اپنی شناخت کی تصدیق کے لیے آپ کا کوڈ:',
  },
  'reauth.expiry': {
    fr: 'Ce code expirera dans quelques minutes.',
    en: 'This code will expire in a few minutes.',
    ar: 'سينتهي هذا الرمز خلال بضع دقائق.',
    nl: 'Deze code verloopt over enkele minuten.',
    tr: 'Bu kod birkaç dakika içinde geçerliliğini yitirecektir.',
    ur: 'یہ کوڈ چند منٹوں میں ختم ہو جائے گا۔',
  },
  'reauth.footer': {
    fr: "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
    en: "If you didn't request this, ignore this email.",
    ar: 'إذا لم تكن أنت من طلب ذلك، تجاهل هذا البريد.',
    nl: 'Als je dit niet hebt aangevraagd, negeer deze e-mail.',
    tr: 'Bu talebi siz yapmadıysanız, bu e-postayı görmezden gelin.',
    ur: 'اگر آپ نے یہ درخواست نہیں کی، تو اس ای میل کو نظرانداز کریں۔',
  },
}

// Email subjects per language
export const EMAIL_SUBJECTS_I18N: Record<string, Record<EmailLang, string>> = {
  signup: {
    fr: "Confirmez votre email pour Ta'alam",
    en: "Confirm your email for Ta'alam",
    ar: "أكّد بريدك الإلكتروني لتعلّم",
    nl: "Bevestig je e-mail voor Ta'alam",
    tr: "Ta'alam için e-postanızı onaylayın",
    ur: "تعلّم کے لیے اپنا ای میل تصدیق کریں",
  },
  invite: {
    fr: "Vous êtes invité(e) à rejoindre Ta'alam",
    en: "You're invited to join Ta'alam",
    ar: "تمت دعوتك للانضمام إلى تعلّم",
    nl: "Je bent uitgenodigd voor Ta'alam",
    tr: "Ta'alam'a katılmaya davet edildiniz",
    ur: "آپ کو تعلّم میں شامل ہونے کی دعوت",
  },
  magiclink: {
    fr: "Votre lien de connexion Ta'alam",
    en: "Your Ta'alam login link",
    ar: "رابط تسجيل الدخول في تعلّم",
    nl: "Je Ta'alam-inloglink",
    tr: "Ta'alam giriş bağlantınız",
    ur: "آپ کا تعلّم لاگ ان لنک",
  },
  recovery: {
    fr: "Réinitialisez votre mot de passe Ta'alam",
    en: "Reset your Ta'alam password",
    ar: "إعادة تعيين كلمة مرور تعلّم",
    nl: "Stel je Ta'alam-wachtwoord opnieuw in",
    tr: "Ta'alam şifrenizi sıfırlayın",
    ur: "اپنا تعلّم پاسورڈ ری سیٹ کریں",
  },
  email_change: {
    fr: "Confirmez votre changement d'email Ta'alam",
    en: "Confirm your Ta'alam email change",
    ar: "أكّد تغيير بريدك الإلكتروني في تعلّم",
    nl: "Bevestig je Ta'alam e-mailwijziging",
    tr: "Ta'alam e-posta değişikliğinizi onaylayın",
    ur: "اپنی تعلّم ای میل تبدیلی کی تصدیق کریں",
  },
  reauthentication: {
    fr: "Votre code de vérification Ta'alam",
    en: "Your Ta'alam verification code",
    ar: "رمز التحقق الخاص بك في تعلّم",
    nl: "Je Ta'alam-verificatiecode",
    tr: "Ta'alam doğrulama kodunuz",
    ur: "آپ کا تعلّم تصدیقی کوڈ",
  },
}

/** Helper to get a translated string, falling back to French */
export function tr(key: string, lang: EmailLang = DEFAULT_LANG): string {
  return t[key]?.[lang] ?? t[key]?.fr ?? key
}
