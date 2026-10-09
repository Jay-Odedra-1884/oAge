/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // anon-aadhaar generates ZK proofs via WASM in the browser
    config.experiments = { ...config.experiments, asyncWebAssembly: true }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        readline: false,
        encoding: false,
        'pino-pretty': false,
      }
    }
    return config
  },
}

module.exports = nextConfig
