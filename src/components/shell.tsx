"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Arrow } from "./icons";
import Image from "next/image";
import logo from "@/assets/generated/astrowed-logo.webp";
import { StarMap } from "@/scenes/star-map";
import { ActiveChartProvider } from "./active-chart";
import { BackgroundMusic } from "./background-music";
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [compact, setCompact] = useState(false);
  const [skyPaused, setSkyPaused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  useEffect(() => {
    try {
      setCompact(localStorage.getItem("astrowed-mode") === "compact");
      setSkyPaused(localStorage.getItem("astrowed-sky-paused") === "true");
    } catch {
      // The interface remains usable when browser storage is unavailable.
    }
  }, []);
  useEffect(() => {
    const sync = () => setPageHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  const links = [
    ["/bazi", "Ба Цзы"],
    ["/feng-shui", "Фэн Шуй"],
    ["/compasses", "Компасы"],
    ["/calendar", "Календарь"],
    ["/qimen", "Ци Мэнь"],
    ["/knowledge", "Библиотека"],
    ["/about-julia", "Эксперт"],
  ];
  return (
    <ActiveChartProvider>
      <div
        className={compact ? "app compact" : "app"}
        data-sky-paused={skyPaused || pageHidden || compact}
      >
        <StarMap paused={skyPaused || pageHidden || compact} />
        <a className="skip-link" href="#main">
          К содержимому
        </a>
        <header className="header">
          <Link className="brand" href="/" aria-label="Astrowed — главная">
            <Image
              className="brand-emblem"
              src={logo}
              alt=""
              width={48}
              height={48}
              priority
            />
            <span>
              ASTROWED<small>DIGITAL DESTINY LAB</small>
            </span>
          </Link>
          <nav
            id="site-navigation"
            className={menu ? "nav open" : "nav"}
            aria-label="Основная навигация"
          >
            {links.map(([href, label]) => (
              <Link
                onClick={() => setMenu(false)}
                key={href}
                href={href}
                className={
                  path === href || path.startsWith(href + "/") ? "active" : ""
                }
              >
                {label}
              </Link>
            ))}
            <Link className="nav-workspace" href="/clients" onClick={() => setMenu(false)}>
              Кабинет ↗
            </Link>
          </nav>
          <div className="header-actions">
            <BackgroundMusic />
            <Link className="workspace-link" href="/clients">
              Кабинет <Arrow diagonal />
            </Link>
            <button
              className="menu-button"
              aria-expanded={menu}
              aria-controls="site-navigation"
              aria-label="Меню"
              onClick={() => setMenu(!menu)}
            >
              {menu ? "Закрыть" : "Меню ☰"}
            </button>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="footer">
          <Link href="/" className="footer-brand">
            <Image
              className="brand-emblem"
              src={logo}
              alt=""
              width={32}
              height={32}
            />{" "}
            ASTROWED
          </Link>
          <Link href="/about-julia">
            Юлия Гаврилычева · запись на консультацию ↗
          </Link>
          <button
            onClick={() => {
              try {
                localStorage.setItem(
                  "astrowed-mode",
                  compact ? "immersive" : "compact",
                );
              } catch {
                // Apply the preference for this visit without persistent storage.
              }
              setCompact(!compact);
            }}
            aria-pressed={compact}
          >
            {compact ? "◉ Профессиональный режим" : "◎ Режим исследования"}
          </button>
          <Link href="/reports" className="mono">
            PDF-ОТЧЁТЫ ↗
          </Link>
          <button
            className="sky-motion-toggle"
            aria-pressed={skyPaused}
            onClick={() => {
              setSkyPaused(!skyPaused);
              try {
                localStorage.setItem("astrowed-sky-paused", String(!skyPaused));
              } catch {
                /* Preference remains active for this visit. */
              }
            }}
          >
            {skyPaused ? "▷ Оживить звёзды" : "Ⅱ Пауза фона"}
          </button>
        </footer>
      </div>
    </ActiveChartProvider>
  );
}
