/**
 * Service Worker registration & update handler for KrishiSanjivni PWA.
 * Uses vite-plugin-pwa's virtual module for seamless integration.
 */

import { registerSW as viteRegisterSW } from 'virtual:pwa-register';

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service workers are not supported in this browser');
    return;
  }

  const updateSW = viteRegisterSW({
    // Called when a new service worker is available
    onNeedRefresh() {
      // Prompt the user to update
      const shouldUpdate = window.confirm(
        'A new version of KrishiSanjivni is available!\nReload to update?'
      );
      if (shouldUpdate) {
        updateSW(true);
      }
    },

    // Called when the app is ready to work offline
    onOfflineReady() {
      console.log('[SW] App is ready for offline use');
      // Dispatch custom event so React components can show a toast
      window.dispatchEvent(new CustomEvent('krishi-offline-ready'));
    },

    // Called when there's a registration error
    onRegisterError(error) {
      console.error('[SW] Registration failed:', error);
    },

    // Check for updates immediately and then periodically
    immediate: true,
  });

  // Check for SW updates every 60 minutes
  setInterval(() => {
    updateSW(false);
  }, 60 * 60 * 1000);

  console.log('[SW] Service worker registration initiated');
}
