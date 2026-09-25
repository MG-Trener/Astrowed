import type { CSSProperties } from "react";

// Decorative sky map: deterministic positions keep server and browser in sync.
const constellations = [
  [
    [65, 90],
    [120, 125],
    [180, 110],
    [205, 165],
    [155, 205],
    [120, 125],
  ],
  [
    [930, 65],
    [1000, 115],
    [1090, 88],
    [1135, 155],
    [1060, 220],
    [1000, 115],
  ],
  [
    [50, 425],
    [120, 385],
    [185, 440],
    [155, 510],
    [220, 560],
  ],
  [
    [885, 405],
    [955, 365],
    [1020, 425],
    [1100, 400],
    [1150, 465],
  ],
  [
    [430, 650],
    [490, 610],
    [550, 660],
    [615, 625],
    [680, 675],
  ],
  [
    [455, 105],
    [515, 145],
    [575, 115],
    [625, 175],
  ],
];

// Rotate the flight plane, so the luminous head always leads its tail at any viewport size.
const cometRoutes = [
  [8, 12, 28, 43, 1, "#84e5d9"],
  [92, 15, 152, 53, 10, "#f5c67e"],
  [8, 82, -35, 61, 20, "#c9a6ef"],
  [95, 78, 215, 71, 30, "#91cafa"],
  [35, 4, 90, 79, 41, "#b9e8b1"],
  [76, 96, -90, 83, 50, "#edafc8"],
  [2, 46, 0, 89, 60, "#e3d49c"],
  [98, 65, 180, 97, 70, "#9fc0ec"],
] as const;
const spiral = Array.from({ length: 64 }, (_, i) => {
  const angle = i * 0.09;
  const radius = 8 + i * 2.5;
  return `${i === 0 ? "M" : "L"}${(200 + radius * Math.cos(angle)).toFixed(3)} ${(200 + radius * Math.sin(angle)).toFixed(3)}`;
}).join(" ");

function Galaxy({ variant }: { variant: "jade" | "violet" }) {
  return (
    <div className={`sky-galaxy sky-galaxy-${variant}`}>
      <div className="galaxy-disc">
        <svg viewBox="0 0 400 400" className="galaxy-spiral" fill="none">
          {[0, 120, 240].map((angle) => (
            <g key={angle} transform={`rotate(${angle} 200 200)`}>
              <path d={spiral} className="galaxy-arm-haze" />
              <path d={spiral} className="galaxy-arm" />
              {Array.from({ length: 22 }, (_, i) => {
                const a = i * 0.25,
                  r = 12 + i * 7;
                return (
                  <circle
                    key={i}
                    cx={(200 + r * Math.cos(a)).toFixed(3)}
                    cy={(200 + r * Math.sin(a)).toFixed(3)}
                    r={i % 3 === 0 ? 1.3 : 0.65}
                  />
                );
              })}
            </g>
          ))}
        </svg>
        <div className="galaxy-core" />
      </div>
    </div>
  );
}

export function StarMap() {
  return (
    <div className="site-star-map" aria-hidden="true">
      <div className="star-map-nebula" />
      <Galaxy variant="jade" />
      <Galaxy variant="violet" />
      {cometRoutes.map(([x, y, angle, period, delay, color], i) => (
        <div
          key={i}
          className="comet-route"
          data-extra={i >= 4}
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              transform: `rotate(${angle}deg)`,
              "--meteor-period": `${period}s`,
              "--meteor-delay": `${delay}s`,
              "--meteor-color": color,
            } as CSSProperties
          }
        >
          <div className="meteor" />
        </div>
      ))}
      {[
        [18, 32, 41, 7],
        [82, 55, 59, 19],
        [62, 16, 71, 35],
        [31, 84, 89, 47],
      ].map(([x, y, period, delay], i) => (
        <div
          key={i}
          className="star-burst"
          data-extra={i >= 2}
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              "--burst-period": `${period}s`,
              "--burst-delay": `${delay}s`,
            } as CSSProperties
          }
        >
          <i className="star-burst-ring" />
          <i className="star-burst-rays" />
          <i className="star-burst-core" />
        </div>
      ))}
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g className="star-map-grid">
          <ellipse
            cx="600"
            cy="400"
            rx="540"
            ry="255"
            transform="rotate(-25 600 400)"
          />
          <ellipse
            cx="600"
            cy="400"
            rx="440"
            ry="345"
            transform="rotate(30 600 400)"
          />
          <circle cx="600" cy="400" r="350" strokeDasharray="1 15" />
          <path d="M0 400H1200M600 0V800" strokeDasharray="2 18" />
        </g>
        {constellations.map((points, index) => (
          <g
            className="star-map-constellation"
            key={index}
            style={{ "--star-delay": `${-index * 2}s` } as CSSProperties}
          >
            <polyline
              points={points.map((point) => point.join(",")).join(" ")}
            />
            {points.map(([x, y], point) => (
              <circle
                key={point}
                cx={x}
                cy={y}
                r={point % 3 === 0 ? 2.2 : 1.3}
              />
            ))}
          </g>
        ))}
        {Array.from({ length: 90 }, (_, index) => {
          const x = (index * 137.508 + 23) % 1200;
          const y = (index * 211.71 + 53) % 800;
          return (
            <g
              className="star-map-star"
              key={index}
              style={
                {
                  "--star-delay": `${-(index % 11)}s`,
                  "--star-duration": `${5 + (index % 7)}s`,
                } as CSSProperties
              }
            >
              <circle cx={x} cy={y} r={index % 9 === 0 ? 1.7 : 0.75} />
              {index % 9 === 0 && (
                <path d={`M${x - 5} ${y}h10M${x} ${y - 5}v10`} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
