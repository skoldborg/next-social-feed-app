import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'placebeard.it',
        pathname: '/**', // Allow all paths
      },
    ],
  },
}

export default nextConfig
