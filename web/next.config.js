/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure headers to fix the Permissions-Policy issue
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      }
    ];
  },
  // Image optimization config
  images: {
    domains: [],
    remotePatterns: [],
    unoptimized: process.env.NODE_ENV === 'development'
  }
};

module.exports = nextConfig; 