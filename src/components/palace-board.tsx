"use client";

import { useId, useState, type CSSProperties } from "react";
import Image from "next/image";
import { zodiacArtwork } from "@/assets/zodiac-artwork";
import { doorMeaning, doorNames, spiritNames, starNames, type QimenChart } from "@/domain/qimen/engine";
import { luoShuOrder, palaceOf } from "@/domain/feng-shui/catalog";
import { elementOf, stemElement } from "@/domain/bazi/catalog";
import { palaceZodiac, zodiacPaths, type ZodiacAnimal, type ZodiacSide } from "./palace-zodiac";
import styles from "./palace-board.module.css";
import palaceJade from "@/assets/generated/qimen-palace-jade.webp";

type Layer = "all" | "stems" | "doors" | "stars" | "spirits";
const layers: [Layer, string][] = [["all", "Все слои"], ["stems", "Стволы"], ["doors", "Двери"], ["stars", "Звёзды"], ["spirits", "Духи"]];
const directions: Record<number, string> = { 1: "С", 2: "ЮЗ", 3: "В", 4: "ЮВ", 5: "Центр", 6: "СЗ", 7: "З", 8: "СВ", 9: "Ю" };
const shortSpirits: Record<string, string> = { 值符: "符", 腾蛇: "蛇", 太阴: "阴", 六合: "合", 白虎: "虎", 玄武: "武", 九地: "地", 九天: "天" };
const accent = (color: string) => ({ "--palace-accent": color }) as CSSProperties;

function ZodiacIcon({ animal }: { animal: ZodiacAnimal }) {
  const [failed, setFailed] = useState(false);
  return <span className={styles.animalIcon} data-failed={failed} aria-hidden="true">
    <Image className={styles.animalArtwork} src={zodiacArtwork[animal]} alt="" width={84} height={84} sizes="(max-width: 600px) 56px, 84px" onError={() => setFailed(true)} />
    <svg viewBox="0 0 64 64" className={styles.animalLinework} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" focusable="false">
    <circle cx="32" cy="32" r="29" strokeWidth="0.7" opacity="0.22" strokeDasharray="2 5" />
    {zodiacPaths[animal].map((d, i) => <path key={i} d={d} />)}
    </svg>
  </span>;
}

function Stem({ value }: { value: string }) {
  return <span style={{ color: elementOf(stemElement(value)).color }}>{value}</span>;
}

function Entity({ kind, symbol, label, compact, role }: { kind: string; symbol: string; label: string; compact?: string; role: string }) {
  return <span className={styles.entity} data-kind={kind} title={`${role}: ${symbol} · ${label}`}>
    <span className={styles.entityRole}>{role}</span>
    <span className={styles.entitySymbol}><span className={styles.fullSymbol}>{symbol}</span><span className={styles.shortSymbol} aria-hidden="true">{compact || symbol}</span></span>
    <span className={styles.entityName}>{label}</span>
  </span>;
}

export function PalaceBoard({ chart }: { chart: QimenChart }) {
  const [selected, setSelected] = useState(chart.starTarget);
  const [layer, setLayer] = useState<Layer>("all");
  const [animalsVisible, setAnimalsVisible] = useState(true);
  const detailId = useId();
  const p = chart.palaces.find((cell) => cell.id === selected) || chart.palaces[0];
  const selectedAnimals = palaceZodiac.filter((animal) => animal.palace === p.id);
  const hostedPalace = chart.palaces.find((cell) => Boolean(cell.hosted));

  const rail = (side: ZodiacSide) => <div className={`${styles.rail} ${styles[side]}`} role="group" aria-label={`Земные ветви: ${ { top: "южная", bottom: "северная", left: "восточная", right: "западная" }[side]} сторона`}>
    {palaceZodiac.filter((animal) => animal.side === side).sort((a, b) => a.slot - b.slot).map((animal) => {
      const palace = palaceOf(animal.palace);
      return <button type="button" key={animal.id} className={styles.animal} style={accent(elementOf(palace.element).color)}
        data-animal={animal.id} aria-pressed={p.id === animal.palace} aria-controls={detailId}
        aria-label={`${animal.name} · ${animal.branch} · ${palace.direction}. Открыть дворец ${palace.id} ${palace.name}`}
        title={`${animal.branch} · ${animal.name} · ${animal.bearing}° · ${palace.direction}`} onClick={() => setSelected(animal.palace)}>
        <ZodiacIcon animal={animal.id} /><span className={styles.animalCaption}><b>{animal.branch}</b><span>{animal.name}</span></span>
      </button>;
    })}
  </div>;

  return <section className={styles.workspace} data-layer={layer} style={{ "--palace-art": `url("${palaceJade.src}")` } as CSSProperties} aria-label="Интерактивные девять дворцов Ци Мэнь">
    <div className={styles.mapColumn}>
      <div className={styles.boardHeading}>
        <div><span className={styles.eyebrow}>ЦИ МЭНЬ ДУНЬ ЦЗЯ</span><h2>Девять дворцов</h2></div>
        <span className={styles.orientation}>ЮГ ↑<br /><small>СЕВЕР ↓</small></span>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.filters} role="group" aria-label="Слои карты">{layers.map(([id, name]) => <button type="button" key={id} aria-pressed={layer === id} onClick={() => setLayer(id)}>{name}</button>)}</div>
        <button type="button" className={styles.animalToggle} aria-pressed={animalsVisible} onClick={() => setAnimalsVisible((visible) => !visible)}>Животные <span aria-hidden="true">{animalsVisible ? "◉" : "○"}</span></button>
      </div>
      <div className={`${styles.frame} ${animalsVisible ? "" : styles.withoutAnimals}`}>
        {animalsVisible && <>{rail("top")}{rail("right")}{rail("bottom")}{rail("left")}</>}
        <span className={`${styles.corner} ${styles.nw}`} aria-label="Юго-восток" title="Юго-восток · 135°">ЮВ</span>
        <span className={`${styles.corner} ${styles.ne}`} aria-label="Юго-запад" title="Юго-запад · 225°">ЮЗ</span>
        <span className={`${styles.corner} ${styles.sw}`} aria-label="Северо-восток" title="Северо-восток · 45°">СВ</span>
        <span className={`${styles.corner} ${styles.se}`} aria-label="Северо-запад" title="Северо-запад · 315°">СЗ</span>
        {([
          ["south", "Юг", "Ю", "180°"], ["north", "Север", "С", "0°"],
          ["east", "Восток", "В", "90°"], ["west", "Запад", "З", "270°"],
        ] as const).map(([side, name, short, bearing]) => <span key={side} className={`${styles.compass} ${styles[side]}`} aria-label={name} title={`${name} · ${bearing}`}>
          <span className={styles.compassLong}>{name}</span><span className={styles.compassShort}>{short}</span>
        </span>)}
        <div className={styles.grid} role="group" aria-label="Ло Шу: юг сверху, восток слева">
          {luoShuOrder.map((id) => {
            const cell = chart.palaces.find((item) => item.id === id)!;
            return <button type="button" key={id} className={`${styles.cell} ${id === 5 ? styles.center : ""}`} data-palace-id={id}
              style={accent(elementOf(cell.element).color)} aria-pressed={p.id === id} aria-controls={detailId}
              aria-label={`${id}. ${cell.name}. ${cell.direction}. ${id === 5 ? `Ствол центра ${cell.earth}` : `Небо ${cell.heaven}, земля ${cell.earth}. Дверь ${doorNames[cell.door]}. Звезда ${starNames[cell.star]}. Дух ${spiritNames[cell.spirit]}`}`}
              onClick={() => setSelected(id)}>
              <span className={styles.cellHeading}><span><b>{id}</b> {cell.name}</span><span className={styles.direction}>{directions[id]}</span></span>
              {id === 5 ? <span className={styles.centerBody}>
                <svg className={styles.taiji} viewBox="0 0 80 80" aria-hidden="true" focusable="false"><circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" opacity=".25" /><circle cx="40" cy="40" r="27" fill="currentColor" opacity=".12" /><path d="M40 13a27 27 0 0 1 0 54a13.5 13.5 0 0 1 0-27a13.5 13.5 0 0 0 0-27" fill="currentColor" opacity=".8" /><circle cx="40" cy="26.5" r="4" fill="currentColor" /><circle cx="40" cy="53.5" r="4" fill="#102328" /></svg>
                <strong>{chart.dun === "yang" ? "Ян" : "Инь"} Дунь · {chart.ju}</strong>
                <span className={styles.centerMethod}>{chart.system === "chaibu" ? "Чай Бу · часовая" : "Ручной цзюй"}</span>
                <span className={styles.centerStem}><Stem value={cell.earth} /> <small>· 天禽</small></span>
                <span className={styles.centerNote}>Центр · Тянь Цинь</span>
              </span> : <>
                <span className={styles.stems}>
                  <span><small>НЕБО</small><strong><Stem value={cell.heaven} /></strong></span>
                  <span className={styles.stemDivider} aria-hidden="true">/</span>
                  <span><small>ЗЕМЛЯ</small><strong><Stem value={cell.earth} /></strong></span>
                </span>
                <span className={styles.entities}>
                  <Entity kind="spirits" symbol={cell.spirit} compact={shortSpirits[cell.spirit]} label={spiritNames[cell.spirit]} role="Дух" />
                  <Entity kind="doors" symbol={cell.door} label={doorNames[cell.door]} role="Дверь" />
                  <Entity kind="stars" symbol={cell.star} compact={cell.star.slice(-1)} label={starNames[cell.star]?.split(" · ")[0] || cell.star} role="Звезда" />
                </span>
                <span className={styles.cellFoot}>
                  <span className={styles.hosted} title={cell.hosted ? `Размещённый ствол центра ${cell.hosted}; Тянь Цинь следует с Тянь Жуй` : undefined}>{cell.hosted && <>寄 +<Stem value={cell.hosted} /><span className={styles.hostedName}> · Тянь Цинь</span></>}</span>
                  <span className={styles.badges}>{cell.dutyStar && <span title="Чжи Фу · главная звезда"><span className={styles.badgeLong}>Чжи Фу</span><span className={styles.badgeShort}>Ф</span></span>}{cell.dutyDoor && <span title="Чжи Ши · главная дверь"><span className={styles.badgeLong}>Чжи Ши</span><span className={styles.badgeShort}>Ш</span></span>}</span>
                </span>
              </>}
            </button>;
          })}
        </div>
      </div>
      <div className={styles.legend}><span><i /> Выбранный дворец</span><span>Небо / Земля — стволы</span><span>寄 — размещение центра</span></div>
      <p className={styles.mapNote}>Нажмите на дворец или животное, чтобы раскрыть его слои. 12 животных обозначают земные ветви направлений, а не отдельные дворцы или прогноз.</p>
    </div>
    <aside className={styles.detail} id={detailId} aria-live="polite" aria-atomic="true" style={accent(elementOf(p.element).color)}>
      <div className={styles.detailTop}><span className={styles.eyebrow}>ВЫБРАННЫЙ ДВОРЕЦ</span><span className={styles.trigram} aria-hidden="true">{p.trigram}</span></div>
      <h2><span className={styles.detailNumber}>{p.id.toString().padStart(2, "0")}</span> {p.name} <span className={styles.detailHan}>{p.han}</span></h2>
      <p className={styles.detailDirection}>{p.direction} · {elementOf(p.element).name}</p>
      {selectedAnimals.length > 0 && <div className={styles.detailAnimals}>{selectedAnimals.map((animal) => <span key={animal.id}><ZodiacIcon animal={animal.id} /><span>{animal.branch} · {animal.name}</span></span>)}</div>}
      <p className={styles.theme}>{p.theme}</p>
      {p.id === 5 ? <>
        <dl className={styles.facts}><div><dt>Ствол центра</dt><dd><Stem value={p.earth} /></dd></div><div><dt>Звезда</dt><dd>天禽 · Тянь Цинь</dd></div><div><dt>Размещение</dt><dd>{hostedPalace ? `${hostedPalace.id} · ${hostedPalace.name}` : "—"}</dd></div></dl>
        <p className={styles.meaning}>В этой системе у центра нет отдельной двери и духа. Тянь Цинь и ствол центра следуют вместе с Тянь Жуй; размещение показано знаком 寄 во внешнем дворце.</p>
      </> : <>
        <div className={styles.doorFocus}><span lang="zh">{p.door}</span><div><small>ДВЕРЬ</small><h3>{doorNames[p.door]}</h3></div></div>
        <p className={styles.meaning}>{doorMeaning[p.door]}</p>
        <dl className={styles.facts}>
          <div><dt>Звезда</dt><dd>{p.star} · {starNames[p.star]}{p.hosted ? " + Тянь Цинь" : ""}</dd></div>
          <div><dt>Дух</dt><dd>{p.spirit} · {spiritNames[p.spirit]}</dd></div>
          <div><dt>Небо / Земля</dt><dd className={styles.detailStems}><Stem value={p.heaven} /> / <Stem value={p.earth} /></dd></div>
          {p.hosted && <div><dt>Ствол центра</dt><dd><Stem value={p.hosted} /> · размещённый</dd></div>}
          {(p.dutyStar || p.dutyDoor) && <div><dt>Управители</dt><dd>{[p.dutyStar && "Чжи Фу", p.dutyDoor && "Чжи Ши"].filter(Boolean).join(" · ")}</dd></div>}
        </dl>
      </>}
      <p className={styles.disclaimer}>Символическое описание, не готовое предсказание. Разбор связывает дворец с вопросом и остальной картой.</p>
    </aside>
  </section>;
}
