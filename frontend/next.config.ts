import path from "path";
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "sqwwqbxmypoatsfgukxj.supabase.co" },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default withBundleAnalyzer(nextConfig);
