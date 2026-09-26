// Shared manifest for the browser preview and offline/server PDF renderer.
export const reportArtworkFiles = {
  cover: "observatory.webp",
  bazi: "bazi-pillars.webp",
  fengShui: "feng-shui.webp",
  qimen: "qimen.webp",
  cycles: "knowledge-cycles.webp",
  stars: "knowledge-stars.webp",
  reading: "library-cosmos.webp",
  expert: "julia-cosmic-logo.webp",
  wood: "wood.webp",
  fire: "fire.webp",
  earth: "earth.webp",
  metal: "metal.webp",
  water: "water.webp",
} as const;
export type ReportArtwork = Partial<
  Record<keyof typeof reportArtworkFiles, string>
>;
