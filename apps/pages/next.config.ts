import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  output: "export",
  basePath: "/Astrowed",
  trailingSlash: true,
  poweredByHeader: false,
  devIndicators: false,
  images: { unoptimized: true },
  turbopack: { root: path.resolve(import.meta.dirname, "../..") },
};
export default config;
