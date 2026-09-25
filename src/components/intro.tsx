"use client";
import { useEffect, useState } from "react";
export function Intro() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (
        !sessionStorage.getItem("astrowed-intro") &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setShow(true);
        sessionStorage.setItem("astrowed-intro", "seen");
        const timer = setTimeout(() => setShow(false), 2100);
        return () => clearTimeout(timer);
      }
    } catch {
      /* Private browsing may disable session storage. */
    }
  }, []);
  return show ? (
    <div className="intro" aria-label="Добро пожаловать в Astrowed">
      <div className="intro-symbols" aria-hidden="true">
        木 火 土 金 水
      </div>
      <small>ASTROWED</small>
      <button onClick={() => setShow(false)}>Пропустить →</button>
    </div>
  ) : null;
}
