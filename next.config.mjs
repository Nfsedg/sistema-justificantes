/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/justificantes',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
