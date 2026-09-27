import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three's example modules ship as untranspiled ESM
  transpilePackages: ["three"],
};

export default nextConfig;
