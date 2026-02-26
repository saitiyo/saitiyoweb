/** @type {import('next').NextConfig} */
const nextConfig = {
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
