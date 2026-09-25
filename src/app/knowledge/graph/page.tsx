import { eq } from "drizzle-orm";
import { getDb } from "@/data/db";
import { articles, knowledgeLinks } from "@/data/schema";
import { KnowledgeAtlasPage } from "@/components/knowledge-atlas-page";
import { libraryArticles, mergeLibrary } from "@/data/library";
import type { KnowledgeNode, StoredKnowledgeEdge } from "@/data/knowledge-map";
export const dynamic = "force-dynamic";
export const metadata = { title: "Атлас знаний Ба Цзы" };
export default async function Page() {
  let nodes: KnowledgeNode[] = libraryArticles;
  let edges: StoredKnowledgeEdge[] = [];
  try {
    const db = getDb();
    const [published, stored] = await Promise.allSettled([
      db.select().from(articles).where(eq(articles.published, true)),
      db.select().from(knowledgeLinks),
    ]);
    if (published.status === "fulfilled") {
      nodes = mergeLibrary(published.value);
      if (stored.status === "fulfilled") edges = stored.value;
    }
  } catch {
    // The full bundled atlas remains available without the CMS.
  }
  return (
    <KnowledgeAtlasPage
      nodes={nodes.map(({ id, slug, title, symbol, summary }) => ({
        id,
        slug,
        title,
        symbol,
        summary,
      }))}
      edges={edges}
    />
  );
}
