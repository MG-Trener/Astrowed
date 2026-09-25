"use client";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useActiveChart } from "@/components/active-chart";
import { elements, elementOf } from "@/domain/bazi/catalog";
import { calculateNew } from "@/domain/bazi/engine";
import { Arrow } from "@/components/icons";

const nodes = elements.map((e, i) => ({
  ...e,
  x: 150 + 74 * Math.cos(((i * 72 - 90) * Math.PI) / 180),
  y: 100 + 74 * Math.sin(((i * 72 - 90) * Math.PI) / 180),
}));
export function DiscoveryVisuals() {
  const { chart } = useActiveChart();
  const [paused, setPaused] = useState(false);
  const [date, setDate] = useState("");
  useEffect(() => {
    setDate(chart?.input.date ?? "");
  }, [chart]);
  const hours = useMemo(() => {
    if (!chart || !date) return [];
    return Array.from({ length: 12 }, (_, i) => {
      const time = `${String(i * 2).padStart(2, "0")}:00`;
      try {
        const result = calculateNew({
          ...chart.input,
          date,
          time,
          unknownTime: false,
        });
        return {
          time,
          day: result.dayMaster.stem,
          pillar: result.pillars.find((p) => p.key === "hour"),
          unavailable: false,
        };
      } catch {
        return { time, pillar: undefined, unavailable: true };
      }
    });
  }, [chart, date]);
  const cards = [
    {
      sub: "ЧЕТЫРЕ СТОЛПА",
      title: "Ваша матрица",
      href: "/chart/current",
      text: chart
        ? `${chart.input.date} · ${chart.input.city}. Цвет показывает стихию каждого знака.`
        : "Рассчитайте карту: здесь оживут ваши столпы года, месяца, дня и часа.",
      art: (
        <svg viewBox="0 0 300 200" aria-hidden="true">
          <path
            className="discovery-track"
            d="M42 135 Q150 20 258 135 M42 60 Q150 185 258 60"
          />
          <path
            className="discovery-stream"
            pathLength="100"
            d="M42 135 Q150 20 258 135 M42 60 Q150 185 258 60"
          />
          {["year", "month", "day", "hour"].map((key, i) => {
            const p = chart?.pillars.find((p) => p.key === key);
            return (
              <g
                className="discovery-pillar"
                style={{ "--i": i } as CSSProperties}
                key={key}
              >
                <rect x={18 + i * 72} y={38} width="48" height="114" rx="6" />
                <text
                  x={42 + i * 72}
                  y="81"
                  fill={p ? elementOf(p.element).color : "#9eb3a6"}
                >
                  {p?.stem ?? "·"}
                </text>
                <text
                  x={42 + i * 72}
                  y="120"
                  fill={p ? elementOf(p.branchElement).color : "#9eb3a6"}
                >
                  {p?.branch ??
                    (key === "hour" && chart?.input.unknownTime ? "?" : "·")}
                </text>
                <text className="discovery-small" x={42 + i * 72} y="174">
                  {["Год", "Месяц", "День", "Час"][i]}
                </text>
              </g>
            );
          })}
        </svg>
      ),
    },
    {
      sub: "ПЯТЬ ЭЛЕМЕНТОВ",
      title: "Всё во взаимодействии",
      href: "/chart/current#chart-pillars",
      text: chart
        ? "Поток порождения и доли элементов вашей карты. Проценты не равны оценке силы."
        : "Дерево → Огонь → Земля → Металл → Вода. Непрерывный цикл порождения.",
      art: (
        <svg viewBox="0 0 300 200" aria-hidden="true">
          {nodes.map((n, i) => {
            const to = nodes[(i + 1) % 5];
            const d = `M${n.x} ${n.y} Q150 100 ${to.x} ${to.y}`;
            return (
              <g key={n.id}>
                <path className="discovery-track" d={d} />
                <path
                  className="discovery-stream"
                  pathLength="100"
                  d={d}
                  style={{ stroke: n.color, animationDelay: `${-i}s` }}
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="23"
                  stroke={n.color}
                  fill="#0c1717"
                />
                <text x={n.x} y={n.y + 7} fill={n.color} fontSize="23">
                  {n.symbol}
                </text>
                {chart && (
                  <text className="discovery-small" x={n.x} y={n.y + 37}>
                    {chart.distribution[n.id]}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      ),
    },
    {
      sub: "ЦИКЛЫ ВЫБРАННОГО ДНЯ",
      title: "День в движении",
      href: "/bazi/current-energies",
      text: chart
        ? `${date} · ${chart.input.timezone}. Двенадцать срезов с шагом 2 часа местного времени; расчёт — по среднему солнечному.`
        : "После расчёта — двенадцать часовых срезов выбранной даты с учётом вашего города.",
      art: (
        <svg viewBox="0 0 300 200" aria-hidden="true">
          <circle cx="150" cy="100" r="70" className="discovery-track" />
          <circle
            cx="150"
            cy="100"
            r="70"
            className="discovery-stream"
            pathLength="100"
          />
          {Array.from({ length: 12 }, (_, i) => {
            const a = ((i * 30 - 90) * Math.PI) / 180;
            const x = 150 + 70 * Math.cos(a),
              y = 100 + 70 * Math.sin(a);
            const p = hours[i]?.pillar;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="14"
                  fill="#0c1717"
                  stroke={p ? elementOf(p.element).color : "#788f84"}
                />
                <text
                  x={x}
                  y={y + 5}
                  fontSize="14"
                  fill={p ? elementOf(p.element).color : "#9eb3a6"}
                >
                  {p?.branch ?? (hours[i]?.unavailable ? "?" : "·")}
                </text>
                <text
                  className="discovery-small"
                  x={150 + 94 * Math.cos(a)}
                  y={103 + 94 * Math.sin(a)}
                >
                  {String(i * 2).padStart(2, "0")}
                </text>
              </g>
            );
          })}
          <text x="150" y="98" fontSize="28" fill="#c4d5ba">
            {hours[6]?.day ?? "日"}
          </text>
          <text className="discovery-small" x="150" y="119">
            12 МОМЕНТОВ
          </text>
        </svg>
      ),
    },
  ];
  return (
    <div className="discovery-visuals" data-paused={paused}>
      <div className="discovery-controls">
        <span>
          {chart
            ? `Ваша карта: ${chart.input.name} · ${chart.input.date}`
            : "Наглядная система · без подставленных дат"}
        </span>
        {chart && (
          <label>
            День цикла{" "}
            <input
              aria-label="День цикла"
              type="date"
              min="1901-01-01"
              max="2099-12-31"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        )}
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "▷ Продолжить" : "Ⅱ Пауза схем"}
        </button>
      </div>
      <div className="discovery-grid">
        {cards.map((item, i) => (
          <Link
            className="discovery-item"
            href={chart ? item.href : "/calculator"}
            key={item.sub}
          >
            <div className="item-top">
              <span className="mono">
                0{i + 1} / {item.sub}
              </span>
              <Arrow diagonal />
            </div>
            <div className="item-art discovery-live-art">{item.art}</div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </Link>
        ))}
      </div>
      {hours.some((h) => h.unavailable) && (
        <p className="method-note">
          ? — местный час отсутствует или неоднозначен при переводе часов.
          Уточните момент в калькуляторе.
        </p>
      )}
    </div>
  );
}
