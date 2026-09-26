"use client";

import { useEffect, useRef, useState } from "react";
import spiralGalaxy from "@/assets/generated/galaxy-spiral-natural.webp";
import type { SkyRenderer } from "./sky-renderer";

export function CelestialSky({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlRef = useRef<(() => void) | null>(null);
  const pausedRef = useRef(paused);
  const elapsed = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    pausedRef.current = paused;
    controlRef.current?.();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let renderer: SkyRenderer | null = null;
    let disposed = false;
    let generation = 0;
    let frame = 0;
    let previous = 0;
    let lost = false;
    const canRun = () => !disposed && !lost && !pausedRef.current && !media.matches && !document.hidden;
    const paint = () => {
      renderer?.draw(elapsed.current);
      // Inspectable only on the decorative DOM element; no React updates per frame.
      canvas.dataset.skyTime = elapsed.current.toFixed(3);
    };
    const tick = (now: number) => {
      if (!canRun() || !renderer) return;
      frame = requestAnimationFrame(tick);
      if (previous && now - previous < 1000 / 30) return;
      const delta = previous ? Math.min((now - previous) / 1000, .12) : 0;
      previous = now;
      elapsed.current += delta;
      paint();
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      canvas.dataset.skyMotion = canRun() ? "running" : "paused";
      if (renderer && !lost) paint();
      if (canRun() && renderer) frame = requestAnimationFrame(tick);
    };
    controlRef.current = sync;
    const resize = () => {
      if (!renderer || lost) return;
      const bounds = canvas.getBoundingClientRect();
      renderer.resize(bounds.width, bounds.height);
      paint();
    };
    const initialize = async () => {
      const current = ++generation;
      try {
        const [module, image] = await Promise.all([
          import("./sky-renderer"),
          new Promise<HTMLImageElement>((resolve, reject) => {
            const source = new window.Image();
            source.onload = () => resolve(source);
            source.onerror = () => reject(new Error("Sky texture unavailable"));
            source.src = spiralGalaxy.src;
          }),
        ]);
        if (disposed || lost || current !== generation) return;
        renderer = module.createSkyRenderer(canvas, image);
        resize();
        setReady(true);
        sync();
      } catch (error) {
        if (disposed || current !== generation) return;
        setReady(false);
        console.warn("Celestial sky: using the static fallback.", error);
      }
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      generation++;
      cancelAnimationFrame(frame);
      renderer?.dispose();
      renderer = null;
      setReady(false);
    };
    const onRestored = () => { lost = false; void initialize(); };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    void initialize();
    return () => {
      disposed = true;
      generation++;
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      renderer?.dispose();
      controlRef.current = null;
    };
  }, []);

  return <div className="celestial-sky" data-ready={ready} aria-hidden="true">
    <div className="sky-galaxy-fallback sky-galaxy-fallback-one" style={{ backgroundImage: `url("${spiralGalaxy.src}")` }} />
    <div className="sky-galaxy-fallback sky-galaxy-fallback-two" style={{ backgroundImage: `url("${spiralGalaxy.src}")` }} />
    <canvas ref={canvasRef} className="sky-volume" />
  </div>;
}
