import { redirect } from "next/navigation";
import { isAuthenticated } from "@/services/auth";
import { getDb } from "@/data/db";
import { articles } from "@/data/schema";
import { ArticleEditor } from "@/components/article-editor";
export const dynamic = "force-dynamic";
export default async function Page() {
  if (!(await isAuthenticated())) redirect("/login");
  const all = await getDb().select().from(articles);
  return (
    <div className="page-wrap">
      <div className="page-title">
        <div>
          <div className="eyebrow">EDITORIAL / БАЗА ЗНАНИЙ</div>
          <h1>Собирая знания.</h1>
          <p>Редактирование, публикация и проверка материалов академии.</p>
        </div>
      </div>
      <ArticleEditor articles={all} />
    </div>
  );
}
