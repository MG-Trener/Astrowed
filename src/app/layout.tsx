import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import "@/styles/global.css";
import "@/styles/artwork.css";
import "@/styles/cosmic.css";
export const metadata: Metadata = {
  title: {
    default: "Astrowed — Обсерватория Ба Цзы",
    template: "%s · Astrowed",
  },
  description:
    "Исследуйте четыре столпа, пять элементов и циклы времени. Цифровая лаборатория Ба Цзы.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
