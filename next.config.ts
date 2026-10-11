import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "ae01.alicdn.com" },
      { protocol: "https", hostname: "*.alicdn.com" },
      { protocol: "https", hostname: "ae-pic-a1.aliexpress-media.com" },
      { protocol: "https", hostname: "*.aliexpress-media.com" },
    ],
  },
};

export default nextConfig;
