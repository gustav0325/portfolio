import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // 90 é usado nas camadas de arte do Hero; 75 é o padrão do next/image.
    qualities: [75, 90],
  },
  turbopack: {
    rules: {
      "*.css": {
        // CSS Modules ficam fora: o `as: "*.css"` os transformaria em CSS global.
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
