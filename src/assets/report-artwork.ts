import {
  observatoryArtwork,
  baziArtwork,
  libraryArtwork,
  elementArtwork,
} from "./artwork";
import fengShui from "./generated/feng-shui.webp";
import qimen from "./generated/qimen.webp";
import cycles from "./generated/knowledge-cycles.webp";
import stars from "./generated/knowledge-stars.webp";
import expert from "./generated/julia-cosmic-logo.webp";
import type { ReportArtwork } from "../services/report-artwork-files";

export const reportArtwork: ReportArtwork = {
  cover: observatoryArtwork.image.src,
  bazi: baziArtwork.image.src,
  reading: libraryArtwork.image.src,
  fengShui: fengShui.src,
  qimen: qimen.src,
  cycles: cycles.src,
  stars: stars.src,
  expert: expert.src,
  wood: elementArtwork.wood.image.src,
  fire: elementArtwork.fire.image.src,
  earth: elementArtwork.earth.image.src,
  metal: elementArtwork.metal.image.src,
  water: elementArtwork.water.image.src,
};

// SVG-as-image cannot load external images. Embed site artwork before exporting to canvas/PDF.
export async function inlineQimenArtwork(): Promise<ReportArtwork> {
  const entries = await Promise.all(
    (["qimen", "expert"] as const).map(async (key) => {
      const response = await fetch(reportArtwork[key]!);
      if (!response.ok)
        throw new Error("Не удалось загрузить иллюстрацию отчёта.");
      const blob = await response.blob();
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      return [key, data];
    }),
  );
  return Object.fromEntries(entries);
}
