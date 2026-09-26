"use client";
import { useRef, type PointerEvent } from "react";
import {
  compassDirections,
  mountains,
  mountainAt,
  normalizeBearing,
  polar,
  sectorPath,
  pointerBearing,
  type CompassKind,
} from "@/domain/feng-shui/compass";
import { guaDirections, directionQualities } from "@/domain/feng-shui/catalog";

export function FengCompassDial({
  bearing,
  rotation,
  opacity,
  onSelect,
  kind = "luopan",
  gua = 1,
}: {
  bearing: number;
  rotation: number;
  opacity: number;
  onSelect: (angle: number) => void;
  kind?: CompassKind;
  gua?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const selected = mountainAt(bearing - rotation),
    tip = polar(270, bearing),
    tail = polar(165, bearing + 180);
  function drag(e: PointerEvent<SVGCircleElement>) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    e.stopPropagation();
    const box = svgRef.current!.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2,
      y = e.clientY - box.top - box.height / 2;
    if (Math.hypot(x, y) > 10) onSelect(pointerBearing(x, y));
  }
  const textStyle = {
    paintOrder: "stroke",
    stroke: "#f8f3df",
    strokeWidth: 2.5,
    strokeLinejoin: "round",
  } as const;
  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      data-compass-dial="true"
      viewBox="0 0 600 600"
      aria-label="Интерактивный компас направлений"
      style={{
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <g
        opacity={opacity}
        fontFamily="Arial, sans-serif"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <g transform={`rotate(${rotation} 300 300)`}>
          {(kind === "luopan"
            ? [177, 209, 249, 268, 284]
            : [177, 268, 284]
          ).map((r) => (
            <circle
              key={r}
              cx="300"
              cy="300"
              r={r}
              fill="none"
              stroke="#71572b"
              strokeWidth={r === 284 ? 2 : 1}
            />
          ))}
          {Array.from({ length: 180 }, (_, i) => {
            const a = i * 2,
              p = polar(a % 10 === 0 ? 272 : 278, a),
              q = polar(284, a);
            return (
              <line
                key={i}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke="#664e29"
                strokeWidth={a % 10 === 0 ? 1.5 : 0.7}
              />
            );
          })}
          {Array.from({ length: 12 }, (_, i) => {
            const p = polar(296, i * 30);
            return (
              <text
                key={i}
                x={p.x}
                y={p.y}
                transform={`rotate(${-rotation} ${p.x} ${p.y})`}
                fontSize="10"
                fill="#22392c"
                style={textStyle}
              >
                {i * 30}°
              </text>
            );
          })}
          {kind === "luopan" &&
            mountains.map((m) => {
              const p = polar(230, m.angle),
                n = polar(259, m.angle),
                a = polar(209, m.angle - 7.5),
                b = polar(268, m.angle - 7.5);
              return (
                <g key={m.code}>
                  <path
                    d={sectorPath(209, 268, m.angle - 7.5, m.angle + 7.5)}
                    fill="transparent"
                    stroke={selected.code === m.code ? "#0f775d" : "none"}
                    strokeWidth="3"
                    style={{ pointerEvents: "auto", cursor: "pointer" }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${m.code} ${m.name}, ${m.angle}°`}
                    aria-pressed={selected.code === m.code}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(normalizeBearing(m.angle + rotation));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(normalizeBearing(m.angle + rotation));
                      }
                    }}
                  />
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="#71572b"
                    strokeWidth=".8"
                  />
                  <text
                    x={p.x}
                    y={p.y}
                    transform={`rotate(${-rotation} ${p.x} ${p.y})`}
                    fontSize="25"
                    fill="#183f31"
                    style={textStyle}
                  >
                    {m.han}
                  </text>
                  <text
                    x={n.x}
                    y={n.y}
                    transform={`rotate(${-rotation} ${n.x} ${n.y})`}
                    fontSize="9"
                    fill="#263b2c"
                    style={textStyle}
                  >
                    {m.code}
                  </text>
                </g>
              );
            })}
          {compassDirections.map((d) => {
            const p = polar(kind === "luopan" ? 191 : 216, d.angle),
              name = polar(155, d.angle),
              edge = polar(268, d.angle - 22.5);
            const quality = guaDirections[gua].indexOf(d.id),
              q = polar(245, d.angle);
            return (
              <g key={d.id}>
                <line
                  x1="300"
                  y1="300"
                  x2={edge.x}
                  y2={edge.y}
                  stroke="#71572b"
                  strokeOpacity=".75"
                  strokeWidth="1"
                />
                {kind !== "luopan" && (
                  <path
                    d={sectorPath(177, 268, d.angle - 22.5, d.angle + 22.5)}
                    fill="transparent"
                    stroke={d.id === selected.direction.id ? "#0f775d" : "none"}
                    strokeWidth="3"
                    role="button"
                    tabIndex={0}
                    aria-label={d.direction}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(normalizeBearing(d.angle + rotation));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(normalizeBearing(d.angle + rotation));
                      }
                    }}
                    style={{ pointerEvents: "auto", cursor: "pointer" }}
                  />
                )}
                <text
                  x={p.x}
                  y={p.y}
                  transform={`rotate(${-rotation} ${p.x} ${p.y})`}
                  fontSize={kind === "luopan" ? 23 : 30}
                  fill="#183f31"
                  style={textStyle}
                >
                  {kind === "route" ? d.short : d.trigram}
                </text>
                <text
                  x={name.x}
                  y={name.y}
                  transform={`rotate(${-rotation} ${name.x} ${name.y})`}
                  fontSize="12"
                  fontWeight="bold"
                  fill="#263b2c"
                  style={textStyle}
                >
                  {d.short}
                </text>
                {kind === "gua" && (
                  <text
                    x={q.x}
                    y={q.y}
                    transform={`rotate(${-rotation} ${q.x} ${q.y})`}
                    fontSize="10"
                    fill={quality < 4 ? "#0e6547" : "#8b473d"}
                    style={textStyle}
                  >
                    {directionQualities[quality][0]}
                  </text>
                )}
                {kind === "bagua" && (
                  <text
                    x={q.x}
                    y={q.y}
                    transform={`rotate(${-rotation} ${q.x} ${q.y})`}
                    fontSize="12"
                    fill="#263b2c"
                    style={textStyle}
                  >
                    {d.name} · {d.id}
                  </text>
                )}
              </g>
            );
          })}
        </g>
        <line
          x1={tail.x}
          y1={tail.y}
          x2="300"
          y2="300"
          stroke="#765927"
          strokeWidth="2"
          strokeDasharray="5 5"
        />
        <line
          x1="300"
          y1="300"
          x2={tip.x}
          y2={tip.y}
          stroke="#126d54"
          strokeWidth="3"
        />
        <circle
          cx="300"
          cy="300"
          r="15"
          fill="#e9d5a1"
          stroke="#29523d"
          strokeWidth="2"
        />
        <text x="300" y="300" fontSize="22" fill="#173e2a">
          ☯
        </text>
        <circle
          cx={tip.x}
          cy={tip.y}
          r="13"
          fill="#d7ba73"
          stroke="#153c2d"
          strokeWidth="3"
          role="slider"
          tabIndex={0}
          aria-label="Перетащить указатель азимута"
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={Number(
            normalizeBearing(bearing - rotation).toFixed(1),
          )}
          style={{ pointerEvents: "auto", cursor: "grab", touchAction: "none" }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={drag}
          onPointerUp={(e) => {
            e.stopPropagation();
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onKeyDown={(e) => {
            if (
              ["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(
                e.key,
              )
            ) {
              e.preventDefault();
              onSelect(
                normalizeBearing(
                  bearing +
                    (e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 1) *
                      (e.shiftKey ? 10 : 1),
                ),
              );
            }
          }}
        />
        <text x={tip.x} y={tip.y} fontSize="15" fill="#173e2a">
          ↗
        </text>
      </g>
    </svg>
  );
}
