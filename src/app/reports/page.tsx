import Link from "next/link";
import { PageHeading } from "@/components/expansion-pages";
import { PersonalReport } from "@/components/personal-pages";
export const metadata = { title: "PDF-отчёты — три формата" };
export default function Page() {
  return (
    <div className="page-wrap expansion-page">
      <PageHeading
        eyebrow="ASTROWED / ПЕРСОНАЛЬНЫЙ ОТЧЁТ"
        title="Вся картина. В одном документе."
        text="Краткий, полный и профессиональный формат по вашей рассчитанной карте."
      />
      <Link href="/calculator" className="button primary">
        Рассчитать свою карту ↗
      </Link>
      <section className="exp-section">
        <PersonalReport />
      </section>
    </div>
  );
}
