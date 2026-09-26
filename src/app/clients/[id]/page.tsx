import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/data/db";
import { clients, charts, consultations } from "@/data/schema";
import { isAuthenticated } from "@/services/auth";
import { ConsultationForm } from "@/components/consultation-form";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/login");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = getDb();
  const [client] = await db.select().from(clients).where(eq(clients.id, id));
  if (!client) notFound();
  const [allCharts, allConsultations] = await Promise.all([
    db
      .select()
      .from(charts)
      .where(eq(charts.clientId, id))
      .orderBy(desc(charts.calculatedAt)),
    db
      .select()
      .from(consultations)
      .where(eq(consultations.clientId, id))
      .orderBy(desc(consultations.date)),
  ]);
  return (
    <div className="page-wrap">
      <Link className="back-link" href="/clients">
        ← МОИ КЛИЕНТЫ
      </Link>
      <div className="page-title" style={{ marginTop: 30 }}>
        <div>
          <div className="eyebrow">CLIENT / ЛИЧНАЯ ИСТОРИЯ</div>
          <h1>{client.name}</h1>
          <p>
            Карты: {allCharts.length} · Консультации: {allConsultations.length}
          </p>
        </div>
      </div>
      <section>
        <div className="panel-heading">
          <h2>Сохранённые карты</h2>
        </div>
        {allCharts.map((c) => (
          <Link href={`/chart/${c.id}`} className="client-row" key={c.id}>
            <div>
              <h3>{c.title}</h3>
              <p>
                {c.input.date} · {c.input.city} · {c.methodId}
              </p>
            </div>
            <span className="symbol">{c.result.dayMaster.stem}</span>
            <span>Открыть ↗</span>
          </Link>
        ))}
      </section>
      <section className="chart-section">
        <div className="panel-heading">
          <h2>История консультаций</h2>
        </div>
        {allConsultations.length ? (
          allConsultations.map((c) => (
            <article className="consultation" key={c.id}>
              <div className="eyebrow">{c.date}</div>
              <h3>{c.topic}</h3>
              <p>{c.notes}</p>
              {c.recommendations && (
                <p style={{ marginTop: 15 }}>
                  Рекомендации: {c.recommendations}
                </p>
              )}
            </article>
          ))
        ) : (
          <p className="muted">Первая консультация ещё впереди.</p>
        )}
      </section>
      <section className="chart-section">
        <div className="panel-heading">
          <h2>Новая консультация</h2>
        </div>
        <ConsultationForm clientId={id} />
      </section>
    </div>
  );
}
