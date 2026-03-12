import { createRoot } from 'react-dom/client'
import React, { Suspense } from 'react' // 👈 Import Suspense
import App from './App.tsx'
import './index.css'
import './lib/i18n'; // 👈 CRITICAL: Import your i18n config here to initialize it

// PWA: Register service worker & initialize background sync
import { registerServiceWorker } from './lib/registerSW';
import { initBackgroundSync } from './lib/backgroundSync';

registerServiceWorker();
initBackgroundSync();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Wrap the main App component in Suspense to wait for translations to load */}
    <Suspense fallback={<div>Loading Translations...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>
);
