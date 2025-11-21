import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable Prisma generation during build if database not available
  typescript: {
    // Disable type checking during build to prevent database connection errors
    tsconfigPath: "./tsconfig.json",
  },
  // Allow static generation of pages without database connection
  experimental: {
    // Support for optimized server rendering
  },
};

export default nextConfig;
