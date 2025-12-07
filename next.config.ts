import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ucarecdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'jxx473cnu8.ucarecdn.net', 
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'jxx473cnu8.ucarecd.net', 
        port: '',
        pathname: '/**',
      },
    ],
  },

  experimental: {
    serverActions:{
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;