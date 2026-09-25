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

export function StarMap() {
  return (
    <div className="site-star-map" aria-hidden="true">
      <div className="star-map-nebula" />
      <div className="meteor meteor-jade" />
      <div className="meteor meteor-gold" />
      <div className="meteor meteor-violet" />
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
