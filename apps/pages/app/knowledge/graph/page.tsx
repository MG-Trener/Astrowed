import { KnowledgeAtlasPage } from "@/components/knowledge-atlas-page";
import { libraryArticles } from "@/data/library";
export const metadata = { title: "Атлас знаний Ба Цзы" };
export default function Page() {
  return <KnowledgeAtlasPage nodes={libraryArticles} />;
}
