import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  experimental: {
    // Support for optimized server rendering
  },
  // Increase static generation timeout to 120 seconds
  staticPageGenerationTimeout: 120,
  // Disable ISR for pages that might have issues
  output: "standalone",
};

export default nextConfig;
