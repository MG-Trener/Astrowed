import { eq } from "drizzle-orm";
import { getDb } from "@/data/db";
import { articles, knowledgeLinks } from "@/data/schema";
import { KnowledgeGraph } from "@/scenes/knowledge-graph";
export const dynamic = "force-dynamic";
export default async function Page() {
  const db = getDb();
  const [nodes, edges] = await Promise.all([
    db
      .select({
        id: articles.id,
        slug: articles.slug,
        title: articles.title,
        symbol: articles.symbol,
        summary: articles.summary,
      })
      .from(articles)
      .where(eq(articles.published, true)),
    db.select().from(knowledgeLinks),
  ]);
  return (
    <div className="page-wrap">
      <div className="page-title">
        <div>
          <div className="eyebrow">ACADEMY / АТЛАС ЗНАНИЙ</div>
          <h1>Одно понятие ведёт к другому.</h1>
          <p>Исследуйте связи между материалами академии.</p>
        </div>
      </div>
      <KnowledgeGraph
        nodes={nodes}
        edges={edges.map((e) => ({
          sourceId: e.sourceId,
          targetId: e.targetId,
          relation: e.relation,
        }))}
      />
    </div>
  );
}
