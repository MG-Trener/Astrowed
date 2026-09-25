"use client";
import { useState } from "react";
import Link from "next/link";
type Node = {
  id: string;
  slug: string;
  title: string;
  symbol: string | null;
  summary: string;
};
type Edge = { sourceId: string; targetId: string; relation: string };
export function KnowledgeGraph({
  nodes,
  edges,
}: {
  nodes: Node[];
  edges: Edge[];
}) {
  const [selected, setSelected] = useState(nodes[0]?.id);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const current = nodes.find((n) => n.id === selected);
  const positioned = nodes.map((n, i) => ({
    ...n,
    x: 320 + 220 * Math.cos((((i * 360) / nodes.length - 90) * Math.PI) / 180),
    y: 280 + 190 * Math.sin((((i * 360) / nodes.length - 90) * Math.PI) / 180),
  }));
  return (
    <div className="explore-layout">
      <div>
        <div className="tabs">
          <button
            aria-label="Уменьшить граф"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
          >
            −
          </button>
          <button
            aria-label="Сбросить масштаб и положение"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            aria-label="Увеличить граф"
            onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
          >
            +
          </button>
        </div>
        <svg
          viewBox="0 0 640 570"
          style={{
            width: "100%",
            touchAction: "none",
            cursor: drag ? "grabbing" : "grab",
          }}
          aria-label="Граф материалов академии"
          onPointerDown={(e) => {
            setDrag({ x: e.clientX, y: e.clientY });
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (drag) {
              const rect = e.currentTarget.getBoundingClientRect();
              setPan((p) => ({
                x: p.x + ((e.clientX - drag.x) * 640) / rect.width,
                y: p.y + ((e.clientY - drag.y) * 570) / rect.height,
              }));
              setDrag({ x: e.clientX, y: e.clientY });
            }
          }}
          onPointerUp={() => setDrag(null)}
          onPointerCancel={() => setDrag(null)}
        >
          <g
            transform={`translate(${pan.x} ${pan.y}) translate(320 280) scale(${zoom}) translate(-320 -280)`}
          >
            {edges.map((edge, i) => {
              const a = positioned.find((n) => n.id === edge.sourceId),
                b = positioned.find((n) => n.id === edge.targetId);
              return a && b ? (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#90b493"
                  strokeOpacity={
                    a.id === selected || b.id === selected ? ".7" : ".2"
                  }
                />
              ) : null;
            })}
            {positioned.map((n) => (
              <g
                key={n.id}
                role="button"
                tabIndex={0}
                aria-label={n.title}
                aria-pressed={n.id === selected}
                className="reactor-button"
                onClick={() => setSelected(n.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(n.id);
                  }
                }}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="35"
                  fill="#101b14"
                  stroke="#aac5a3"
                  strokeOpacity={n.id === selected ? ".9" : ".25"}
                />
                <text
                  x={n.x}
                  y={n.y + 9}
                  textAnchor="middle"
                  fill="#b7cbb1"
                  fontSize="28"
                  fontFamily="serif"
                >
                  {n.symbol}
                </text>
                <text
                  x={n.x}
                  y={n.y + 61}
                  textAnchor="middle"
                  className="reactor-label"
                >
                  {n.title}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
      <section className="explore-detail">
        <div className="eyebrow">KNOWLEDGE GRAPH / ЖИВЫЕ СВЯЗИ</div>
        {current ? (
          <>
            <div className="explore-character" style={{ color: "var(--jade)" }}>
              {current.symbol}
            </div>
            <h2>{current.title}</h2>
            <p>{current.summary}</p>
            <Link
              className="button primary"
              href={`/knowledge/${current.slug}`}
            >
              Открыть материал ↗
            </Link>
            <p className="method-note" style={{ marginTop: 30 }}>
              Линии обозначают связи порождения между опубликованными
              материалами. Выберите узел, измените масштаб или переместите граф.
            </p>
          </>
        ) : (
          <p>Граф появится после публикации материалов.</p>
        )}
      </section>
    </div>
  );
}
