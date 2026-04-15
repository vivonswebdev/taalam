import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.taalam.eu',
  appName: 'Taalam',
  webDir: 'dist',
  // ✅ Version ajoutée pour App Store Connect
  // Incrémenter versionCode à chaque build soumis
  version: '1.0.0',
  ios: {
    minVersion: '16.0',
  },
  android: {
    minWebViewVersion: '80',
    // versionCode Android (entier, incrémental)
    versionCode: 1,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
      backgroundColor: '#f5f0e8',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#C8A96E',
      sound: 'azan.wav',
    },
    SpeechRecognition: {
      language: 'ar-SA',
    },
  },
};

export default config;
