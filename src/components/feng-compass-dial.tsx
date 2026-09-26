"use client";
import {
  compassDirections,
  mountains,
  mountainAt,
  normalizeBearing,
  polar,
  sectorPath,
  elementColors,
} from "@/domain/feng-shui/compass";

export function FengCompassDial({
  bearing,
  rotation,
  opacity,
  onSelect,
}: {
  bearing: number;
  rotation: number;
  opacity: number;
  onSelect: (angle: number) => void;
}) {
  const selected = mountainAt(bearing - rotation);
  const tip = polar(269, bearing),
    tail = polar(162, bearing + 180);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      data-compass-dial="true"
      viewBox="0 0 600 600"
      aria-label="Лопань: 24 горы и восемь направлений"
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
          <path
            d={sectorPath(178, 283, 0, 180) + sectorPath(178, 283, 180, 360)}
            fill="#102823"
            fillOpacity=".94"
          />
          {[177, 209, 249, 268, 284].map((r) => (
            <circle
              key={r}
              cx="300"
              cy="300"
              r={r}
              fill="none"
              stroke="#c6ac73"
              strokeWidth={r === 284 ? 1.7 : 0.7}
            />
          ))}
          {Array.from({ length: 180 }, (_, i) => {
            const a = i * 2,
              p = polar(a % 10 === 0 ? 272 : 277, a),
              q = polar(283, a);
            return (
              <line
                key={a}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke="#d9c795"
                strokeWidth={a % 10 === 0 ? 1.2 : 0.6}
              />
            );
          })}
          {Array.from({ length: 12 }, (_, i) => {
            const p = polar(293, i * 30);
            return (
              <text
                key={i}
                x={p.x}
                y={p.y}
                transform={`rotate(${-rotation} ${p.x} ${p.y})`}
                fontSize="8"
                fill="#f0dfb8"
              >
                {i * 30}°
              </text>
            );
          })}
          {mountains.map((m) => {
            const p = polar(230, m.angle),
              n = polar(259, m.angle),
              lineStart = polar(209, m.angle - 7.5),
              lineEnd = polar(268, m.angle - 7.5);
            return (
              <g key={m.code}>
                <path
                  d={sectorPath(209, 268, m.angle - 7.5, m.angle + 7.5)}
                  fill={selected.code === m.code ? "#b39450" : "transparent"}
                  fillOpacity=".3"
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
                >
                  <title>
                    {m.name} · {m.start}–{m.end}°
                  </title>
                </path>
                <line
                  x1={lineStart.x}
                  y1={lineStart.y}
                  x2={lineEnd.x}
                  y2={lineEnd.y}
                  stroke="#c6ac73"
                  strokeOpacity=".55"
                  strokeWidth=".7"
                />
                <text
                  x={p.x}
                  y={p.y}
                  transform={`rotate(${-rotation} ${p.x} ${p.y})`}
                  fontSize="24"
                  fill={elementColors[m.element]}
                >
                  {m.han}
                </text>
                <text
                  x={n.x}
                  y={n.y}
                  transform={`rotate(${-rotation} ${n.x} ${n.y})`}
                  fontSize="8"
                  fill="#e3ddc9"
                >
                  {m.code}
                </text>
              </g>
            );
          })}
          {compassDirections.map((d) => {
            const p = polar(192, d.angle),
              name = polar(158, d.angle),
              edge = polar(177, d.angle - 22.5),
              outer = polar(209, d.angle - 22.5);
            return (
              <g key={d.id}>
                <path
                  d={sectorPath(25, 177, d.angle - 22.5, d.angle + 22.5)}
                  fill={elementColors[d.element]}
                  fillOpacity={d.id === selected.direction.id ? 0.13 : 0.025}
                />
                <line
                  x1="300"
                  y1="300"
                  x2={edge.x}
                  y2={edge.y}
                  stroke="#dbc58e"
                  strokeOpacity=".55"
                  strokeWidth=".7"
                />
                <line
                  x1={edge.x}
                  y1={edge.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#c6ac73"
                  strokeWidth=".8"
                />
                <text
                  x={p.x}
                  y={p.y}
                  transform={`rotate(${-rotation} ${p.x} ${p.y})`}
                  fontSize="24"
                  fill={elementColors[d.element]}
                >
                  {d.trigram}
                </text>
                <text
                  x={name.x}
                  y={name.y}
                  transform={`rotate(${-rotation} ${name.x} ${name.y})`}
                  fontSize="11"
                  fontWeight="bold"
                  fill="#f6e5bb"
                  stroke="#102823"
                  strokeWidth="3"
                  paintOrder="stroke"
                >
                  {d.short}
                </text>
              </g>
            );
          })}
        </g>
        <line
          x1={tail.x}
          y1={tail.y}
          x2="300"
          y2="300"
          stroke="#e7ca85"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />
        <line
          x1="300"
          y1="300"
          x2={tip.x}
          y2={tip.y}
          stroke="#ffe1a0"
          strokeWidth="2.3"
        />
        <path
          d="M 300 26 L 295 41 L 305 41 Z"
          transform={`rotate(${bearing} 300 300)`}
          fill="#ffe1a0"
        />
        <circle
          cx="300"
          cy="300"
          r="17"
          fill="#102823"
          stroke="#e7ca85"
          strokeWidth="1.2"
        />
        <text x="300" y="300" fontSize="23" fill="#e7ca85">
          ☯
        </text>
      </g>
    </svg>
  );
}
