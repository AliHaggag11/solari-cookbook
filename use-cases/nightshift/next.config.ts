import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@novnc/novnc", "rrweb"],
  outputFileTracingExcludes: {
    "*": [".data/**"],
  },
  outputFileTracingIncludes: {
    "/api/runs": [
      "./node_modules/patchright-core/browsers.json",
      "./node_modules/patchright-core/package.json",
    ],
    "/api/runs/[id]/events": [
      "./node_modules/patchright-core/browsers.json",
      "./node_modules/patchright-core/package.json",
    ],
    "/api/runs/[id]/start": [
      "./node_modules/patchright-core/browsers.json",
      "./node_modules/patchright-core/package.json",
    ],
  },
  serverExternalPackages: [
    "@solarisdk/browser",
    "@solarisdk/sandbox",
    "@solarisdk/desktop",
    "@solarisdk/core",
    "patchright-core",
    "chromium-bidi",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
