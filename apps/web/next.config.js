/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // Matikan SWC agar tidak crash di RAM kecil / Android Termux
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
