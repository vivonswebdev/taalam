import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  immediate: true,

  onNeedRefresh() {
    console.log('🔄 Nouvelle version détectée — rechargement automatique…');

    const toast = document.createElement('div');
    toast.textContent = '🔄 Mise à jour disponible — rechargement…';
    toast.style.cssText = `
      position:fixed;top:20px;left:50%;transform:translateX(-50%);
      background:#1a6b3c;color:#fff;padding:12px 24px;border-radius:8px;
      z-index:10000;font-family:sans-serif;font-size:14px;
      box-shadow:0 4px 12px rgba(0,0,0,.3);
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      updateSW(true);
      window.location.reload();
    }, 2000);
  },

  onOfflineReady() {
    console.log('✅ App prête pour utilisation offline');
  },

  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      // Check for updates every 10 minutes
      setInterval(() => {
        registration.update();
      }, 10 * 60 * 1000);
    }
  },

  onRegisterError(error) {
    console.error('❌ Erreur Service Worker:', error);
  },
});

// Also check when tab regains focus
window.addEventListener('focus', () => {
  updateSW();
});
