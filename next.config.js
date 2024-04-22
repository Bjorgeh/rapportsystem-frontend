const path = require('path');

const UnusedWebpackPlugin = require('unused-webpack-plugin');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.plugins.push(
        new UnusedWebpackPlugin({
          directories: [path.join(__dirname, 'src')],
          exclude: ['*.test.js'],
          root: __dirname,
        })
      );
    }
    return config;
  },
});
