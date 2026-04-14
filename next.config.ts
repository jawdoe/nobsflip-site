import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "leaeedwlnglzvoeqltsy.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/flip-images/**",
      },
    ],
  },
};

export default nextConfig;