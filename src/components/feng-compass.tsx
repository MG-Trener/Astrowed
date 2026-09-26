"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { directionQualities, guaDirections } from "@/domain/feng-shui/catalog";
import { CompassCitySearch } from "./compass-city-search";
import { CompassModeIcon } from "./compass-mode-icon";
import { FengCompassMap, type CompassMode } from "./feng-compass-map";
import {
  mountainAt,
  normalizeBearing,
  boundaryDistance,
  elementColors,
  type Coordinates,
  type CompassKind,
  bearingBetween,
  distanceBetween,
} from "@/domain/feng-shui/compass";
import styles from "./feng-compass.module.css";

const demo = { lat: 51.106, lng: 71.416 };
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
    [place, setPlace] = useState("Астана · Ботанический сад");
  const [view, setView] = useState({ zoom: 15.5, request: 0 });
  const [mode, setMode] = useState<CompassMode>("explore");
  const [bearing, setBearing] = useState(180),
    [rotation, setRotation] = useState(0);
  const [size, setSize] = useState(540),
    [opacity, setOpacity] = useState(0.88),
    [visible, setVisible] = useState(true);
  const workspace = useRef<HTMLDivElement>(null);
  const tool = useRef<HTMLDivElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  function closeExpanded() {
    setExpanded(false);
    expandButton.current?.focus({ preventScroll: true });
  }
  function toggleExpanded() {
    if (expanded) return closeExpanded();
    setExpanded(true);
    setPanelOpen(true);
  }
  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeExpanded();
      }
      if (event.key === "Tab") {
        const items = Array.from(
          tool.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), select, a[href], summary, [tabindex="0"]',
          ) ?? [],
        ).filter((item) => item.getClientRects().length > 0);
        const first = items[0],
          last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [expanded]);
  const [exportStatus, setExportStatus] = useState("");
  const [searchKey, setSearchKey] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [kind, setKind] = useState<CompassKind>("luopan"),
    [gua, setGua] = useState(1);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [northRequest, setNorthRequest] = useState(0);
  const [locating, setLocating] = useState(false),
    [locationStatus, setLocationStatus] = useState("");
  const locationRequest = useRef(0);
  useEffect(
    () => () => {
      locationRequest.current++;
    },
    [],
  );
  useEffect(() => {
    if (kind === "route" && destination) {
      const angle = bearingBetween(center, destination);
      if (angle !== null) setBearing(angle);
    }
  }, [center, destination, kind]);
  function changeBearing(angle: number) {
    setBearing(angle);
    if (kind === "route") setDestination(null);
  }
  function locate() {
    setSearchKey((n) => n + 1);
    if (!navigator.geolocation) {
      setLocationStatus(
        "Геолокация недоступна в этом браузере. Выберите город или координаты.",
      );
      return;
    }
    const request = ++locationRequest.current;
    setLocating(true);
    setLocationStatus("Ожидаем разрешение браузера и координаты…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (request !== locationRequest.current) return;
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setPlace("Моё местоположение");
        zoomTo(17);
        setMode("explore");
        setLocating(false);
        setLocationStatus(
          `Местоположение определено. Точность около ${Math.round(position.coords.accuracy)} м. При необходимости уточните центр вручную.`,
        );
      },
      (error) => {
        if (request !== locationRequest.current) return;
        setLocating(false);
        setLocationStatus(
          error.code === 1
            ? "Доступ к местоположению не разрешён. Можно выбрать город или ввести координаты."
            : error.code === 3
              ? "Определение места заняло слишком много времени. Повторите или выберите город."
              : "Не удалось определить место. Выберите город или координаты.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }
  const measured = normalizeBearing(bearing - rotation),
    facing = mountainAt(measured),
    sitting = mountainAt(measured + 180);
  const zoomTo = (zoom: number) =>
    setView((v) => ({ zoom, request: v.request + 1 }));
  const selectCity = (point: Coordinates, name: string, zoom = 13) => {
    locationRequest.current++;
    setLocating(false);
    setLocationStatus("");
    setCenter(point);
    setPlace(name);
    zoomTo(zoom);
    setMode("explore");
  };
  const changeCenter = (point: Coordinates) => {
    setSearchKey((n) => n + 1);
    locationRequest.current++;
    setLocating(false);
    setLocationStatus("");
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
            <em>Компасы</em> пространства
          </h1>
          <p>
            Дом, личные направления и поездки. Одна карта — разные способы
            увидеть пространство.
          </p>
        </div>
        <div className={styles.seal}>
          羅盤<small>24 ГОРЫ · 8 ТРИГРАММ</small>
        </div>
      </header>
      <div
        ref={tool}
        className={expanded ? styles.expanded : undefined}
        role={expanded ? "dialog" : undefined}
        aria-modal={expanded ? true : undefined}
        aria-label={expanded ? "Карта и компас на весь экран" : undefined}
        data-panel-open={panelOpen}
      >
        <div className={styles.viewBar}>
          <span>
            {expanded ? "КОМПАСЫ · ПРОСТРАНСТВО" : "КАРТА И НАПРАВЛЕНИЯ"}
          </span>
          {expanded && (
            <button
              onClick={() => setPanelOpen((value) => !value)}
              aria-expanded={panelOpen}
              aria-controls="compass-controls"
            >
              {panelOpen ? "Скрыть панель" : "Показать панель"}
            </button>
          )}
          <button
            ref={expandButton}
            onClick={toggleExpanded}
            aria-expanded={expanded}
          >
            {expanded ? "↙ Вернуться на сайт · Esc" : "⛶ На весь экран"}
          </button>
        </div>
        <div
          className={styles.modeTabs}
          role="group"
          aria-label="Назначение компаса"
        >
          {(
            [
              ["luopan", "24 горы", "Фасад и точный сектор"],
              ["bagua", "Багуа", "Триграммы пространства"],
              ["gua", "Личное Гуа", "Направления человека"],
              ["route", "Поездка", "Азимут и расстояние"],
            ] as const
          ).map(([id, title, text]) => (
            <button
              key={id}
              aria-pressed={kind === id}
              onClick={() => {
                setKind(id);
                setMode("explore");
              }}
            >
              <span className={styles.modeIcon}>
                <CompassModeIcon kind={id} />
              </span>
              <span className={styles.modeLabel}>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
              <span className={styles.modeIndicator} aria-hidden="true">
                {kind === id ? "●" : "↗"}
              </span>
            </button>
          ))}
        </div>
        <div className={styles.workspace} ref={workspace}>
          <div className={styles.topbar}>
            <CompassCitySearch key={searchKey} onSelect={selectCity} />
            <button
              className={styles.demo}
              onClick={() => {
                setCenter(demo);
                setSearchKey((n) => n + 1);
                setPlace("Астана · Ботанический сад");
                setBearing(180);
                setDestination(null);
                setNorthRequest((n) => n + 1);
                locationRequest.current++;
                setLocating(false);
                setLocationStatus("");
                setRotation(0);
                setSize(540);
                setOpacity(0.88);
                setVisible(true);
                setMode("explore");
                zoomTo(15.5);
              }}
            >
              Демо · Ботанический сад ↗
            </button>
          </div>
          <div className={styles.workGrid}>
            <div className={styles.mapColumn}>
              <div className={styles.toolbar} aria-label="Работа с картой">
                <button onClick={locate} disabled={locating}>
                  {locating ? "Определяем…" : "◎ Моё местоположение"}
                </button>
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
                  {kind === "route" ? "↗ Конечная точка" : "↗ Указать фасад"}
                </button>
                <button
                  onClick={() => {
                    setNorthRequest((n) => n + 1);
                    setRotation(0);
                  }}
                >
                  ↑ По северу
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
              {locationStatus && (
                <p className={styles.locationStatus} role="status">
                  {locationStatus}
                </p>
              )}
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
                kind={kind}
                gua={gua}
                destination={destination}
                northRequest={northRequest}
                onDestination={setDestination}
                onBearing={changeBearing}
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
              id="compass-controls"
              className={styles.panel}
              aria-label="Настройки и показания компаса"
            >
              <div className={styles.readout}>
                <div className={styles.kicker}>
                  {kind === "route"
                    ? "АЗИМУТ ОТПРАВЛЕНИЯ"
                    : kind === "luopan"
                      ? "НАПРАВЛЕНИЕ ФАСАДА"
                      : "ВЫБРАННОЕ НАПРАВЛЕНИЕ"}
                </div>
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
                  <small>
                    Тыл · {degrees(normalizeBearing(measured + 180))}
                  </small>
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
              {kind === "gua" && (
                <label className={styles.guaSelect}>
                  Ваше число Гуа
                  <select value={gua} onChange={(e) => setGua(+e.target.value)}>
                    {[1, 2, 3, 4, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        Гуа {n}
                      </option>
                    ))}
                  </select>
                  <Link href="/feng-shui/gua">Рассчитать своё Гуа ↗</Link>
                </label>
              )}
              <section
                className={styles.interpretation}
                aria-label="Описание настроенного компаса"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className={styles.kicker}>ЧТО ПОКАЗЫВАЕТ КОМПАС</div>
                <h3>
                  {kind === "gua"
                    ? directionQualities[
                        guaDirections[gua].indexOf(facing.direction.id)
                      ][0]
                    : kind === "route"
                      ? "Направление поездки"
                      : facing.direction.name +
                        " · " +
                        facing.direction.direction}
                </h3>
                <p>
                  {kind === "luopan"
                    ? `Фасад ${degrees(measured)} попадает в гору ${facing.name} (${facing.han}), сектор ${facing.code}. Его границы: ${degrees(facing.start)}–${degrees(facing.end)}. Тыл находится в противоположном секторе ${sitting.code}.`
                    : kind === "bagua"
                      ? `В выбранном направлении находится триграмма ${facing.direction.name} ${facing.direction.trigram}. Её элемент — ${elementNames[facing.direction.element].toLowerCase()}. Традиционная тема: ${facing.direction.theme.toLowerCase()}.`
                      : kind === "gua"
                        ? `Для Гуа ${gua} направление ${facing.direction.direction.toLowerCase()} соответствует ${directionQualities[guaDirections[gua].indexOf(facing.direction.id)][0]}: ${directionQualities[guaDirections[gua].indexOf(facing.direction.id)][2].toLowerCase()}. Это ориентир системы Ба Чжай, а не оценка всего дома.`
                        : destination
                          ? `От центра к точке Б: ${(distanceBetween(center, destination) / 1000).toLocaleString("ru", { maximumFractionDigits: 2 })} км по кратчайшей дуге Земли. Начальный географический азимут ${degrees(bearing)}. Это расстояние между точками, не автомобильный маршрут.`
                          : "Укажите конечную точку на карте, чтобы увидеть расстояние и азимут. Перемещение стрелки задаёт свободное направление и снимает привязку к точке Б."}
                </p>
                <p>
                  {kind === "bagua"
                    ? facing.direction.advice
                    : kind === "route"
                      ? "Линия соединяет точки на плоской карте; для дальних поездок её вид может отличаться от кратчайшего пути на сфере."
                      : `До ближайшей границы горы ${degrees(boundaryDistance(measured))}. ${boundaryDistance(measured) < 1 ? "Небольшая погрешность может изменить сектор — уточните измерение." : "Перед разбором дома проверьте азимут на месте."}`}
                </p>
                <small>
                  Центр: {center.lat.toFixed(5)}, {center.lng.toFixed(5)} ·{" "}
                  {rotation === 0
                    ? "географический север"
                    : `ручная поправка ${degrees(rotation)}`}
                </small>
              </section>
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
                          changeBearing(
                            normalizeBearing(e.target.valueAsNumber),
                          );
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
                    onChange={(e) => changeBearing(+e.target.value)}
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
                  Прозрачность{" "}
                  <output>{Math.round((1 - opacity) * 100)}%</output>
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
      </div>
      <section className={styles.guide} aria-label="Как пользоваться компасом">
        {[
          [
            "01",
            "Найдите свой дом",
            "Выберите город, затем при желании укажите улицу и дом — карта приблизится к адресу. Можно уточнить точку вручную или ввести координаты.",
          ],
          [
            "02",
            "Установите центр",
            "Нажмите «Поставить центр» и выберите середину здания. Для уточнения перетащите золотую метку в центре круга.",
          ],
          [
            "03",
            "Задайте направление",
            "Перетащите золотой указатель на круге или отметьте фасад на карте. Выберите режим компаса: описание справа изменится вместе с направлением.",
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
          . Карта: OpenFreeMap / OpenStreetMap. Поиск адресов:
          OpenStreetMap. Русские названия показываются при их наличии в данных;
          иначе используется местное название.
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
