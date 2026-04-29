/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Coolify/Docker deployment
  output: "standalone",

  // Allow Google profile images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },

    ],
  },

  // Server Actions configuration
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // For receipt image uploads
    },
  },
};

export default nextConfig;
