import Link from "next/link";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { isAuthenticated } from "@/services/auth";
import { getDb } from "@/data/db";
import { clients } from "@/data/schema";
import { signOut } from "@/app/login/actions";
export const metadata = { title: "Мои клиенты" };
export const dynamic = "force-dynamic";
export default async function Page() {
  if (!(await isAuthenticated())) redirect("/login");
  const all = await getDb()
    .select()
    .from(clients)
    .orderBy(desc(clients.updatedAt));
  return (
    <div className="page-wrap">
      <div className="page-title">
        <div>
          <div className="eyebrow">PROFESSIONAL / КАБИНЕТ КОНСУЛЬТАНТА</div>
          <h1>Люди и их истории.</h1>
          <p>Сохранённые карты, консультации и ваши наблюдения.</p>
        </div>
        <div className="actions">
          <Link className="button primary" href="/calculator">
            Новая карта +
          </Link>
          <Link className="button" href="/admin/knowledge">
            База знаний
          </Link>
          <form action={signOut}>
            <button className="button">Выйти</button>
          </form>
        </div>
      </div>
      {all.length ? (
        <div className="client-list">
          {all.map((c, i) => (
            <Link className="client-row" key={c.id} href={`/clients/${c.id}`}>
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <div style={{ flex: 1 }}>
                <h3>{c.name}</h3>
                <p>
                  {c.email ?? "Профиль клиента"} · создан{" "}
                  {c.createdAt.toLocaleDateString("ru-RU", { timeZone: "UTC" })}
                </p>
              </div>
              <span className="symbol">命</span>
              <span>↗</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Здесь начнутся ваши истории.</h2>
          <p>
            Рассчитайте и сохраните первую карту — профиль клиента появится
            автоматически.
          </p>
          <Link href="/calculator" className="text-button">
            Создать первую карту →
          </Link>
        </div>
      )}
    </div>
  );
}
