import type { NextConfig } from "next";
const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  devIndicators: false,
  outputFileTracingIncludes: {
    "/api/reports/*": ["./src/assets/generated/observatory.webp"],
  },
};
export default config;
