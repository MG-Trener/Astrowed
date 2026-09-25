import Link from "next/link";
import { PageHeading } from "@/components/expansion-pages";
import { ReportPreview } from "@/components/report-preview";
import { calculate, demoInput } from "@/domain/bazi/engine";
export const metadata = { title: "PDF-отчёты — три формата" };
export default function Page() {
  return (
    <div className="page-wrap expansion-page">
      <PageHeading
        eyebrow="ASTROWED / ПЕРСОНАЛЬНЫЙ ОТЧЁТ"
        title="Вся картина. В одном документе."
        text="Краткий, полный и профессиональный формат. Ниже — демонстрационный отчёт; свой документ можно сформировать во вкладке PDF после расчёта личной карты."
      />
      <Link href="/calculator" className="button primary">
        Рассчитать свою карту ↗
      </Link>
      <section className="exp-section">
        <ReportPreview chart={calculate(demoInput)} />
      </section>
    </div>
  );
}
