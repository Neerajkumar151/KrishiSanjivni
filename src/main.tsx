import { createRoot } from 'react-dom/client'
import React, { Suspense } from 'react' // 👈 Import Suspense
import App from './App.tsx'
import './index.css'
import './lib/i18n'; // 👈 CRITICAL: Import your i18n config here to initialize it


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Wrap the main App component in Suspense to wait for translations to load */}
    <Suspense fallback={<div>Loading Translations...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>
);
