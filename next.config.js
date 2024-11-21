// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  sassOptions: {
    fibers: false,
    implementation: 'sass',
    includePaths: ['./styles/app.scss'],
    silenceDeprecations: ['legacy-js-api'],
  },
};

module.exports = nextConfig;
