import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: {
    serverActions: {},
  },
  async headers() {
    return [
      {
        // Required for Sandpack's Next.js template (Nodebox uses SharedArrayBuffer)
        source: "/freecode/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
