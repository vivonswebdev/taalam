import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.taalam.eu',
  appName: 'Taalam',
  webDir: 'dist',
  server: {
    url: 'https://afbca4fe-3b15-45a0-9b71-9cc1d9ed9493.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
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
  },
};

export default config;
