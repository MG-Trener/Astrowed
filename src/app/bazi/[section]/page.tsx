import Link from "next/link";
import { notFound } from "next/navigation";
import { calculate, demoInput } from "@/domain/bazi/engine";
import { ExtendedChart } from "@/components/extended-chart";
import { PageHeading } from "@/components/expansion-pages";
const sections: Record<string, { tab: string; title: string }> = {
  "current-energies": { tab: "energies", title: "Текущие энергии" },
  "luck-pillars": { tab: "luck", title: "Десятилетние такты" },
  "life-years": { tab: "years", title: "Годы жизни" },
  stars: { tab: "stars", title: "Символические звёзды" },
  "shen-sha": { tab: "stars", title: "Шэнь Ша — символический слой" },
};
export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return { title: sections[(await params).section]?.title ?? "Ба Цзы" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const item = sections[(await params).section];
  if (!item) notFound();
  return (
    <div className="page-wrap expansion-page">
      <PageHeading
        eyebrow="БА ЦЗЫ / ПРИМЕР РАЗБОРА"
        title={item.title}
        text="Здесь показана демонстрационная карта: 17.05.1990, 10:30, Алматы. Для персонального анализа рассчитайте свою карту — все эти слои появятся под результатом."
      />
      <Link className="button primary" href="/calculator">
        Рассчитать свою карту ↗
      </Link>
      <ExtendedChart
        key={item.tab}
        chart={calculate(demoInput)}
        initial={item.tab}
        standalone
      />
    </div>
  );
}
