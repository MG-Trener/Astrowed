"use client";
import { useState } from "react";
import { elements, type ElementId } from "@/domain/bazi/catalog";
export function ElementsReactor({
  distribution,
  selected,
  onSelect,
  master = "命",
}: {
  distribution?: Record<ElementId, number>;
  selected?: ElementId;
  onSelect?: (id: ElementId) => void;
  master?: string;
}) {
  const [mode, setMode] = useState<"generation" | "control" | "all">(
    "generation",
  );
  const [ownSelected, setOwnSelected] = useState<ElementId>("wood");
  const current = selected ?? ownSelected;
  const nodes = elements.map((e, i) => ({
    ...e,
    x: 250 + 162 * Math.cos(((i * 72 - 90) * Math.PI) / 180),
    y: 246 + 162 * Math.sin(((i * 72 - 90) * Math.PI) / 180),
  }));
  return (
    <div>
      <div className="tabs no-print" aria-label="Цикл взаимодействия">
        {[
          ["generation", "Порождение"],
          ["control", "Контроль"],
          ["all", "Все связи"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={mode === id}
            onClick={() => setMode(id as typeof mode)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="reactor">
        <svg
          viewBox="0 0 500 490"
          aria-label="Интерактивная система пяти элементов"
        >
          <defs>
            <radialGradient id="reactor-light">
              <stop
                stopColor={elements.find((e) => e.id === current)?.color}
                stopOpacity=".09"
              />
              <stop offset="1" stopOpacity="0" />
            </radialGradient>
            <marker
              id="arrow-gen"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="m0 0 10 5-10 5" fill="#7f9d83" />
            </marker>
          </defs>
          <circle cx="250" cy="246" r="230" fill="url(#reactor-light)" />
          <g fill="none" stroke="#9ab899">
            <circle
              cx="250"
              cy="246"
              r="196"
              strokeOpacity=".12"
              strokeDasharray="2 8"
            />
            <circle cx="250" cy="246" r="162" strokeOpacity=".08" />
            <circle cx="250" cy="246" r="72" strokeOpacity=".14" />
          </g>
          {nodes.map((e, i) => {
            const targets =
              mode === "all" ? [1, 2] : [mode === "generation" ? 1 : 2];
            return targets.map((step) => {
              const target = nodes[(i + step) % 5],
                dx = target.x - e.x,
                dy = target.y - e.y,
                len = Math.hypot(dx, dy),
                pad = 45;
              return (
                <line
                  key={`${i}-${step}`}
                  x1={e.x + (dx / len) * pad}
                  y1={e.y + (dy / len) * pad}
                  x2={target.x - (dx / len) * pad}
                  y2={target.y - (dy / len) * pad}
                  stroke={step === 1 ? "#7f9d83" : "#c29a80"}
                  strokeOpacity={
                    current === e.id || current === target.id ? ".65" : ".15"
                  }
                  strokeWidth="1"
                  strokeDasharray={step === 2 ? "3 5" : undefined}
                  markerEnd="url(#arrow-gen)"
                />
              );
            });
          })}
          <text
            x="250"
            y="252"
            textAnchor="middle"
            fill="#c0d1b8"
            fontFamily="serif"
            fontSize="45"
          >
            {master}
          </text>
          <text
            x="250"
            y="278"
            textAnchor="middle"
            className="reactor-label"
            letterSpacing="2"
          >
            {master === "命" ? "У СИН" : "ГОСПОДИН ДНЯ"}
          </text>
          {nodes.map((e) => (
            <g
              key={e.id}
              role="button"
              tabIndex={0}
              aria-label={`${e.name}${distribution ? `, ${distribution[e.id]}%` : ""}`}
              aria-pressed={current === e.id}
              className="reactor-button"
              onClick={() => {
                setOwnSelected(e.id);
                onSelect?.(e.id);
              }}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  setOwnSelected(e.id);
                  onSelect?.(e.id);
                }
              }}
            >
              <circle
                cx={e.x}
                cy={e.y}
                r={distribution ? 25 + distribution[e.id] * 0.32 : 34}
                fill="#101a14"
                stroke={e.color}
                strokeOpacity={current === e.id ? ".7" : ".3"}
              />
              <circle
                cx={e.x}
                cy={e.y}
                r="42"
                fill="none"
                stroke={e.color}
                strokeOpacity={current === e.id ? ".18" : "0"}
              />
              <text
                x={e.x}
                y={e.y + 10}
                textAnchor="middle"
                fill={e.color}
                fontFamily="serif"
                fontSize="29"
              >
                {e.symbol}
              </text>
              <text
                x={e.x}
                y={e.y + 61}
                textAnchor="middle"
                className="reactor-label"
              >
                {e.name}
                {distribution ? ` · ${distribution[e.id]}%` : ""}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
