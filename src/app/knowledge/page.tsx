import { KnowledgeHero } from "@/components/knowledge-artwork";
import { KnowledgeCatalogue } from "@/components/knowledge-catalogue";
import { eq } from "drizzle-orm";
import { getDb } from "@/data/db";
import { articles } from "@/data/schema";
import { mergeLibrary } from "@/data/library";
export const dynamic = "force-dynamic";
export const metadata = { title: "Библиотека знаний" };
export default async function Page() {
  let all: (typeof articles.$inferSelect)[] = [];
  try {
    all = await getDb()
      .select()
      .from(articles)
      .where(eq(articles.published, true));
  } catch {
    // The bundled library remains available without the CMS.
  }
  return (
    <div className="page-wrap">
      <KnowledgeHero />
      <KnowledgeCatalogue articles={mergeLibrary(all)} />
    </div>
  );
}
