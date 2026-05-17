/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'portfolio-backend-2j38.onrender.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;