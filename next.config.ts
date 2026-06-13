import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack root to this project (a parent lockfile exists in ~/Documents)
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

// Cloudflare OpenNext: enable bindings/env access during `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
