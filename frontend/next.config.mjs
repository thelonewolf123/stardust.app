/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, options) => {
        config.output.globalObject = 'self'
        return config
    }
}

export default nextConfig
