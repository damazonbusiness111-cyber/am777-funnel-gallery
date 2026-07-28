import type { NextConfig } from "next";

const REPO = "am777-funnel-gallery";

const nextConfig: NextConfig = {
  output: "export",
  basePath: `/${REPO}`,
  assetPrefix: `/${REPO}/`,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
