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
        hostname: 'jxx473cnu8.ucarecdn.net',  // Add your custom subdomain
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
};

export default nextConfig;