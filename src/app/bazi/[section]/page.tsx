import { notFound } from "next/navigation";
import { PersonalSection } from "@/components/personal-pages";

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
        eyebrow="БА ЦЗЫ / ВАША КАРТА"
        title={item.title}
        text="Разбор по вашему последнему расчёту в этой вкладке."
      />
      <PersonalSection tab={item.tab} />
    </div>
  );
}
