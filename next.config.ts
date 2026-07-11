import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://examai-6a0b5.firebaseapp.com/__/auth/:path*',
      },
    ];
  },
};

export default nextConfig;

