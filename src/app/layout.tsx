import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import { PwaRegister } from "@/components/pwa-register";
import "@/styles/global.css";
import "@/styles/artwork.css";
import "@/styles/cosmic.css";
import "@/styles/expansion.css";
import "@/styles/music.css";
import "@/styles/sky-events.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: {
    default: "Astrowed — Ба Цзы, Фэн Шуй и Ци Мэнь",
    template: "%s · Astrowed",
  },
  description:
    "Человек, пространство и время. Ба Цзы, Фэн Шуй и Ци Мэнь Дунь Цзя. Эксперт проекта — Юлия Гаврилычева.",
  manifest: `${basePath}/manifest.webmanifest`,
  icons: {
    icon: [
      {
        url: `${basePath}/pwa/icon-64.png`,
        sizes: "64x64",
        type: "image/png",
      },
      {
        url: `${basePath}/pwa/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: `${basePath}/pwa/apple-touch-icon.png`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>
        <PwaRegister />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
