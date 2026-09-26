"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const preferenceKey = "astrowed-music-enabled";
const track = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/audio/universfield-silent-universe-351473.mp3`;

export function BackgroundMusic() {
  const audio = useRef<HTMLAudioElement>(null);
  const request = useRef(0);
  const starting = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");

  const start = useCallback(async () => {
    const player = audio.current;
    if (!player) return;
    const attempt = ++request.current;
    starting.current = true;
    setPending(true);
    setNotice("");
    try {
      await player.play();
    } catch (error) {
      if (attempt !== request.current) return;
      setPlaying(false);
      setNotice(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Нажмите, чтобы включить фоновую музыку"
          : "Музыка не загрузилась. Нажмите, чтобы повторить",
      );
    } finally {
      if (attempt === request.current) {
        starting.current = false;
        setPending(false);
      }
    }
  }, []);

  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    player.volume = 0.25;
    let enabled = true;
    try {
      enabled = localStorage.getItem(preferenceKey) !== "false";
    } catch {
      // Music controls also work when storage is unavailable.
    }
    if (enabled) void start();
    return () => {
      ++request.current;
      starting.current = false;
      player.pause();
    };
  }, [start]);

  function toggle() {
    const player = audio.current;
    if (!player) return;
    const enabled = player.paused && !starting.current;
    try {
      localStorage.setItem(preferenceKey, String(enabled));
    } catch {
      // Retain the choice for the current visit.
    }
    if (enabled) {
      if (player.error) player.load();
      void start();
    } else {
      ++request.current;
      starting.current = false;
      player.pause();
      setPlaying(false);
      setPending(false);
      setNotice("");
    }
  }

  const label = pending
    ? "Отменить включение музыки"
    : playing
      ? "Выключить музыку"
      : "Включить музыку";
  return (
    <>
      <audio
        ref={audio}
        src={track}
        loop
        preload="none"
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setNotice("Музыка не загрузилась. Нажмите, чтобы повторить");
        }}
      />
      <button
        type="button"
        className="music-toggle"
        aria-label={label}
        aria-pressed={playing}
        title={notice || `${label} · Silent Universe — Universfield`}
        onClick={toggle}
        data-playing={playing}
      >
        <span className="music-bars" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
        <span className="music-label">{pending ? "Загрузка…" : playing ? "Звук вкл" : "Звук выкл"}</span>
      </button>
      <span className="music-status" role="status">{notice}</span>
    </>
  );
}
