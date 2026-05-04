import type { NextConfig } from "next";

// The CRM is served at https://crm.blackscale.consulting/app/ (not at root).
// basePath makes Next.js prefix every internal route, asset, and API path with /app.
const nextConfig: NextConfig = {
  basePath: "/app",
  serverExternalPackages: ["better-sqlite3", "bcryptjs", "node-cron", "web-push", "googleapis"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
