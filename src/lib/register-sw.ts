// Only registrar of the offline service worker. Refuses in dev/preview contexts.
const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;

function isRefused(): boolean {
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const h = window.location.hostname.toLowerCase();
  const label = h.split(".")[0];
  const lovableHost = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"].some((d) => h.endsWith(d));
  if (lovableHost && PREVIEW_LABEL.test(label)) return true;
  if (lovableHost && /^project--.+-dev$/.test(label)) return true;
  if (h === "lovableproject.com" || h.endsWith(".lovableproject.com")) return true;
  if (h === "lovableproject-dev.com" || h.endsWith(".lovableproject-dev.com")) return true;
  if (h === "beta.lovable.dev" || h.endsWith(".beta.lovable.dev")) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (isRefused()) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => r.active?.scriptURL.endsWith("/sw.js") || r.installing?.scriptURL.endsWith("/sw.js"))
        .map((r) => r.unregister()),
    );
    return;
  }
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
