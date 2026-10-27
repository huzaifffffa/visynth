import type { NextConfig } from "next";

const IMMUTABLE_CACHE_HEADER = {
  key: "Cache-Control",
  value: "public, max-age=31536000, immutable",
};

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        source: "/frames/:path*",
        headers: [IMMUTABLE_CACHE_HEADER],
      },
      {
        source: "/portfolio/:path*",
        headers: [IMMUTABLE_CACHE_HEADER],
      },
      {
        source: "/:file(visynth-logo.png|visynth-wordmark.png|icon.png|apple-icon.png|favicon.ico)",
        headers: [IMMUTABLE_CACHE_HEADER],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
