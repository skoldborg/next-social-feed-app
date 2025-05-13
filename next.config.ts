import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('http://placebeard.it/**')],
  },
}

export default nextConfig
