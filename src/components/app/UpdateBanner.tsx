import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

export function UpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(registration => {
      // Check if a SW is already waiting
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowUpdate(true);
      }

      // Listen for new installations
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShowUpdate(true);
          }
        });
      });
    });

    // Check for updates every 60 seconds
    const interval = setInterval(() => {
      navigator.serviceWorker.ready.then(r => r.update()).catch(() => {});
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    if (!waitingWorker) {
      forceHardReload();
      return;
    }

    waitingWorker.postMessage({ type: 'SKIP_WAITING' });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    }, { once: true });

    setShowUpdate(false);
  };

  const forceHardReload = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));
      window.location.reload();
    } catch {
      window.location.href = window.location.href + '?nocache=' + Date.now();
    }
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-primary text-primary-foreground shadow-lg"
        >
          <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">🚀 Nouvelle version disponible !</p>
              <p className="text-xs opacity-80">Mettez à jour pour profiter des dernières améliorations</p>
            </div>
            <button
              onClick={handleUpdate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-foreground text-primary text-xs font-bold shrink-0 ml-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Mettre à jour
            </button>
            <button
              onClick={() => setShowUpdate(false)}
              className="text-primary-foreground/60 hover:text-primary-foreground transition ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
