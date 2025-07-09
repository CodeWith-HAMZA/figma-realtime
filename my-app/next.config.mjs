// irt type { NextConfig } from "next";

const nextConfig = {
  /* config options q`here */
  experimental: {
    turbo: false, // ⛔ Temporarily disable Turbopack if it's causing issues
  },
  reactStrictMode: true,
  
};

export default nextConfig;
