/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/docs/:path*',
        destination: 'http://localhost:3001/docs/:path*',
      },
      {
        source: '/docs',
        destination: 'http://localhost:3001/docs',
      },
    ];
  },
};

export default nextConfig;
