"use client";

import { useEffect, useRef, type RefObject } from "react";

type Point = { x: number; y: number };

/** One bounded render loop for the dust and pointer depth; no React updates per frame. */
export function CosmicField({
  running,
  reduced,
  stageRef,
  pointerRef,
}: {
  running: boolean;
  reduced: boolean;
  stageRef: RefObject<HTMLDivElement | null>;
  pointerRef: RefObject<Point>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const depthRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !stage) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let previous = 0;
    // Stable star positions also keep resize and pause/resume visually continuous.
    const stars = Array.from({ length: 76 }, (_, i) => ({
      x: ((i * 137.508 + 19) % 997) / 997,
      y: ((i * 211.71 + 83) % 991) / 991,
      size: 0.45 + (i % 4) * 0.3,
      phase: i * 2.399,
      depth: 0.35 + (i % 5) * 0.16,
    }));

    const paint = () => {
      const time = timeRef.current;
      const depth = depthRef.current;
      context.clearRect(0, 0, width, height);
      for (const [index, star] of stars.entries()) {
        if (width < 400 && index % 2) continue;
        const x =
          star.x * width +
          Math.sin(time * 0.09 + star.phase) * 9 +
          depth.x * star.depth;
        const y =
          star.y * height +
          Math.cos(time * 0.07 + star.phase) * 7 +
          depth.y * star.depth;
        const alpha = 0.25 + (Math.sin(time * 0.65 + star.phase) + 1) * 0.22;
        context.fillStyle = `rgba(196, 219, 208, ${alpha})`;
        context.beginPath();
        context.arc(x, y, star.size, 0, Math.PI * 2);
        context.fill();
        if (index % 9 === 0) {
          context.strokeStyle = `rgba(180, 212, 196, ${alpha * 0.28})`;
          context.beginPath();
          context.moveTo(x - 4, y);
          context.lineTo(x + 4, y);
          context.moveTo(x, y - 4);
          context.lineTo(x, y + 4);
          context.stroke();
        }
      }
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint();
    };

    if (reduced) {
      depthRef.current = { x: 0, y: 0 };
      stage.style.transform = "none";
    }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (previous && now - previous < 1000 / 30) return;
      const delta = previous ? Math.min((now - previous) / 1000, 0.1) : 0;
      previous = now;
      timeRef.current += delta;
      const depth = depthRef.current;
      const blend = 1 - Math.exp(-delta * 5);
      depth.x += (pointerRef.current.x * 9 - depth.x) * blend;
      depth.y += (pointerRef.current.y * 9 - depth.y) * blend;
      stage.style.transform = `perspective(900px) rotateX(${-depth.y * 0.22}deg) rotateY(${depth.x * 0.22}deg)`;
      paint();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (running) frame = requestAnimationFrame(tick);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [running, reduced, stageRef, pointerRef]);

  return <canvas ref={canvasRef} className="cosmic-dust" aria-hidden="true" />;
}
