import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure development optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Use recommended development source map
      config.devtool = 'eval-cheap-module-source-map';
    }
    return config;
  },
};

export default nextConfig;
