/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "leaeedwlnglzvoeqltsy.supabase.co",
        pathname: "/storage/v1/object/public/flip-images/**",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "i.ebayimg.com",
      },
    ],
  },
};

module.exports = nextConfig;
