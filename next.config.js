/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Add the Image Security Rules
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  
  // 2. Keep your Turbopack/Webpack logic
  turbopack: {},
  webpack(config) {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|webp|avif|svg|PNG|JPG|JPEG)$/i,
      type: 'asset/resource',
    });
    return config;
  },
};

module.exports = nextConfig;
