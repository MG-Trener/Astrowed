"use client";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./calendar-lunar-scene.module.css";

/** Decorative lunar rhythm; astronomical dates are calculated separately. */
export function CalendarLunarScene() {
  const id = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    let inView = false;
    const sync = () => setRunning(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    if (root.current) observer.observe(root.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  const url = (name: string) => `url(#${id}-${name})`;
  return (
    <div
      ref={root}
      className={styles.scene}
      data-running={running}
      aria-hidden="true"
    >
      <svg viewBox="0 0 360 270" className={styles.sky}>
        <defs>
          <radialGradient id={`${id}-halo`}>
            <stop stopColor="#b8b776" stopOpacity=".22" />
            <stop offset=".42" stopColor="#73b895" stopOpacity=".1" />
            <stop offset="1" stopColor="#437661" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-surface`} cx="32%" cy="27%" r="78%">
            <stop stopColor="#f7e5bb" />
            <stop offset=".4" stopColor="#cbbf94" />
            <stop offset=".78" stopColor="#7e8970" />
            <stop offset="1" stopColor="#233f37" />
          </radialGradient>
          <radialGradient id={`${id}-shade`} cx="65%" cy="50%" r="66%">
            <stop offset=".62" stopColor="#081c18" stopOpacity=".97" />
            <stop offset=".84" stopColor="#081c18" stopOpacity=".85" />
            <stop offset="1" stopColor="#0b2922" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-crater`}>
            <stop stopColor="#475246" stopOpacity=".55" />
            <stop offset=".66" stopColor="#69735a" stopOpacity=".2" />
            <stop offset=".83" stopColor="#f3ddac" stopOpacity=".2" />
            <stop offset="1" stopColor="#acaa83" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-arc`}>
            <stop stopColor="#8ec1a5" stopOpacity=".05" />
            <stop offset=".45" stopColor="#dbbf81" />
            <stop offset="1" stopColor="#f4e2ac" stopOpacity=".08" />
          </linearGradient>
          <filter
            id={`${id}-grain`}
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency=".16"
              numOctaves="3"
              seed="19"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComposite in2="SourceGraphic" operator="in" />
            <feBlend in="SourceGraphic" mode="soft-light" />
          </filter>
          <filter
            id={`${id}-glow`}
            x="-150%"
            y="-150%"
            width="400%"
            height="400%"
          >
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <clipPath id={`${id}-disc`}>
            <circle cx="180" cy="128" r="55" />
          </clipPath>
        </defs>
        <circle
          className={styles.breath}
          cx="180"
          cy="128"
          r="125"
          fill={url("halo")}
        />
        <g className={styles.farRing}>
          <circle
            cx="180"
            cy="128"
            r="101"
            fill="none"
            stroke="#9cb69a"
            strokeOpacity=".12"
          />
          {Array.from({ length: 48 }, (_, i) => (
            <path
              key={i}
              d={i % 4 === 0 ? "M180 24v6" : "M180 26v3"}
              transform={`rotate(${i * 7.5} 180 128)`}
              stroke={i % 4 === 0 ? "#c1ac7a" : "#799780"}
              strokeWidth={i % 4 === 0 ? 1 : 0.6}
              opacity={i % 4 === 0 ? 0.65 : 0.4}
            />
          ))}
        </g>
        <g className={styles.gyroscope}>
          <ellipse
            cx="180"
            cy="128"
            rx="153"
            ry="60"
            fill="none"
            stroke={url("arc")}
            strokeWidth=".8"
          />
          <ellipse
            cx="180"
            cy="128"
            rx="127"
            ry="44"
            fill="none"
            stroke="#729b81"
            strokeOpacity=".23"
            strokeWidth=".7"
            transform="rotate(54 180 128)"
          />
        </g>
        <g transform="translate(180 128) rotate(-20) scale(1 .4)">
          <g className={styles.orbiter}>
            <circle
              cx="151"
              cy="0"
              r="6"
              fill="#ddc181"
              opacity=".65"
              filter={url("glow")}
            />
            <circle cx="151" cy="0" r="2.7" fill="#f5dfab" />
            <circle cx="-151" cy="0" r="2" fill="#85b69a" />
          </g>
        </g>
        <g className={styles.moon}>
          <circle
            cx="180"
            cy="128"
            r="57"
            fill="none"
            stroke="#c2c598"
            strokeOpacity=".2"
          />
          <g clipPath={url("disc")}>
            <circle
              cx="180"
              cy="128"
              r="55"
              fill={url("surface")}
              filter={url("grain")}
            />
            {[
              [163, 103, 12],
              [197, 110, 17],
              [155, 130, 19],
              [190, 149, 13],
              [171, 160, 8],
              [214, 134, 9],
              [184, 88, 7],
              [147, 107, 7],
              [166, 145, 6],
              [207, 156, 5],
            ].map(([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill={url("crater")} />
            ))}
            <circle
              className={styles.shadow}
              cx="158"
              cy="128"
              r="73"
              fill={url("shade")}
            />
            <circle
              cx="180"
              cy="128"
              r="54.5"
              fill="none"
              stroke="#f5e7bf"
              strokeOpacity=".32"
              strokeWidth=".7"
            />
          </g>
        </g>
        <g transform="translate(180 128) rotate(36) scale(1 .69)">
          <g className={styles.innerOrbiter}>
            <circle
              cx="86"
              cy="0"
              r="5"
              fill="#c5e2c6"
              opacity=".55"
              filter={url("glow")}
            />
            <circle cx="86" cy="0" r="2" fill="#d4eacb" />
          </g>
        </g>
        <path
          className={styles.lightArc}
          d="M85 141a96 96 0 0 1 141-95"
          fill="none"
          stroke="#d6c28d"
          strokeWidth="1"
          strokeDasharray="32 170"
          strokeLinecap="round"
        />
        {[
          [45, 67, 1.3],
          [290, 45, 1],
          [313, 160, 1.5],
          [91, 205, 1],
          [263, 212, 1.2],
          [114, 38, 0.8],
          [56, 171, 0.8],
        ].map(([cx, cy, r], i) => (
          <circle
            className={styles.star}
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="#e5d4a6"
            style={{ animationDelay: `${-i * 1.8}s` }}
          />
        ))}
        <path
          className={styles.starCross}
          d="M287 70v12m-6-6h12"
          stroke="#e5d4a6"
          strokeWidth=".7"
        />
        <path d="M130 243h26m48 0h26" stroke="#c4b380" opacity=".3" />
        <text
          x="180"
          y="246"
          textAnchor="middle"
          fill="#c0ad7e"
          fontSize="8"
          letterSpacing="4"
        >
          日 月 年
        </text>
      </svg>
    </div>
  );
}
