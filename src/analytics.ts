declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const trackPageView = (path: string) => {
  if (!window.gtag) return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    debug_mode: true, // REQUIRED for DebugView
  });
};
