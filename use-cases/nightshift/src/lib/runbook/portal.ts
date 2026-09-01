import { isLocalPortalUrl } from "../solari/clients";

export function normalizePortalUrl(raw: string): string {
  const trimmed = raw.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol).href;
}

export function validateByoPortalUrl(raw: string): { url: string } | { error: string } {
  try {
    const url = normalizePortalUrl(raw);
    if (isLocalPortalUrl(url)) {
      return {
        error:
          "Solari's cloud browser cannot reach localhost. Use your deployed Nightshift URL or a public vendor portal.",
      };
    }
    return { url };
  } catch {
    return { error: "Enter a valid portal URL (e.g. https://vendor.example.com/login)." };
  }
}

/** True when the URL points at this app's built-in VendorNet demo portal. */
export function isNightshiftDemoPortal(portalUrl: string, appBase: string): boolean {
  try {
    const portal = new URL(portalUrl);
    const base = new URL(appBase);
    if (portal.origin !== base.origin) return false;
    return portal.pathname === "/portal/login" || portal.pathname.startsWith("/portal/");
  } catch {
    return false;
  }
}

export function demoPortalUrls(appBase: string) {
  const base = appBase.replace(/\/$/, "");
  return {
    login: `${base}/portal/login`,
    dashboard: `${base}/portal/dashboard`,
  };
}
