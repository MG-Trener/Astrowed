"use client";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { elements, type ElementId } from "@/domain/bazi/catalog";
import { elementArtwork, observatoryArtwork } from "@/assets/artwork";
import { CosmicField } from "./cosmic-field";

const nodes = elements.map((element, index) => {
  const angle = ((index * 72 - 90) * Math.PI) / 180;
  return {
    ...element,
    x: 300 + Math.cos(angle) * 226,
    y: 300 + Math.sin(angle) * 226,
  };
});
const objectNames: Record<ElementId, string> = {
  wood: "дерево",
  fire: "огонь",
  earth: "землю",
  metal: "металл",
  water: "воду",
};

export function HeroArtwork() {
  const [active, setActive] = useState<ElementId | null>(null);
  const [cycle, setCycle] = useState<"creation" | "control">("creation");
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const id = useId().replace(/:/g, "");
  const running = visible && !paused && !reduced;
  const art = active ? elementArtwork[active] : observatoryArtwork;
  const element = elements.find((e) => e.id === active);
  const activeIndex = elements.findIndex((e) => e.id === active);
  const step = cycle === "creation" ? 1 : 2;
  const related = activeIndex < 0 ? null : elements[(activeIndex + step) % 5];

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReduced(preference.matches);
    let inView = false;
    const syncVisibility = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncVisibility();
      },
      { threshold: 0.05 },
    );
    syncPreference();
    observer.observe(scene);
    preference.addEventListener("change", syncPreference);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", syncPreference);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className="hero-scene hero-scene--illustrated cosmic-scene"
      data-running={running}
      data-cycle={cycle}
      style={{ "--cosmic-color": element?.color ?? "#a7cbb8" } as CSSProperties}
      onPointerMove={(event) => {
        if (!running || event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        pointerRef.current = {
          x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
          y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
        };
      }}
      onPointerLeave={() => {
        pointerRef.current = { x: 0, y: 0 };
      }}
    >
      <div className="hero-art-stage">
        <CosmicField
          running={running}
          reduced={reduced}
          stageRef={stageRef}
          pointerRef={pointerRef}
        />
        <div ref={stageRef} className="cosmic-universe">
          <div className="cosmic-aura" aria-hidden="true" />
          <div className="cosmic-art-core">
            <Image
              key={active ?? "observatory"}
              src={art.image}
              alt={art.alt}
              unoptimized
              loading="eager"
              fetchPriority={active ? "auto" : "high"}
              className="hero-art-image"
            />
          </div>
          <svg
            className="cosmic-connections"
            viewBox="0 0 600 600"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              {nodes.map((node, index) => {
                const target = nodes[(index + step) % 5];
                return (
                  <linearGradient
                    key={node.id}
                    id={`${id}-${node.id}`}
                    gradientUnits="userSpaceOnUse"
                    x1={node.x}
                    y1={node.y}
                    x2={target.x}
                    y2={target.y}
                  >
                    <stop stopColor={node.color} />
                    <stop offset="1" stopColor={target.color} />
                  </linearGradient>
                );
              })}
            </defs>
            <g className="cosmic-orbits">
              <circle cx="300" cy="300" r="268" />
              <circle cx="300" cy="300" r="254" strokeDasharray="1 12" />
              <ellipse
                cx="300"
                cy="300"
                rx="283"
                ry="150"
                transform="rotate(-32 300 300)"
              />
              <ellipse
                cx="300"
                cy="300"
                rx="283"
                ry="150"
                transform="rotate(32 300 300)"
              />
            </g>
            <g className="cosmic-astrolabe">
              {Array.from({ length: 60 }, (_, i) => (
                <path
                  key={i}
                  d={`M300 22v${i % 5 === 0 ? 8 : 3}`}
                  transform={`rotate(${i * 6} 300 300)`}
                />
              ))}
              <circle cx="300" cy="32" r="3" fill="#d7bb83" stroke="none" />
            </g>
            {nodes.map((node, index) => {
              const target = nodes[(index + step) % 5];
              const path =
                cycle === "creation"
                  ? `M${node.x} ${node.y} A226 226 0 0 1 ${target.x} ${target.y}`
                  : `M${node.x} ${node.y} Q300 300 ${target.x} ${target.y}`;
              const lit = !active || active === node.id;
              return (
                <g
                  key={`${node.id}-${cycle}`}
                  className="cosmic-link"
                  data-lit={lit}
                  style={
                    { "--flow-delay": `${-index * 1.6}s` } as CSSProperties
                  }
                >
                  <path
                    d={path}
                    stroke={`url(#${id}-${node.id})`}
                    className="cosmic-thread"
                  />
                  <path
                    d={path}
                    stroke={node.color}
                    pathLength="100"
                    className="cosmic-flow cosmic-flow-halo"
                  />
                  <path
                    d={path}
                    stroke={`url(#${id}-${node.id})`}
                    pathLength="100"
                    className="cosmic-flow"
                  />
                </g>
              );
            })}
          </svg>
          <div
            className="cosmic-nodes"
            role="group"
            aria-label="Выберите стихию, чтобы увидеть её связи"
          >
            {nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className="cosmic-node"
                aria-label={node.name}
                aria-pressed={active === node.id}
                data-related={related?.id === node.id}
                onClick={() => setActive(active === node.id ? null : node.id)}
                style={
                  {
                    left: `${node.x / 6}%`,
                    top: `${node.y / 6}%`,
                    "--element": node.color,
                  } as CSSProperties
                }
              >
                <span className="cosmic-node-symbol" aria-hidden="true">
                  {node.symbol}
                </span>
                <span className="cosmic-node-name">{node.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="scene-tag art-heading">
        <i /> ЖИВАЯ АРХИТЕКТУРА СВЯЗЕЙ
      </div>
      <div className="art-caption" aria-live="polite">
        <span className="mono">
          {element
            ? `${element.en} / ${element.quality}`
            : "FIVE ELEMENTS / ONE UNIVERSE"}
        </span>
        <span>
          {element && related
            ? `${element.name} ${cycle === "creation" ? "порождает" : "контролирует"} ${objectNames[related.id]}.`
            : "Ни одна стихия не существует отдельно."}
        </span>
      </div>
      <div
        className="cosmic-cycle-switch"
        role="group"
        aria-label="Цикл взаимодействия"
      >
        <button
          type="button"
          aria-pressed={cycle === "creation"}
          onClick={() => setCycle("creation")}
        >
          <span aria-hidden="true">↻</span> Порождение
        </button>
        <button
          type="button"
          aria-pressed={cycle === "control"}
          onClick={() => setCycle("control")}
        >
          <span aria-hidden="true">✧</span> Контроль
        </button>
      </div>
      <div className="cosmic-toolbar">
        <button
          type="button"
          onClick={() => setActive(null)}
          disabled={!active}
        >
          ◎ Все стихии
        </button>
        <span className="cosmic-hint">Выберите стихию</span>
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          disabled={reduced}
          aria-label={
            reduced
              ? "Движение отключено в настройках устройства"
              : paused
                ? "Продолжить анимацию"
                : "Приостановить анимацию"
          }
        >
          <span aria-hidden="true">{paused || reduced ? "▷" : "Ⅱ"}</span>{" "}
          {reduced ? "Без движения" : paused ? "Продолжить" : "Пауза"}
        </button>
      </div>
    </div>
  );
}
