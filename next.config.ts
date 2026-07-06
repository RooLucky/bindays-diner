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
  images: {
    remotePatterns: getR2RemotePattern(),
  },
};

export default nextConfig;
