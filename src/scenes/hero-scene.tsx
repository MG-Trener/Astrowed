"use client";
import { useState } from "react";
import { elements } from "@/domain/bazi/catalog";
export function HeroScene() {
  const [active, setActive] = useState(0);
  return (
    <div
      className="hero-scene"
      style={
        { "--active-color": elements[active].color } as React.CSSProperties
      }
    >
      <svg
        className="orbital-system"
        viewBox="0 0 740 670"
        role="img"
        aria-label={`Орбиты пяти элементов. Выбран элемент ${elements[active].name}`}
      >
        <defs>
          <radialGradient id="atmosphere">
            <stop stopColor={elements[active].color} stopOpacity=".13" />
            <stop
              offset="1"
              stopColor={elements[active].color}
              stopOpacity="0"
            />
          </radialGradient>
          <radialGradient id="planet">
            <stop stopColor="#b3c9ad" />
            <stop offset=".27" stopColor="#8eac92" />
            <stop offset=".6" stopColor="#476853" />
            <stop offset=".9" stopColor="#20332a" />
            <stop offset="1" stopColor="#101c16" />
          </radialGradient>
          <filter id="soft-light">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <pattern
            id="grid"
            width="42"
            height="42"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M42 0H0v42"
              fill="none"
              stroke="#aec3b4"
              strokeOpacity=".04"
            />
          </pattern>
        </defs>
        <rect width="740" height="670" fill="url(#grid)" />
        <circle cx="370" cy="327" r="310" fill="url(#atmosphere)" />
        <g stroke="#98b6a1" fill="none">
          <circle cx="370" cy="327" r="252" strokeOpacity=".13" />
          <circle
            cx="370"
            cy="327"
            r="235"
            strokeOpacity=".17"
            strokeDasharray="1 10"
          />
          <circle cx="370" cy="327" r="187" strokeOpacity=".22" />
          <circle cx="370" cy="327" r="106" strokeOpacity=".2" />
          <path
            d="M65 327h610M370 35v584"
            strokeOpacity=".1"
            strokeDasharray="3 7"
          />
          <g className="orbit-spin">
            <ellipse
              cx="370"
              cy="327"
              rx="280"
              ry="105"
              transform="rotate(-33 370 327)"
              strokeOpacity=".42"
            />
            <ellipse
              cx="370"
              cy="327"
              rx="277"
              ry="108"
              transform="rotate(40 370 327)"
              strokeOpacity=".2"
            />
            <ellipse
              cx="370"
              cy="327"
              rx="128"
              ry="275"
              transform="rotate(20 370 327)"
              strokeOpacity=".25"
            />
          </g>
          {Array.from({ length: 72 }, (_, i) => (
            <path
              key={i}
              d={`M370 67v${i % 6 === 0 ? 9 : 3}`}
              transform={`rotate(${i * 5} 370 327)`}
              strokeOpacity={i % 6 === 0 ? ".4" : ".18"}
            />
          ))}
        </g>
        <circle
          cx="370"
          cy="327"
          r="88"
          fill={elements[active].color}
          opacity=".08"
          filter="url(#soft-light)"
        />
        <circle cx="370" cy="327" r="72" fill="url(#planet)" />
        <g stroke="#b6d0b9" strokeWidth=".65" opacity=".4" fill="none">
          {[20, 35, 50, 64].map((r) => (
            <ellipse key={r} cx="370" cy="327" rx={r} ry="71" />
          ))}
          {[-50, -30, -10, 10, 30, 50].map((y) => (
            <ellipse
              key={y}
              cx="370"
              cy={327 + y}
              rx={Math.sqrt(71 ** 2 - y ** 2)}
              ry="12"
            />
          ))}
        </g>
        <text
          x="370"
          y="349"
          textAnchor="middle"
          fill="#edf4e6"
          fontFamily="serif"
          fontSize="61"
        >
          {elements[active].symbol}
        </text>
        <g fill="#9db6a5" fontSize="9" fontFamily="monospace" letterSpacing="2">
          <text x="384" y="67">
            CELESTIAL COORDINATES
          </text>
          <text x="71" y="344">
            270°
          </text>
          <text x="646" y="344">
            90°
          </text>
          <text x="342" y="613">
            180°
          </text>
        </g>
        {elements.map((e, i) => {
          const angle = ((i * 72 - 90) * Math.PI) / 180,
            x = 370 + 205 * Math.cos(angle),
            y = 327 + 205 * Math.sin(angle);
          return (
            <g key={e.id} className="orbital-node">
              <circle
                cx={x}
                cy={y}
                r="25"
                fill="#0c1411"
                stroke={e.color}
                strokeOpacity={i === active ? ".8" : ".25"}
              />
              <text
                x={x}
                y={y + 8}
                fill={e.color}
                fontSize="23"
                textAnchor="middle"
                fontFamily="serif"
              >
                {e.symbol}
              </text>
              <text
                x={x + (x < 300 ? -40 : x > 440 ? 40 : 0)}
                y={y + (i === 0 ? -40 : 5)}
                textAnchor={x < 300 ? "end" : x > 440 ? "start" : "middle"}
                fill={e.color}
                fontSize="9"
                letterSpacing="2"
              >
                {e.en}
              </text>
            </g>
          );
        })}
        <circle cx="190" cy="151" r="3" fill="#d7bb83" />
        <circle cx="591" cy="451" r="3" fill="#a8cbb6" />
      </svg>
      <div className="scene-tag tag-top">
        <i /> ЖИВАЯ СИСТЕМА ПЯТИ ЭЛЕМЕНТОВ
      </div>
      <div className="scene-tag tag-bottom">
        01 — 05 <span>Всё связано.</span>
      </div>
      <div className="element-switch" aria-label="Выбрать элемент">
        {elements.map((e, i) => (
          <button
            key={e.id}
            aria-label={e.name}
            aria-pressed={i === active}
            onClick={() => setActive(i)}
            style={{ "--element": e.color } as React.CSSProperties}
          >
            {e.symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
