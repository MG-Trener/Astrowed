"use client";
import { useId, type CSSProperties } from "react";
import { elementOf } from "@/domain/bazi/catalog";
import type { Pillar } from "@/domain/bazi/types";

export function PillarsScene({
  pillars,
  unknownTime,
}: {
  pillars?: Pillar[];
  unknownTime?: boolean;
}) {
  const id = useId();
  return (
    <svg className="pillars-scene" viewBox="0 0 340 240" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#234640" />
          <stop offset=".5" stopColor="#102723" />
          <stop offset="1" stopColor="#091817" />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#cde5be" stopOpacity="0" />
          <stop offset=".5" stopColor="#cde5be" stopOpacity=".6" />
          <stop offset="1" stopColor="#cde5be" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse
        cx="168"
        cy="190"
        rx="158"
        ry="21"
        className="pillar-foundation"
      />
      <path
        className="pillar-connection"
        d="M42 183 Q84 153 126 183 T210 183 T294 183"
      />
      <path
        className="pillar-current"
        pathLength="100"
        d="M42 183 Q84 153 126 183 T210 183 T294 183"
      />
      {["year", "month", "day", "hour"].map((key, i) => {
        const p = pillars?.find((pillar) => pillar.key === key);
        const x = 42 + i * 84;
        return (
          <g
            key={key}
            className="pillar-monument"
            style={{ "--phase": `${i * -2}s` } as CSSProperties}
          >
            <ellipse className="pillar-halo" cx={x} cy="187" rx="33" ry="9" />
            <path
              d={`M${x - 24} 58 L${x + 20} 50 L${x + 28} 57 L${x + 28} 177 L${x - 16} 187 L${x - 24} 180Z`}
              fill={`url(#${id}-stone)`}
              stroke="#759c8566"
            />
            <path
              d={`M${x + 20} 50 V172 L${x - 24} 180 M${x + 20} 172 L${x + 28} 177`}
              fill="none"
              stroke="#8da89055"
            />
            <path
              d={`M${x - 24} 58 L${x + 20} 66 L${x + 28} 57`}
              fill="none"
              stroke="#a2b99555"
            />
            <path
              className="pillar-light"
              pathLength="100"
              d={`M${x - 24} 180 V58 L${x + 20} 50 V172Z`}
            />
            <rect
              className="pillar-beam"
              x={x - 2}
              y="19"
              width="2"
              height="30"
              fill={`url(#${id}-beam)`}
            />
            <circle className="pillar-crown" cx={x - 2} cy="36" r="3" />
            <text
              className="pillar-glyph"
              x={x - 2}
              y="105"
              fill={p ? elementOf(p.element).color : "#c4d5ba"}
            >
              {p?.stem ?? ["年", "月", "日", "時"][i]}
            </text>
            <path d={`M${x - 14} 121 H${x + 10}`} stroke="#aac3a533" />
            <text
              className="pillar-glyph"
              x={x - 2}
              y="154"
              fill={p ? elementOf(p.branchElement).color : "#a0b1a0"}
            >
              {p?.branch ?? (key === "hour" && unknownTime ? "?" : "—")}
            </text>
            <text className="scene-label" x={x} y="221">
              {["ГОД", "МЕСЯЦ", "ДЕНЬ", "ЧАС"][i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export type DaySample = {
  time: string;
  day?: string;
  pillar?: Pillar;
  unavailable: boolean;
};
export function DayOrbitScene({ hours }: { hours: DaySample[] }) {
  const id = useId();
  return (
    <svg className="day-orbit-scene" viewBox="0 0 340 240" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-core`} cx="35%" cy="25%" r="80%">
          <stop stopColor="#6b9780" />
          <stop offset=".55" stopColor="#254c45" />
          <stop offset="1" stopColor="#0b1c24" />
        </radialGradient>
        <radialGradient id={`${id}-halo`}>
          <stop stopColor="#acdab5" stopOpacity=".2" />
          <stop offset="1" stopColor="#acdab5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="170" cy="120" r="109" fill={`url(#${id}-halo)`} />
      {Array.from({ length: 48 }, (_, i) => {
        const a = ((i * 7.5 - 90) * Math.PI) / 180;
        const radius = i % 4 === 0 ? 94 : 98;
        return (
          <line
            key={i}
            x1={170 + radius * Math.cos(a)}
            y1={120 + radius * Math.sin(a)}
            x2={170 + 102 * Math.cos(a)}
            y2={120 + 102 * Math.sin(a)}
            stroke={i % 4 === 0 ? "#acc5a6" : "#5b7a70"}
            opacity=".5"
          />
        );
      })}
      <circle cx="170" cy="120" r="75" className="day-orbit-track" />
      <g className="day-orbit-traveller">
        <circle
          cx="170"
          cy="120"
          r="75"
          pathLength="100"
          className="day-orbit-tail"
        />
        <circle cx="245" cy="120" r="12" fill="#e5cf9233" />
        <circle cx="245" cy="120" r="4" fill="#ffe4a3" />
      </g>
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30 - 90) * Math.PI) / 180;
        const x = 170 + 75 * Math.cos(a),
          y = 120 + 75 * Math.sin(a);
        const p = hours[i]?.pillar;
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r="12"
              fill="#0a191a"
              stroke={p ? elementOf(p.branchElement).color : "#6b8c7a"}
            />
            <text
              className="day-sample"
              x={x}
              y={y + 4.5}
              fill={p ? elementOf(p.branchElement).color : "#bdcbb8"}
            >
              {p?.branch ??
                (hours[i]?.unavailable ? "?" : String(i * 2).padStart(2, "0"))}
            </text>
          </g>
        );
      })}
      <circle
        cx="170"
        cy="120"
        r="48"
        fill={`url(#${id}-core)`}
        stroke="#bdd1a966"
      />
      <path
        d="M170 72 C205 81 143 118 181 145 Q198 159 170 168 A48 48 0 0 0 170 72"
        fill="#060e1b"
        opacity=".45"
      />
      <ellipse
        className="day-core-orbit"
        cx="170"
        cy="120"
        rx="53"
        ry="16"
        transform="rotate(-28 170 120)"
      />
      <text className="day-core-glyph" x="170" y="125" fill="#e3ebd2">
        {hours[6]?.day ?? "日"}
      </text>
      <text className="scene-label day-core-caption" x="170" y="143">
        12 × 2 ЧАСА
      </text>
      <text className="scene-label" x="170" y="10">
        00:00
      </text>
      <text className="scene-label" x="291" y="123">
        06:00
      </text>
      <text className="scene-label" x="170" y="237">
        12:00
      </text>
      <text className="scene-label" x="49" y="123">
        18:00
      </text>
    </svg>
  );
}
