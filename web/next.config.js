/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  crossOrigin: 'anonymous',
  images: {
    domains: ['localhost', 'vercel.app'],
  },
  output: 'standalone',
};

module.exports = nextConfig;
