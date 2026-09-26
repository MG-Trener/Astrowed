"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodiacArtwork } from "@/assets/zodiac-artwork";
import { animals } from "@/domain/bazi/catalog";
import { categorySymbols, officers } from "@/domain/calendar/catalog";
import {
  activityDescription,
  calculateCalendarMonth,
  MAX_YEAR,
  MIN_YEAR,
  type DayProfile,
} from "@/domain/calendar/engine";
import styles from "./chinese-calendar.module.css";
import { CalendarLunarScene } from "./calendar-lunar-scene";
import {
  assessedActivities,
  assessActivity,
  assessDayActivities,
  assessmentLabels,
  assessmentSymbols,
} from "@/domain/calendar/assessment";

const months = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];
const zodiacKeys = [
  "rat",
  "ox",
  "tiger",
  "rabbit",
  "dragon",
  "snake",
  "horse",
  "goat",
  "monkey",
  "rooster",
  "dog",
  "pig",
] as const;
const monthGenitive = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];
const week = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const filterActivities = assessedActivities;
const fullDate = (date: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
const supportive = (p: DayProfile) =>
  p.good.filter((k) => k !== "馀事勿取" && k !== "诸事不宜");
const restricted = (p: DayProfile) => [
  ...new Set([
    ...p.bad,
    ...p.good.filter((k) => k === "馀事勿取" || k === "诸事不宜"),
  ]),
];

function ActivityList({
  items,
  tone,
}: {
  items: string[];
  tone: "good" | "bad";
}) {
  return (
    <div className={styles.activityList}>
      {items.length === 0 ? (
        <p className={styles.empty}>
          Отдельных указаний нет. Это не означает, что все действия
          рекомендованы.
        </p>
      ) : (
        items.map((han) => {
          const item = activityDescription(han);
          return (
            <details key={han} className={styles.activity} data-tone={tone}>
              <summary>
                <span className={styles.activityIcon} aria-hidden="true">
                  {categorySymbols[item.category]}
                </span>
                <span>
                  {item.name}
                  <small>{han}</small>
                </span>
                <b aria-hidden="true">{tone === "good" ? "＋" : "−"}</b>
              </summary>
              <p>{item.meaning}</p>
              <small className={styles.reason}>
                {han === "馀事勿取" || han === "诸事不宜"
                  ? "Общее ограничение традиционного альманаха."
                  : `В расчёте этого периода действие относится к ${tone === "good" ? "宜 — традиционно поддерживаемым" : "忌 — традиционно ограниченным"}. Основание — сочетание столпов месяца и дня в таблице альманаха.`}
              </small>
            </details>
          );
        })
      )}
    </div>
  );
}
export function ChineseCalendar() {
  const [period, setPeriod] = useState<{ year: number; month: number } | null>(
    null,
  );
  const [yearInput, setYearInput] = useState(""),
    [monthInput, setMonthInput] = useState(1);
  const [selected, setSelected] = useState(1),
    [segment, setSegment] = useState(0);
  const [filter, setFilter] = useState(""),
    [error, setError] = useState("");
  const [today, setToday] = useState("");
  const detail = useRef<HTMLElement>(null);
  useEffect(() => {
    detail.current?.scrollTo({ top: 0 });
  }, [selected, period]);
  useEffect(() => {
    const now = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const [year, month, day] = now.split("-").map(Number);
    setToday(now);
    setPeriod({ year, month });
    setYearInput(String(year));
    setMonthInput(month);
    setSelected(day);
  }, []);
  const days = useMemo(
    () => (period ? calculateCalendarMonth(period.year, period.month) : []),
    [period],
  );
  const day = days[selected - 1] ?? days[0];
  const profile = day?.profiles[Math.min(segment, day.profiles.length - 1)];
  function showMonth(year: number, month: number) {
    if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
      setError(`Укажите год от ${MIN_YEAR} до ${MAX_YEAR}.`);
      return;
    }
    setPeriod({ year, month });
    setYearInput(String(year));
    setMonthInput(month);
    setSelected(1);
    setSegment(0);
    setError("");
  }
  function shiftMonth(delta: number) {
    if (!period) return;
    const absolute = period.year * 12 + period.month - 1 + delta;
    showMonth(Math.floor(absolute / 12), (absolute % 12) + 1);
  }
  function selectDay(n: number) {
    setSelected(n);
    setSegment(0);
    if (window.matchMedia("(max-width: 1100px)").matches)
      requestAnimationFrame(() => {
        detail.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "start",
        });
        detail.current?.focus({ preventScroll: true });
      });
  }
  return (
    <div className={`page-wrap ${styles.page}`}>
      <header className={styles.hero}>
        <div>
          <div className="eyebrow">通書 / РИТМ ВРЕМЕНИ</div>
          <h1>
            Китайский <em>календарь</em>
          </h1>
          <p>
            Выберите месяц. Найдите день. Узнайте, что стоит за каждым знаком.
          </p>
          <div className={styles.heroTags}>
            <span>Общий календарь · для всех знаков</span>
            <span>12 типов дня</span>
            <span>24 солнечных сезона</span>
            <span>Расшифровки на русском</span>
          </div>
        </div>
        <CalendarLunarScene />
      </header>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          showMonth(Number(yearInput), monthInput);
        }}
      >
        <label>
          Месяц
          <select
            value={monthInput}
            onChange={(e) => setMonthInput(+e.target.value)}
          >
            {months.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label>
          Год
          <input
            type="number"
            min={MIN_YEAR}
            max={MAX_YEAR}
            step="1"
            required
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
          />
        </label>
        <button className={styles.calculate} type="submit">
          Рассчитать месяц <span>↗</span>
        </button>
        <button
          type="button"
          className={styles.today}
          onClick={() => {
            const [year, month, d] = today.split("-").map(Number);
            if (year) {
              showMonth(year, month);
              setSelected(d);
            }
          }}
        >
          Текущий месяц
        </button>
        <small>
          Китайский календарь · UTC+8
          <br />
          Сутки с 00:00 · {MIN_YEAR}–{MAX_YEAR}
        </small>
      </form>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <p className={styles.scopeNote}>
        <strong>Животное в ячейке — символ дня.</strong> Календарь общий, без
        привязки к вашему году рождения. Цвета относятся к делам; персональный
        выбор даты требует разбора карты Ба Цзы.
      </p>
      {!period || !day || !profile ? (
        <p role="status" className={styles.loading}>
          Рассчитываем календарь…
        </p>
      ) : (
        <>
          <div className={styles.monthBar}>
            <div className={styles.monthTitle}>
              <button
                aria-label="Предыдущий месяц"
                disabled={period.year === MIN_YEAR && period.month === 1}
                onClick={() => shiftMonth(-1)}
              >
                ←
              </button>
              <h2 aria-live="polite">
                {months[period.month - 1]} <span>{period.year}</span>
              </h2>
              <button
                aria-label="Следующий месяц"
                disabled={period.year === MAX_YEAR && period.month === 12}
                onClick={() => shiftMonth(1)}
              >
                →
              </button>
            </div>
            <label className={styles.filter}>
              Выделить дело
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">Все дела</option>
                {filterActivities.map((k) => (
                  <option key={k} value={k}>
                    {activityDescription(k).name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.legend}>
            <span data-tone="good">＋ Есть поддержка</span>
            <span data-tone="bad">− Есть ограничения</span>
            <span data-tone="caution">△ С оговорками</span>
            <span>◷ Смена солнечного месяца</span>
            <a href="#calendar-method">Как читать календарь ↗</a>
          </div>
          {filter && (
            <p className={styles.filterHint} role="status">
              Выделено: {activityDescription(filter).name.toLowerCase()}. Цвет
              относится только к этому делу; «·» означает отсутствие отдельного
              указания. В переходный день проверьте оба периода.
            </p>
          )}
          <div className={styles.layout}>
            <section
              className={styles.month}
              id="calendar-month"
              aria-label={`Календарь: ${months[period.month - 1]} ${period.year}`}
            >
              <div className={styles.week} aria-hidden="true">
                {week.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>
              <div className={styles.grid}>
                {Array.from({ length: days[0].weekday }, (_, i) => (
                  <div
                    className={styles.blank}
                    key={`blank-${i}`}
                    aria-hidden="true"
                  />
                ))}
                {days.map((d) => {
                  const p = d.profiles[0],
                    assessments = assessDayActivities(p),
                    good = assessments.filter((a) => a.tone === "good"),
                    bad = assessments.filter((a) => a.tone === "bad"),
                    caution = assessments.filter((a) => a.tone === "caution"),
                    status = filter
                      ? assessActivity(p, filter).tone
                      : undefined;
                  return (
                    <button
                      key={d.date}
                      className={styles.day}
                      data-today={d.date === today}
                      data-match={status}
                      aria-pressed={selected === d.day}
                      aria-label={`${fullDate(d.date)}. ${animals[d.animal]}. ${officers[p.officer][1]}${d.profiles.length > 1 ? ". Смена месяца" : ""}${status ? `. ${activityDescription(filter).name}: ${assessmentLabels[status]}` : ""}`}
                      onClick={() => selectDay(d.day)}
                    >
                      <div className={styles.dayTop}>
                        <time dateTime={d.date}>{d.day}</time>
                        <span>{d.pillar}</span>
                      </div>
                      <span className={styles.lunar}>
                        Луна · {d.lunarDay}
                        {d.lunarMonth < 0 ? " · доб. месяц" : ""}
                      </span>
                      <strong>{animals[d.animal]}</strong>
                      <span className={styles.officer}>
                        {p.officer + 1}. {officers[p.officer][1]}
                        {d.profiles.length > 1 ? " ◷" : ""}
                      </span>
                      {d.term && (
                        <span className={styles.term}>{d.term.name}</span>
                      )}
                      {filter ? (
                        <span className={styles.match} data-tone={status}>
                          {status && (
                            <>
                              <b>{assessmentSymbols[status]}</b>
                              <span className={styles.matchLabel}>
                                {assessmentLabels[status]}
                              </span>
                            </>
                          )}
                        </span>
                      ) : (
                        <div className={styles.counts}>
                          <span data-tone="good">＋ {good.length}</span>
                          <span data-tone="bad">− {bad.length}</span>
                          <span data-tone="caution">△ {caution.length}</span>
                        </div>
                      )}
                      {p.flags.some((f) => f.id.startsWith("clash")) && (
                        <span
                          className={styles.clash}
                          title="Столкновение дня с месяцем или годом"
                        >
                          ◇ <span>Столкновение</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className={styles.gridNote}>
                Числа ＋ / − / △ — количество дел с поддержкой, ограничениями и
                оговорками среди {assessedActivities.length} проверяемых дел.
                Это не рейтинг удачи. Нажмите день, чтобы увидеть причины.
              </p>
              <div className={styles.seasons}>
                {days
                  .filter((d) => d.term)
                  .map((d) => (
                    <button key={d.date} onClick={() => selectDay(d.day)}>
                      <span>{d.term!.han}</span>
                      <div>
                        <strong>{d.term!.name}</strong>
                        <small>
                          {d.day} {monthGenitive[period.month - 1]} ·{" "}
                          {d.term!.time.slice(0, 5)} UTC+8
                        </small>
                      </div>
                      <b>↗</b>
                    </button>
                  ))}
              </div>
            </section>
            <aside
              ref={detail}
              tabIndex={-1}
              className={styles.detail}
              aria-label="Расшифровка выбранного дня"
            >
              <a className={styles.backToMonth} href="#calendar-month">
                ← К календарю месяца
              </a>
              <div className={styles.detailHeader}>
                <div>
                  <span className={styles.eyebrow}>ВЫБРАННЫЙ ДЕНЬ</span>
                  <h2 aria-live="polite">
                    {day.day} <span>{monthGenitive[period.month - 1]}</span>
                  </h2>
                  <p>
                    {fullDate(day.date).split(",")[0]} · {day.pillar}
                  </p>
                </div>
                <Image
                  src={zodiacArtwork[zodiacKeys[day.animal]]}
                  alt={animals[day.animal]}
                  width={90}
                  height={90}
                />
              </div>
              <div className={styles.lunarInfo}>
                <span>
                  Животное дня: {animals[day.animal]} · лунный день{" "}
                  {day.lunarDay}
                </span>
                <small>
                  {Math.abs(day.lunarMonth)}-й{" "}
                  {day.lunarMonth < 0 ? "добавочный " : ""}лунный месяц ·{" "}
                  {day.lunarYear} год
                </small>
              </div>
              {day.term && (
                <p className={styles.termNotice}>
                  {day.term.han} · {day.term.name}
                  <br />
                  {day.term.time} UTC+8
                  {day.term.changesMonth
                    ? " · смена солнечного месяца"
                    : " · середина солнечного месяца"}
                </p>
              )}
              {day.profiles.length > 1 && (
                <div
                  className={styles.segments}
                  role="group"
                  aria-label="Период переходного дня"
                >
                  {day.profiles.map((p, i) => (
                    <button
                      key={p.from}
                      aria-pressed={segment === i}
                      onClick={() => setSegment(i)}
                    >
                      {i === 0 ? "До" : "После"} {day.term!.time.slice(0, 5)}
                    </button>
                  ))}
                </div>
              )}
              <div className={styles.pillars}>
                <span>
                  Год <b>{profile.yearPillar}</b>
                </span>
                <span>
                  Месяц <b>{profile.monthPillar}</b>
                </span>
                <span>
                  День <b>{day.pillar}</b>
                </span>
              </div>
              <p className={styles.detailNote}>
                Нажмите на цветную отметку или название дела, чтобы прочитать
                расшифровку.
              </p>
              <details
                className={styles.officerDetail}
                open
                key={`${day.date}-${segment}`}
              >
                <summary>
                  <span>{officers[profile.officer][0]}</span>
                  <div>
                    <small>12 ТИПОВ ДНЯ</small>
                    <strong>
                      {profile.officer + 1}. {officers[profile.officer][1]}
                    </strong>
                  </div>
                </summary>
                <p>{officers[profile.officer][2]}</p>
              </details>
              <div className={styles.flags}>
                {profile.flags.map((f) => (
                  <details key={f.id} data-tone={f.tone}>
                    <summary>
                      <span>
                        {f.tone === "good"
                          ? "＋"
                          : f.tone === "bad"
                            ? "−"
                            : "·"}
                      </span>
                      {f.name}
                    </summary>
                    <p>{f.meaning}</p>
                  </details>
                ))}
              </div>
              <div className={styles.listHeading}>
                <h3>Сводная оценка дел</h3>
              </div>
              <p className={styles.detailNote}>
                Учтены таблица альманаха, тип дня, столкновения, Ша, день без
                богатства, сезонные границы и путь дня. Ограничение имеет
                приоритет; все противоречия раскрываются внутри дела.
              </p>
              <div className={styles.activityList}>
                {(filter
                  ? [assessActivity(profile, filter)]
                  : assessDayActivities(profile)
                ).map((result) => (
                  <details
                    key={`${day.date}-${segment}-${result.activity}`}
                    className={styles.activity}
                    data-tone={result.tone}
                    open={filter ? true : undefined}
                  >
                    <summary>
                      <span className={styles.activityIcon} aria-hidden="true">
                        {
                          categorySymbols[
                            activityDescription(result.activity).category
                          ]
                        }
                      </span>
                      <span>
                        {activityDescription(result.activity).name}
                        <small>{assessmentLabels[result.tone]}</small>
                      </span>
                      <b aria-hidden="true">{assessmentSymbols[result.tone]}</b>
                    </summary>
                    <p>{activityDescription(result.activity).meaning}</p>
                    {result.conflict && (
                      <p className={styles.conflict}>
                        Есть противоречие: поддерживающие указания сохранены
                        ниже, но они не отменяют ограничения и оговорки.
                      </p>
                    )}
                    {result.reasons.length === 0 && (
                      <p>
                        Проверенные правила не дают отдельного указания для
                        этого дела. Это не подтверждение благоприятности.
                      </p>
                    )}
                    <ul className={styles.reasons}>
                      {result.reasons.map((reason) => (
                        <li key={reason.id} data-tone={reason.tone}>
                          <strong>
                            {assessmentSymbols[reason.tone]} {reason.title}
                          </strong>
                          <p>{reason.detail}</p>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
              <details className={styles.rawTable}>
                <summary>Исходная таблица 宜 / 忌 · без объединения</summary>
                <div className={styles.listHeading}>
                  <h3 data-tone="good">宜 · По таблице</h3>
                  <span>{supportive(profile).length} указаний</span>
                </div>
                <ActivityList items={supportive(profile)} tone="good" />
                <div className={styles.listHeading}>
                  <h3 data-tone="bad">忌 · Ограничения</h3>
                  <span>{restricted(profile).length} указаний</span>
                </div>
                <ActivityList items={restricted(profile)} tone="bad" />
              </details>
              <p className={styles.detailNote}>
                Сводка относится к перечисленным правилам Astrowed, а не ко всем
                школам выбора дат. Личная карта и выбор часа не учтены.
              </p>
            </aside>
          </div>
        </>
      )}
      <section id="calendar-method" className={styles.method}>
        <div className="eyebrow">ПОНЯТНЫЙ ЯЗЫК КАЛЕНДАРЯ</div>
        <h2>Каждый знак — с объяснением</h2>
        <div className={styles.methodGrid}>
          <article>
            <span data-tone="good">＋ / 宜</span>
            <h3>Зелёный: поддержка</h3>
            <p>
              Есть поддерживающее указание и нет ограничений или оговорок среди
              проверенных правил. Нажмите дело, чтобы увидеть основания. Цвет не
              обещает результат.
            </p>
          </article>
          <article>
            <span data-tone="bad">− / 忌</span>
            <h3>Красный: ограничение</h3>
            <p>
              Есть конкретное ограничение для дела; оно имеет приоритет над
              поддержкой. Золотой треугольник означает оговорки. Оценка дела не
              распространяется на всю повседневную жизнь.
            </p>
          </article>
          <article>
            <span>◷ / 節</span>
            <h3>Время перехода</h3>
            <p>
              Солнечный месяц начинается в момент сезона «цзе». Если переход
              приходится на выбранный день, показаны два периода. Лунный месяц —
              отдельный цикл и может быть добавочным.
            </p>
          </article>
        </div>
        <details className={styles.methodDetails}>
          <summary>Как формируется оценка дня</summary>
          <p>
            Можно рассчитать любой месяц с 1901 по 2099 год. Сутки начинаются в
            00:00. Даты и время приведены по китайскому времени UTC+8. Местное
            солнечное время и город пользователя не учитываются.
          </p>
          <p>
            В день смены солнечного месяца некоторые признаки меняются. Сетка
            показывает начало дня. Откройте карточку даты и переключите период,
            чтобы увидеть оценку до и после перехода.
          </p>
          <p>
            Это общий традиционный календарь, без персональной карты Ба Цзы.
            Оценка объединяет таблицу 宜 / 忌, соответствие дела типу дня,
            столкновения с годом и месяцем, три Ша, дни без богатства,
            разделители и истощение, жёлтый и чёрный путь. Конкретное
            ограничение имеет приоритет над поддержкой. Осторожность без прямого
            ограничения даёт золотую отметку. Отсутствие признаков не считается
            поддержкой. Таблицы и школы выбора дат различаются, поэтому
            результаты разных календарей могут отличаться. Медицинскую помощь не
            откладывают из-за календаря; финансовые и юридические решения
            принимают по фактическим условиям.
          </p>
          <p>
            «День без богатства» учитывается при начале коммерческих дел. Он не
            предсказывает доход человека. Разделители — дни перед
            равноденствиями и солнцестояниями; истощение — перед началом четырёх
            сезонов, по UTC+8. Они дают оговорку для крупных начинаний. Три Ша
            учитываются по области дела: Ша задержек ограничивает поездки,
            переезд и недвижимость, остальные случаи дают оговорку. Путь дня —
            дополнительный фон, который не отменяет конкретные ограничения. В
            карточке каждого дела показано, какие признаки повлияли на его
            оценку.
          </p>
          <div>
            <Link href="/knowledge/solar-terms">О солнечных сезонах ↗</Link>
            <Link href="/calculator">Личная карта Ба Цзы ↗</Link>
          </div>
        </details>
      </section>
    </div>
  );
}
