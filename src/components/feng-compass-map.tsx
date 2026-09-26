"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, TileLayer } from "leaflet";
import "leaflet/dist/leaflet.css";
import { FengCompassDial } from "./feng-compass-dial";
import { bearingBetween, type Coordinates } from "@/domain/feng-shui/compass";
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
  onCenter: (center: Coordinates) => void;
  onBearing: (angle: number) => void;
  onDone: () => void;
  onReady: () => void;
};
export function FengCompassMap(props: Props) {
  const container = useRef<HTMLDivElement>(null),
    mapRef = useRef<LeafletMap | null>(null),
    markerRef = useRef<Marker | null>(null),
    tilesRef = useRef<TileLayer | null>(null);
  const latest = useRef(props);
  latest.current = props;
  const [ready, setReady] = useState(false),
    [error, setError] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 }),
    [width, setWidth] = useState(600);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let disposed = false;
    let resize: ResizeObserver | undefined;
    void import("leaflet")
      .then((L) => {
        if (disposed || !container.current) return;
        const map = L.map(container.current, {
          zoomControl: false,
          scrollWheelZoom: false,
          zoomAnimation: false,
          minZoom: 3,
          maxZoom: 19,
          worldCopyJump: true,
        }).setView(props.center, 16);
        mapRef.current = map;
        L.control
          .zoom({
            position: "topright",
            zoomInTitle: "Приблизить карту",
            zoomOutTitle: "Отдалить карту",
          })
          .addTo(map);
        L.control.scale({ position: "bottomleft", imperial: false }).addTo(map);
        const tiles = L.tileLayer(
          process.env.NEXT_PUBLIC_COMPASS_TILE_URL ||
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            keepBuffer: 1,
            attribution:
              process.env.NEXT_PUBLIC_COMPASS_TILE_ATTRIBUTION ||
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          },
        ).addTo(map);
        tilesRef.current = tiles;
        tiles.on("tileerror", () =>
          setError(
            "Часть карты не загрузилась. Проверьте подключение и повторите загрузку.",
          ),
        );
        const marker = L.marker(props.center, {
          draggable: true,
          keyboard: true,
          title: "Центр компаса: перетащите на здание",
          icon: L.divIcon({
            className: styles.centerMarker,
            html: '<span aria-hidden="true">＋</span>',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).addTo(map);
        markerRef.current = marker;
        marker.on("drag", () => {
          const point = map.latLngToContainerPoint(marker.getLatLng());
          setPosition({ x: point.x, y: point.y });
        });
        marker.on("dragend", () => {
          const point = marker.getLatLng().wrap();
          latest.current.onCenter({ lat: point.lat, lng: point.lng });
          latest.current.onDone();
        });
        const positionDial = () => {
          const point = map.latLngToContainerPoint(latest.current.center);
          setPosition({ x: point.x, y: point.y });
          setWidth(map.getSize().x);
        };
        map.on("move zoom resize", positionDial);
        map.on("click", (event: import("leaflet").LeafletMouseEvent) => {
          const p = latest.current,
            point = event.latlng.wrap();
          if (p.mode === "center") {
            p.onCenter({ lat: point.lat, lng: point.lng });
            p.onDone();
            setNotice("Центр компаса установлен.");
          }
          if (p.mode === "facing") {
            const angle = bearingBetween(p.center, point);
            if (angle === null || map.distance(p.center, point) < 1) {
              setNotice(
                "Выберите точку дальше от центра — в направлении наружу от фасада.",
              );
              return;
            }
            p.onBearing(angle);
            p.onDone();
            setNotice("Направление фасада задано.");
          }
        });
        resize = new ResizeObserver(() => map.invalidateSize());
        resize.observe(container.current);
        positionDial();
        setReady(true);
        latest.current.onReady();
      })
      .catch(() => {
        if (!disposed) setError("Не удалось открыть карту. Обновите страницу.");
      });
    return () => {
      disposed = true;
      resize?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      tilesRef.current = null;
    };
    // Map lifecycle is separate from controlled centre, mode and appearance updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    markerRef.current?.setLatLng(props.center);
    map.panTo(props.center, { animate: false });
    const point = map.latLngToContainerPoint(props.center);
    setPosition({ x: point.x, y: point.y });
  }, [props.center, ready]);
  useEffect(() => {
    if (ready)
      mapRef.current?.setView(latest.current.center, props.view.zoom, {
        animate: false,
      });
  }, [props.view, ready]);
  const diameter = Math.min(props.size, width - 24);
  return (
    <div className={styles.mapFrame} data-mode={props.mode}>
      <div
        className={styles.map}
        ref={container}
        role="region"
        aria-label="Карта для наложения компаса"
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
            bearing={props.bearing}
            rotation={props.rotation}
            opacity={props.opacity}
            onSelect={props.onBearing}
          />
        </div>
      )}
      <div className={styles.mapBadge}>
        <span>↑ С</span> Географический север
      </div>
      {props.mode !== "explore" && (
        <div className={styles.mapPrompt} role="status">
          {props.mode === "center"
            ? "Нажмите на центр здания"
            : "Нажмите в направлении наружу от фасада"}
          <button onClick={props.onDone}>Отмена</button>
        </div>
      )}
      {error && (
        <div className={styles.mapError} role="alert">
          {error}
          <button
            onClick={() => {
              setError("");
              if (tilesRef.current) tilesRef.current.redraw();
              else window.location.reload();
            }}
          >
            Повторить
          </button>
        </div>
      )}
      <span className={styles.srOnly} role="status">
        {notice}
      </span>
    </div>
  );
}
