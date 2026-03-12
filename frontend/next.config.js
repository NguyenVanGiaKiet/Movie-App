/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'phim.nguonc.com' },
      { protocol: 'https', hostname: '*.nguonc.com' },
      { protocol: 'https', hostname: 'img.ophim.live' },
      { protocol: 'https', hostname: '*.ophim.live' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: '*.tmdb.org' },
    ],
  },
};

module.exports = nextConfig;
