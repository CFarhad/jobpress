/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Hide the "X-Powered-By: Next.js" header
  poweredByHeader: false,

  images: {
    remotePatterns: [
      // Hero image from the design file
      { protocol: "https", hostname: "lh3.googleusercontent.com" },

      // Add more hosts here if you use them later, for example:
      // { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Basic security headers for every route
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;