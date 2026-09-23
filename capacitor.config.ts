import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.taalam.eu',
  appName: 'Taalam',
  webDir: 'dist',
  ios: {
    minVersion: '16.0',
  },
  android: {
    minWebViewVersion: '80',
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
