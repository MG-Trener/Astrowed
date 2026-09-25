import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import "@/styles/global.css";
import "@/styles/artwork.css";
import "@/styles/cosmic.css";
import "@/styles/expansion.css";
import "@/styles/music.css";
export const metadata: Metadata = {
  title: {
    default: "Astrowed — Ба Цзы, Фэн Шуй и Ци Мэнь",
    template: "%s · Astrowed",
  },
  description:
    "Человек, пространство и время. Ба Цзы, Фэн Шуй и Ци Мэнь Дунь Цзя. Эксперт проекта — Юлия Гаврилычева.",
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
