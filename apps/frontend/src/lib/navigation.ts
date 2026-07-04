/**
 * SPA navigation helper for the lightweight pathname router in App.tsx.
 * pushState alone does not emit `popstate`, so we dispatch it manually to
 * notify the `useRoute` listener.
 */
export function navigate(path: string) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
