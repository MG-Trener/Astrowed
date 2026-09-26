import { KnowledgeHero } from "@/components/knowledge-artwork";
import { KnowledgeCatalogue } from "@/components/knowledge-catalogue";
import { articles } from "../../content";
export default function Page() {
  return (
    <div className="page-wrap">
      <KnowledgeHero />
      <KnowledgeCatalogue articles={articles} />
    </div>
  );
}
