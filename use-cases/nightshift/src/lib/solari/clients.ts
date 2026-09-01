import { Solari } from "@solarisdk/browser";
import { SandboxClient } from "@solarisdk/sandbox";
import { DesktopClient } from "@solarisdk/desktop";

const BASE_URL = "https://api.getsolari.com";

export function getSolariApiKey() {
  const key = process.env.SOLARI_API_KEY;
  if (!key) throw new Error("SOLARI_API_KEY is not configured");
  return key;
}

export function createBrowserClient() {
  return new Solari({
    apiKey: getSolariApiKey(),
    baseUrl: BASE_URL,
  });
}

export function createSandboxClient() {
  return new SandboxClient({
    apiKey: getSolariApiKey(),
    baseUrl: BASE_URL,
  });
}

export function createDesktopClient() {
  return new DesktopClient({
    apiKey: getSolariApiKey(),
    baseUrl: BASE_URL,
  });
}

export function appBaseUrl() {
  return (
    process.env.PORTAL_PUBLIC_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}

export function isLocalPortalUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
  } catch {
    return true;
  }
}
