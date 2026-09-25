import Link from "next/link";
import { KnowledgeGraph } from "@/scenes/knowledge-graph";
import type { KnowledgeNode, StoredKnowledgeEdge } from "@/data/knowledge-map";

export function KnowledgeAtlasPage({
  nodes,
  edges,
}: {
  nodes: KnowledgeNode[];
  edges?: StoredKnowledgeEdge[];
}) {
  return (
    <div className="page-wrap atlas-page">
      <Link className="back-link" href="/knowledge">
        ← БИБЛИОТЕКА
      </Link>
      <div className="page-title">
        <div>
          <div className="eyebrow">ACADEMY / АТЛАС ЗНАНИЙ</div>
          <h1>Одно понятие ведёт к другому.</h1>
          <p>
            Выберите тему, узнайте, с чем и почему она связана, затем откройте
            статью. Для первого знакомства начните с одного из маршрутов.
          </p>
        </div>
      </div>
      <KnowledgeGraph nodes={nodes} edges={edges} />
    </div>
  );
}
