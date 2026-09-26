import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import path from "node:path";

export default function config(phase: string): NextConfig {
  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH ??
    (phase === PHASE_DEVELOPMENT_SERVER ? "/Astrowed" : "");
  return {
    output: "export",
    env: { NEXT_PUBLIC_BASE_PATH: basePath },
    basePath,
    trailingSlash: true,
    poweredByHeader: false,
    devIndicators: false,
    images: { unoptimized: true },
    turbopack: { root: path.resolve(import.meta.dirname, "../..") },
  };
}
