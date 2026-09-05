// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.sweetwater.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  sassOptions: {
    implementation: 'sass',
    includePaths: ['./styles/app.scss'],
    silenceDeprecations: ['legacy-js-api', 'color-functions', 'import', 'global-builtin'],
  },
};

module.exports = nextConfig;
