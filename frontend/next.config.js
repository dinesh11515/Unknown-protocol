/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push({
      resolve: {
        fallback: {
          "tfhe_bg.wasm": require.resolve("tfhe/tfhe_bg.wasm"),
        },
      },
    });

    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;
