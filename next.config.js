/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['cheerio', 'axios', 'undici'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // На клиенте не нужно включать эти модули
      config.resolve.alias = {
        ...config.resolve.alias,
        'cheerio': false,
        'axios': false,
        'undici': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;