import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/data/db";
import { articles } from "@/data/schema";
import { libraryArticles } from "@/data/library";
import { KnowledgeArticle } from "@/components/knowledge-article";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const builtin = libraryArticles.find((a) => a.slug === slug);
  let article: typeof articles.$inferSelect | undefined;
  try {
    [article] = await getDb()
      .select()
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.published, true)));
  } catch {
    // Introductory articles stay available when the CMS cannot be reached.
  }
  if (!article) {
    if (builtin) return <KnowledgeArticle article={builtin} />;
    notFound();
  }
  return (
    <KnowledgeArticle
      article={{
        ...article,
        symbol: article.symbol ?? "",
        categoryId: article.categoryId ?? "foundations",
      }}
    />
  );
}
