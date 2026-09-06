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
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
      },
      {
        protocol: 'https',
        hostname: 'images.stockx.com',
      },
      {
        protocol: 'https',
        hostname: 'store.storeimages.cdn-apple.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.roguefitness.com',
      },
      {
        protocol: 'https',
        hostname: 'eleiko.com',
      },
      {
        protocol: 'https',
        hostname: 'images.bowflex.com',
      },
      {
        protocol: 'https',
        hostname: 'www.warhammer.com',
      },
    ],
  },
};

module.exports = nextConfig;
