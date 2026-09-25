"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Mark, Arrow } from "./icons";
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    try {
      setCompact(localStorage.getItem("astrowed-mode") === "compact");
    } catch {
      // The interface remains usable when browser storage is unavailable.
    }
  }, []);
  const links = [
    ["/bazi", "Ба Цзы"],
    ["/feng-shui", "Фэн Шуй"],
    ["/qimen", "Ци Мэнь"],
    ["/knowledge", "Библиотека"],
    ["/about-julia", "Эксперт"],
  ];
  return (
    <div className={compact ? "app compact" : "app"}>
      <a className="skip-link" href="#main">
        К содержимому
      </a>
      <header className="header">
        <Link className="brand" href="/" aria-label="Astrowed — главная">
          <Mark />
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
        </nav>
        <div className="header-actions">
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
          <Mark small /> ASTROWED
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
      </footer>
    </div>
  );
}
