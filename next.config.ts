import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone server bundle only for the Docker image; local and CI builds stay as usual.
  ...(process.env.DOCKER_BUILD === "1" && { output: "standalone" as const }),
  /* config options here */
  cacheComponents: false,
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
