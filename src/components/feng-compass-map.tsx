"use client";
import { useEffect, useRef, useState } from "react";
import type {
  Map as VectorMap,
  Marker,
  GeoJSONSource,
  StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FengCompassDial } from "./feng-compass-dial";
import { russianMapStyle } from "@/services/compass-map-style";
import {
  bearingBetween,
  distanceBetween,
  normalizeBearing,
  type Coordinates,
  type CompassKind,
} from "@/domain/feng-shui/compass";
import styles from "./feng-compass.module.css";
export type CompassMode = "explore" | "center" | "facing";
type Props = {
  center: Coordinates;
  view: { zoom: number; request: number };
  mode: CompassMode;
  bearing: number;
  rotation: number;
  size: number;
  opacity: number;
  visible: boolean;
  kind: CompassKind;
  gua: number;
  destination: Coordinates | null;
  northRequest: number;
  onCenter: (center: Coordinates) => void;
  onBearing: (angle: number) => void;
  onDestination: (point: Coordinates) => void;
  onDone: () => void;
  onReady: () => void;
};
export function FengCompassMap(props: Props) {
  const container = useRef<HTMLDivElement>(null),
    mapRef = useRef<VectorMap | null>(null),
    markerRef = useRef<Marker | null>(null),
    destinationRef = useRef<Marker | null>(null);
  const latest = useRef(props);
  latest.current = props;
  const [ready, setReady] = useState(false),
    [error, setError] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 }),
    [width, setWidth] = useState(600),
    [height, setHeight] = useState(740),
    [mapBearing, setMapBearing] = useState(0);
  const [notice, setNotice] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    let resize: ResizeObserver | undefined;
    setReady(false);
    setError("");
    Promise.all([
      import("maplibre-gl"),
      fetch(
        process.env.NEXT_PUBLIC_COMPASS_STYLE_URL ||
          "https://tiles.openfreemap.org/styles/positron",
        { signal: controller.signal },
      ).then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<StyleSpecification>;
      }),
    ])
      .then(([M, style]) => {
        if (disposed || !container.current) return;
        M.setWorkerUrl(
          `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/maplibre/maplibre-gl-worker.mjs`,
        );
        const map = new M.Map({
          container: container.current,
          style: russianMapStyle(style),
          center: [latest.current.center.lng, latest.current.center.lat],
          zoom: latest.current.view.zoom,
          minZoom: 2,
          maxZoom: 20,
          maxPitch: 0,
          pitchWithRotate: false,
          scrollZoom: false,
          attributionControl: false,
          locale: {
            "NavigationControl.ZoomIn": "Приблизить карту",
            "NavigationControl.ZoomOut": "Отдалить карту",
            "NavigationControl.ResetBearing": "Выровнять карту по северу",
            "Map.Title": "Карта на русском языке",
          },
        });
        mapRef.current = map;
        map.addControl(
          new M.NavigationControl({ visualizePitch: false }),
          "top-right",
        );
        map.addControl(
          new M.AttributionControl({ compact: false }),
          "bottom-right",
        );
        map.addControl(new M.ScaleControl({ unit: "metric" }), "bottom-left");
        const dot = document.createElement("div");
        dot.className = styles.centerMarker;
        dot.textContent = "＋";
        dot.title = "Перетащите центр компаса";
        const marker = new M.Marker({ element: dot, draggable: true })
          .setLngLat([props.center.lng, props.center.lat])
          .addTo(map);
        markerRef.current = marker;
        const dest = document.createElement("div");
        dest.className = styles.destinationMarker;
        dest.textContent = "Б";
        dest.title = "Конечная точка: перетащите";
        const destination = new M.Marker({ element: dest, draggable: true });
        destinationRef.current = destination;
        destination.on("dragend", () => {
          const point = destination.getLngLat().wrap();
          latest.current.onDestination({ lat: point.lat, lng: point.lng });
        });
        const positionDial = () => {
          const point = map.project(marker.getLngLat());
          setPosition({ x: point.x, y: point.y });
          setWidth(map.getContainer().clientWidth);
          setHeight(map.getContainer().clientHeight);
          setMapBearing(map.getBearing());
        };
        marker.on("drag", positionDial);
        marker.on("dragend", () => {
          const point = marker.getLngLat().wrap();
          latest.current.onCenter({ lat: point.lat, lng: point.lng });
          latest.current.onDone();
        });
        map.on("move", positionDial);
        map.on("resize", positionDial);
        map.on("click", (event) => {
          const p = latest.current,
            point = event.lngLat.wrap();
          if (p.mode === "center") {
            p.onCenter({ lat: point.lat, lng: point.lng });
            p.onDone();
            setNotice("Центр компаса установлен.");
          }
          if (p.mode === "facing") {
            const angle = bearingBetween(p.center, point);
            if (angle === null || distanceBetween(p.center, point) < 1) {
              setNotice("Выберите точку дальше от центра.");
              return;
            }
            if (p.kind === "route")
              p.onDestination({ lat: point.lat, lng: point.lng });
            else p.onBearing(angle);
            p.onDone();
            setNotice("Направление задано.");
          }
        });
        map.on("error", () => {
          if (!disposed)
            setError(
              "Не удалось загрузить часть карты. Проверьте подключение или повторите загрузку.",
            );
        });
        map.on("load", () => {
          if (disposed) return;
          map.addSource("compass-route", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          map.addLayer({
            id: "compass-route",
            type: "line",
            source: "compass-route",
            paint: {
              "line-color": "#11775a",
              "line-width": 3,
              "line-dasharray": [3, 2],
            },
          });
          setError("");
          setReady(true);
          latest.current.onReady();
          positionDial();
        });
        resize = new ResizeObserver(() => map.resize());
        resize.observe(container.current);
        positionDial();
      })
      .catch(() => {
        if (!disposed)
          setError(
            "Не удалось открыть карту. Проверьте подключение и повторите загрузку.",
          );
      });
    return () => {
      disposed = true;
      controller.abort();
      resize?.disconnect();
      markerRef.current?.remove();
      destinationRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [retry]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    markerRef.current?.setLngLat([props.center.lng, props.center.lat]);
    map.jumpTo({ center: [props.center.lng, props.center.lat] });
  }, [props.center, ready]);
  useEffect(() => {
    if (ready)
      mapRef.current?.jumpTo({
        center: [latest.current.center.lng, latest.current.center.lat],
        zoom: props.view.zoom,
      });
  }, [props.view, ready]);
  useEffect(() => {
    mapRef.current?.jumpTo({ bearing: 0, pitch: 0 });
  }, [props.northRequest]);
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const destination = props.kind === "route" ? props.destination : null;
    if (destination)
      destinationRef.current
        ?.setLngLat([destination.lng, destination.lat])
        .addTo(map);
    else destinationRef.current?.remove();
    // Straight visual connector; numerical distance and initial azimuth use the sphere.
    const lng = destination
      ? props.center.lng +
        (((destination.lng - props.center.lng + 540) % 360) - 180)
      : 0;
    (map.getSource("compass-route") as GeoJSONSource)?.setData({
      type: "FeatureCollection",
      features: destination
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [
                  [props.center.lng, props.center.lat],
                  [lng, destination.lat],
                ],
              },
            },
          ]
        : [],
    });
  }, [props.center, props.destination, props.kind, ready]);
  const diameter = Math.max(0, Math.min(props.size, width - 24, height - 48));
  return (
    <div className={styles.mapFrame} data-mode={props.mode}>
      <div
        className={styles.map}
        ref={container}
        role="region"
        aria-label="Карта на русском языке для наложения компаса"
      />
      {!ready && !error && (
        <div className={styles.mapMessage} role="status">
          Открываем карту…
        </div>
      )}
      {ready && props.visible && (
        <div
          className={styles.dial}
          data-editing={props.mode !== "explore"}
          style={{
            left: position.x,
            top: position.y,
            width: diameter,
            height: diameter,
          }}
        >
          <FengCompassDial
            bearing={props.bearing - mapBearing}
            rotation={props.rotation - mapBearing}
            opacity={props.opacity}
            kind={props.kind}
            gua={props.gua}
            onSelect={(angle) =>
              props.onBearing(normalizeBearing(angle + mapBearing))
            }
          />
        </div>
      )}
      <button
        className={styles.northButton}
        onClick={() => mapRef.current?.jumpTo({ bearing: 0, pitch: 0 })}
        title="Выровнять карту по северу"
      >
        <span style={{ transform: `rotate(${-mapBearing}deg)` }}>↑</span> Север
        · {Math.round(normalizeBearing(mapBearing))}°
      </button>
      <div
        className={styles.mapRose}
        aria-label="Стороны света карты"
        style={{ transform: `rotate(${-mapBearing}deg)` }}
      >
        {["С", "В", "Ю", "З"].map((label, i) => (
          <span
            key={label}
            style={{
              transform: `rotate(${i * 90}deg) translateY(-23px) rotate(${mapBearing - i * 90}deg)`,
            }}
          >
            {label}
          </span>
        ))}
      </div>
      {props.mode !== "explore" && (
        <div className={styles.mapPrompt} role="status">
          {props.mode === "center"
            ? "Нажмите на начальную точку / центр здания"
            : props.kind === "route"
              ? "Нажмите на конечную точку поездки"
              : "Нажмите в направлении наружу от фасада"}
          <button onClick={props.onDone}>Отмена</button>
        </div>
      )}
      {error && (
        <div className={styles.mapError} role="alert">
          {error}
          <button onClick={() => setRetry((n) => n + 1)}>Повторить</button>
        </div>
      )}
      <span className={styles.srOnly} role="status">
        {notice}
      </span>
    </div>
  );
}
