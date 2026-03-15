import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ucarecdn.com' },
      { protocol: 'https', hostname: 'jxx473cnu8.ucarecdn.net' },
      { protocol: 'https', hostname: 'jxx473cnu8.ucarecd.net' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'images.clerk.dev' },
      { protocol: 'https', hostname: 'uploadcare.com' },
    ],
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  webpack: (config, { isServer }) => {
    config.resolve.modules = ['node_modules', 'src'];
    
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@prisma/client': false,
      };
    }

    if (process.platform === 'win32') {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/Application Data/**',
          '**/Cookies/**',
          '**/My Documents/**',
          '**/Local Settings/**',
          '**/Ambiente de Rede/**',
          '**/Recent/**',
          '**/src/generated/prisma/**',
          '**/generated/prisma/**',
        ],
      };
    }

    return config;
  },
};

export default nextConfig;