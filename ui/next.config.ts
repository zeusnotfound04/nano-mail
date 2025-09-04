// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['assets.aceternity.com'],
  },
    eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
