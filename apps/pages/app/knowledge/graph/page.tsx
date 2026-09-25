import { KnowledgeGraph } from "@/scenes/knowledge-graph";
import { articles, edges } from "../../../content";
export default function Page() {
  return (
    <div className="page-wrap">
      <div className="page-title">
        <div>
          <div className="eyebrow">ACADEMY / АТЛАС ЗНАНИЙ</div>
          <h1>Одно понятие ведёт к другому.</h1>
          <p>Исследуйте связи между материалами академии.</p>
        </div>
      </div>
      <KnowledgeGraph nodes={articles} edges={edges} />
    </div>
  );
}
