import path from "path";
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { ALLOWED_IMAGE_HOSTS } from "./constants/images";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default withBundleAnalyzer(nextConfig);
