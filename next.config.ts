import type { NextConfig } from "next";

function getR2RemotePattern() {
  if (!process.env.R2_PUBLIC_URL) {
    return [];
  }

  const url = new URL(process.env.R2_PUBLIC_URL);

  return [
    {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/**",
    },
  ];
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: getR2RemotePattern(),
  },
};

export default nextConfig;
