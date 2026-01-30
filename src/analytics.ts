export const trackPageView = (path: string) => {
  // @ts-ignore
  window.gtag("config", "G-NS1CKYFGYJ", {
    page_path: path,
  });
};
