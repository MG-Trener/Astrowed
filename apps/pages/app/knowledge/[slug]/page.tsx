import { notFound } from "next/navigation";
import { articles } from "../../../content";
import { KnowledgeArticle } from "@/components/knowledge-article";
export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
  return <KnowledgeArticle article={article} />;
}
