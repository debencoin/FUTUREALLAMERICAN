import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Spreadsheet uploads on the admin page go through a server action.
    serverActions: { bodySizeLimit: "11mb" },
  },
};

export default nextConfig;
