/** @type {import('next').NextConfig} */

const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");


const nextConfig = {
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.join(
              path.dirname(require.resolve("pdfjs-dist/package.json")),
              "build",
              "pdf.worker.min.mjs"
            ),
            to: path.join(__dirname, "public"),
          },
        ],
      })
    );
    return config;
  },
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
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'au.int',
      },
    ],
  },

  //
  
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
