import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const root = `${basePath}/`;

  return {
    id: root,
    name: "Astrowed — Digital Destiny Lab",
    short_name: "Astrowed",
    description:
      "Ба Цзы, Фэн Шуй и Ци Мэнь Дунь Цзя — мобильная версия Astrowed.",
    start_url: root,
    scope: root,
    display: "standalone",
    background_color: "#0b1410",
    theme_color: "#0b1410",
    lang: "ru",
    icons: [
      {
        src: `${basePath}/pwa/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${basePath}/pwa/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${basePath}/pwa/icon-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
