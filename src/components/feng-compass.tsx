"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { CompassCitySearch } from "./compass-city-search";
import { FengCompassMap, type CompassMode } from "./feng-compass-map";
import {
  mountainAt,
  normalizeBearing,
  boundaryDistance,
  elementColors,
  type Coordinates,
} from "@/domain/feng-shui/compass";
import styles from "./feng-compass.module.css";

const demo = { lat: 43.2567, lng: 76.9286 };
const elementNames = {
  wood: "Дерево",
  fire: "Огонь",
  earth: "Земля",
  metal: "Металл",
  water: "Вода",
};
const degrees = (n: number) =>
  `${n.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}°`;
export function FengCompass() {
  const [center, setCenter] = useState<Coordinates>(demo),
    [place, setPlace] = useState("Алматы · демо");
  const [view, setView] = useState({ zoom: 16, request: 0 });
  const [mode, setMode] = useState<CompassMode>("explore");
  const [bearing, setBearing] = useState(180),
    [rotation, setRotation] = useState(0);
  const [size, setSize] = useState(540),
    [opacity, setOpacity] = useState(0.88),
    [visible, setVisible] = useState(true);
  const workspace = useRef<HTMLDivElement>(null);
  const [exportStatus, setExportStatus] = useState("");
  const [searchKey, setSearchKey] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const measured = normalizeBearing(bearing - rotation),
    facing = mountainAt(measured),
    sitting = mountainAt(measured + 180);
  const zoomTo = (zoom: number) =>
    setView((v) => ({ zoom, request: v.request + 1 }));
  const selectCity = (point: Coordinates, name: string) => {
    setCenter(point);
    setPlace(name);
    zoomTo(13);
    setMode("explore");
  };
  const changeCenter = (point: Coordinates) => {
    setCenter(point);
    setPlace("Выбранная точка");
  };
  function exportDial() {
    const source = workspace.current?.querySelector("svg[data-compass-dial]");
    if (!source) return;
    const svg = source.cloneNode(true) as SVGSVGElement;
    svg.setAttribute("width", "1200");
    svg.setAttribute("height", "1200");
    svg.removeAttribute("style");
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "astrowed-luopan.svg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportStatus("Круг компаса сохранён в SVG с прозрачным фоном.");
  }
  return (
    <div className={`page-wrap ${styles.page}`}>
      <Link href="/feng-shui" className={styles.back}>
        ← ФЭН ШУЙ
      </Link>
      <header className={styles.heading}>
        <div>
          <div className="eyebrow">羅盤 / ИСКУССТВО НАПРАВЛЕНИЯ</div>
          <h1>
            Компас <em>Фэн Шуй</em>
          </h1>
          <p>
            Найдите место. Установите центр. Посмотрите, как восемь направлений
            раскрываются вокруг вашего дома.
          </p>
        </div>
        <div className={styles.seal}>
          羅盤<small>24 ГОРЫ · 8 ТРИГРАММ</small>
        </div>
      </header>
      <div className={styles.workspace} ref={workspace}>
        <div className={styles.topbar}>
          <CompassCitySearch key={searchKey} onSelect={selectCity} />
          <button
            className={styles.demo}
            onClick={() => {
              setCenter(demo);
              setSearchKey((n) => n + 1);
              setPlace("Алматы · демо");
              setBearing(180);
              setRotation(0);
              setSize(540);
              setOpacity(0.88);
              setVisible(true);
              setMode("explore");
              zoomTo(16);
            }}
          >
            Демо · Алматы ↗
          </button>
        </div>
        <div className={styles.workGrid}>
          <div className={styles.mapColumn}>
            <div className={styles.toolbar} aria-label="Работа с картой">
              <button
                aria-pressed={mode === "center"}
                onClick={() =>
                  setMode(mode === "center" ? "explore" : "center")
                }
              >
                ⊕ Поставить центр
              </button>
              <button
                aria-pressed={mode === "facing"}
                onClick={() =>
                  setMode(mode === "facing" ? "explore" : "facing")
                }
              >
                ↗ Указать фасад
              </button>
              <button onClick={() => zoomTo(19)}>Здание +</button>
              <button onClick={() => zoomTo(13)}>Город −</button>
              <button
                aria-pressed={visible}
                onClick={() => setVisible((v) => !v)}
              >
                {visible ? "Скрыть круг" : "Показать круг"}
              </button>
            </div>
            <FengCompassMap
              center={center}
              view={view}
              mode={mode}
              bearing={bearing}
              rotation={rotation}
              size={size}
              opacity={opacity}
              visible={visible}
              onCenter={changeCenter}
              onBearing={setBearing}
              onDone={() => setMode("explore")}
              onReady={() => setMapReady(true)}
            />
            <div className={styles.mapFooter}>
              <span>
                <strong>{place}</strong> · {center.lat.toFixed(5)},{" "}
                {center.lng.toFixed(5)}
              </span>
              <button onClick={() => zoomTo(view.zoom)}>К центру ↗</button>
            </div>
          </div>
          <aside
            className={styles.panel}
            aria-label="Настройки и показания компаса"
          >
            <div className={styles.readout}>
              <div className={styles.kicker}>НАПРАВЛЕНИЕ ФАСАДА</div>
              <div className={styles.bearing}>
                {degrees(measured)}
                <span style={{ color: elementColors[facing.element] }}>
                  {facing.han}
                </span>
              </div>
              <h2>
                {facing.direction.direction} <span>· {facing.code}</span>
              </h2>
              <p>
                {facing.name} · {elementNames[facing.element]} ·{" "}
                {degrees(facing.start)}–{degrees(facing.end)}
              </p>
            </div>
            <div className={styles.pair}>
              <div>
                <small>Триграмма</small>
                <strong>
                  {facing.direction.trigram} {facing.direction.name}
                </strong>
              </div>
              <div>
                <small>Тыл · {degrees(normalizeBearing(measured + 180))}</small>
                <strong>
                  {sitting.han} {sitting.name} · {sitting.code}
                </strong>
              </div>
            </div>
            {boundaryDistance(measured) < 1 && (
              <p className={styles.boundary}>
                Рядом граница двух гор. Уточните измерение на месте.
              </p>
            )}
            <div className={styles.controls}>
              <label>
                Азимут фасада на карте{" "}
                <div className={styles.numberRow}>
                  <input
                    aria-label="Азимут фасада"
                    type="number"
                    min="0"
                    max="359.9"
                    step="0.1"
                    value={Number(bearing.toFixed(1))}
                    onChange={(e) => {
                      if (
                        e.target.value !== "" &&
                        Number.isFinite(e.target.valueAsNumber)
                      )
                        setBearing(normalizeBearing(e.target.valueAsNumber));
                    }}
                  />
                  <span>° от севера</span>
                </div>
                <input
                  aria-label="Изменить азимут фасада"
                  type="range"
                  min="0"
                  max="359.9"
                  step=".1"
                  value={bearing}
                  onChange={(e) => setBearing(+e.target.value)}
                />
              </label>
              <label>
                Размер круга <output>{size} px</output>
                <input
                  aria-label="Размер круга"
                  type="range"
                  min="260"
                  max="660"
                  step="10"
                  value={size}
                  onChange={(e) => setSize(+e.target.value)}
                />
              </label>
              <label>
                Прозрачность <output>{Math.round((1 - opacity) * 100)}%</output>
                <input
                  aria-label="Прозрачность круга"
                  type="range"
                  min="0"
                  max="75"
                  value={Math.round((1 - opacity) * 100)}
                  onChange={(e) => setOpacity(1 - +e.target.value / 100)}
                />
              </label>
              <label>
                Поворот севера <output>{degrees(rotation)}</output>
                <input
                  aria-label="Поворот севера"
                  type="range"
                  min="-180"
                  max="180"
                  step=".5"
                  value={rotation}
                  onChange={(e) => setRotation(+e.target.value)}
                />
              </label>
              <button
                className={styles.resetNorth}
                onClick={() => setRotation(0)}
              >
                ↑ Совместить север с картой
              </button>
              <p className={styles.hint}>
                {rotation === 0
                  ? "Круг совмещён с географическим севером карты."
                  : `Север круга повёрнут на ${degrees(rotation)} по часовой стрелке. Показание круга = азимут карты − поворот.`}{" "}
                Магнитное склонение автоматически не учитывается.
              </p>
            </div>
            <details className={styles.coordinates}>
              <summary>Указать точные координаты</summary>
              <form
                key={`${center.lat},${center.lng}`}
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  changeCenter({
                    lat: Number(data.get("latitude")),
                    lng: Number(data.get("longitude")),
                  });
                  zoomTo(19);
                }}
              >
                <label>
                  Широта
                  <input
                    name="latitude"
                    type="number"
                    min="-85"
                    max="85"
                    step="any"
                    defaultValue={center.lat.toFixed(6)}
                    required
                  />
                </label>
                <label>
                  Долгота
                  <input
                    name="longitude"
                    type="number"
                    min="-180"
                    max="180"
                    step="any"
                    defaultValue={center.lng.toFixed(6)}
                    required
                  />
                </label>
                <button type="submit">Показать на карте ↗</button>
              </form>
            </details>
            <button
              className={styles.export}
              onClick={exportDial}
              disabled={!visible || !mapReady}
            >
              ↓ Скачать круг SVG
            </button>
            <p className={styles.hint} role="status">
              {exportStatus || "Прозрачный круг для наложения на ваш план."}
            </p>
          </aside>
        </div>
      </div>
      <section className={styles.guide} aria-label="Как пользоваться компасом">
        {[
          [
            "01",
            "Найдите свой дом",
            "Выберите город, приблизьте здание кнопкой «Здание +» и перемещайте карту. Можно ввести точные координаты.",
          ],
          [
            "02",
            "Установите центр",
            "Нажмите «Поставить центр» и выберите середину здания. Для уточнения перетащите золотую метку в центре круга.",
          ],
          [
            "03",
            "Задайте направление",
            "Нажмите «Указать фасад» и отметьте точку наружу от фасада. Круг покажет гору, триграмму и противоположный тыл.",
          ],
        ].map(([n, title, text]) => (
          <article key={n}>
            <span>{n}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <div className={styles.note}>
        <p>
          Города:{" "}
          <a
            href="https://www.geonames.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            GeoNames
          </a>{" "}
          ·{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY 4.0
          </a>
          . Карта: OpenStreetMap.
        </p>
        <p>
          Кольцо земной тарелки: 24 сектора по 15°, восемь триграмм Позднего
          Неба и шкала азимута. Нажатие на иероглиф выбирает середину горы.
          Размер круга задаёт область наложения на экране, а не границы участка.
        </p>
        <p>
          Карта помогает разметить направления. Она не заменяет измерение
          лопанем на месте и сама по себе не определяет энергетическую карту
          дома.
        </p>
        <div>
          <Link href="/knowledge/feng-shui-compass">Как читать компас ↗</Link>
          <Link href="/feng-shui/gua">Личное Гуа ↗</Link>
          <a
            href="https://www.openstreetmap.org/fixthemap"
            target="_blank"
            rel="noopener noreferrer"
          >
            Уточнить данные карты ↗
          </a>
        </div>
      </div>
    </div>
  );
}
