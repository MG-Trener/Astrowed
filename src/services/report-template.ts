import type { Chart } from "../domain/bazi/types";
import { elementOf } from "../domain/bazi/catalog";
import { consultationLinks } from "../data/consultation";
import { reportDocumentStyles } from "./report-design";
import type { ReportArtwork } from "./report-artwork-files";
import {
  elementGraphic,
  directionGraphic,
  reportOrnament,
  reportGraphicStyles,
} from "./report-graphics";
import {
  currentEnergies,
  detailedLuck,
  interpretChart,
  lifeYears,
  symbolicStars,
} from "../domain/bazi/extended";
import { calculateGua } from "../domain/feng-shui/gua";
import {
  calculateQimen,
  doorNames,
  starNames,
  spiritNames,
} from "../domain/qimen/engine";
import { luoShuOrder } from "../domain/feng-shui/catalog";
import {
  buildReading,
  conclusionLabels,
  type Conclusion,
} from "../domain/bazi/reading";
export const reportLevels = {
  brief: "Краткий",
  full: "Полный",
  professional: "Профессиональный",
} as const;
export type ReportLevel = keyof typeof reportLevels;
export type ReportOptions = {
  level?: ReportLevel;
  date?: string;
  comment?: string;
  cover?: string;
  artwork?: ReportArtwork;
  conclusion?: Conclusion;
};
const escape = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function reportHtml(chart: Chart, options: ReportOptions = {}) {
  const e = escape,
    level = options.level ?? "full",
    date = options.date ?? new Date().toISOString().slice(0, 10);
  const professional = level === "professional",
    full = level !== "brief",
    gua = calculateGua(chart.input);
  const reading = buildReading(chart);
  const artwork = options.artwork ?? {};
  const chapters: { id: string; title: string; number: string }[] = [];
  const table = (headers: string[], rows: string[][]) =>
    `<table><thead><tr>${headers.map((h) => `<th>${e(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${e(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const note = (s: string) => `<p class="note">${e(s)}</p>`;
  const section = (title: string, body: string) => {
    const cleanTitle = title.replace(/^\d+\s*\/\s*/, "");
    const number = String(chapters.length + 1).padStart(2, "0");
    const id = `chapter-${number}`;
    chapters.push({ id, title: cleanTitle, number });
    const key = /Ци Мэнь/.test(title)
      ? "qimen"
      : /Гуа/.test(title)
        ? "fengShui"
        : /звёзды/.test(title)
          ? "stars"
          : /Такты|Годы|Энергии/.test(title)
            ? "cycles"
            : /Ба Цзы|Структура/.test(title)
              ? "bazi"
              : "reading";
    const art = artwork[key];
    return `<section class="report-section ${/заключение/.test(title) ? "conclusion-section" : ""}" id="${id}"><div class="section-heading"><div class="section-copy"><span class="section-number">${number} / ASTROWED</span><h2>${e(cleanTitle)}</h2></div>${art ? `<img class="section-art" src="${e(art)}" alt="">` : reportOrnament}</div>${body}</section>`;
  };
  const paras = (rows: { title: string; text: string }[]) =>
    rows
      .map(
        (r) => `<article><h3>${e(r.title)}</h3><p>${e(r.text)}</p></article>`,
      )
      .join("");
  const pillars = `<div class="pillars">${chart.pillars.map((p) => `<div class="pillar" style="--element:${elementOf(p.element).color}"><small>${e(p.label)}</small><strong>${e(p.stem)}<br>${e(p.branch)}</strong><p>${e(p.polarity)} ${e(elementOf(p.element).name)}</p><p>${e(p.tenGod)}</p><div>${e(p.hidden.join(" · "))}</div></div>`).join("")}</div>`;
  let content = section(
    "Личная карта Ба Цзы",
    pillars +
      elementGraphic(chart, artwork) +
      note(
        "Распределение видимых и скрытых стволов без сезонных коэффициентов. Оно не определяет силу карты.",
      ),
  );
  if (professional)
    content += section(
      "Структура карты: ориентиры",
      `<div class="analysis-grid">${paras(interpretChart(chart).slice(0, 6))}</div>`,
    );
  const readingSections = full
    ? reading.sections
    : reading.sections.slice(0, 2);
  const chunks = professional
    ? [
        readingSections.slice(0, 4),
        readingSections.slice(4, 7),
        readingSections.slice(7),
      ]
    : full
      ? [readingSections.slice(0, 5), readingSections.slice(5)]
      : [readingSections];
  chunks.forEach((chunk, index) => {
    content += section(
      index === 0
        ? "Понятный разбор вашей карты"
        : professional && index === 1
          ? "Разбор карты · ресурсы и опора"
          : "Разбор карты · связи и периоды",
      (index === 0 ? note(reading.notice) + note(reading.boundaryNote) : "") +
        '<div class="reading-body">' +
        chunk
          .map(
            (s) =>
              `<article><h3>${e(s.title)}</h3><p>${e(s.text)}</p><p class="question"><b>Вопрос к себе:</b> ${e(s.question)}</p>${professional && s.evidence.length ? `<p class="evidence"><small>Основание: ${e(s.evidence.join("; "))}</small></p>` : ""}</article>`,
          )
          .join("") +
        "</div>" +
        (index === chunks.length - 1
          ? `<p class="note"><b>Практический шаг:</b> ${e(reading.action)}</p>`
          : ""),
    );
  });
  if (full) {
    const conclusion = options.conclusion ?? reading.conclusion;
    content += section(
      "Структурированное заключение · черновик",
      note(
        "Автоматический черновик с возможными правками пользователя. Не является подписанным заключением эксперта; требуется проверка консультантом.",
      ) +
        (Object.entries(conclusionLabels) as [keyof Conclusion, string][])
          .map(
            ([key, title]) =>
              `<article><h3>${e(title)}</h3><p class="consultant-comment">${e(conclusion[key] || "Не заполнено")}</p></article>`,
          )
          .join(""),
    );
  }
  content += section(
    "02 / Такты Да Юнь",
    note(
      `${chart.forward === null ? "Требуется время рождения" : chart.forward ? "Прямое движение" : "Обратное движение"}. Даты UTC+8; возраст традиционный номинальный.`,
    ) +
      table(
        ["Даты", "Возраст", "Столп", "Десять богов", ...(full ? ["Тема"] : [])],
        detailedLuck(chart).map((p) => [
          `${p.startDate} — ${p.endDate}`,
          `${p.startAge}–${p.startAge + 9}`,
          p.ganZhi,
          p.tenGod,
          ...(full ? [p.meaning] : []),
        ]),
      ),
  );
  if (full) {
    content += section(
      `03 / Энергии на ${date} · 12:00`,
      table(
        ["Слой", "Столп", "Десять богов", "Связи с натальной картой"],
        currentEnergies(chart, date).map((p) => [
          p.label,
          p.stem + p.branch,
          p.tenGod,
          p.relations
            .map((r) => `${r.position}: ${r.symbols} ${r.name}`)
            .join("; ") || "Не обнаружены",
        ]),
      ) +
        note(
          `Часовой пояс ${chart.input.timezone}; смена года и месяца по точным солнечным терминам. Время снимка фиксируется для воспроизводимости.`,
        ),
    );
    content += section(
      "04 / Символические звёзды и Шэнь Ша",
      table(
        ["Название", "Цель", "Правило", "Где проявлено"],
        symbolicStars(chart).map((r) => [
          `${r.name} ${r.han}`,
          r.target,
          r.basis,
          r.positions.join(", ") || "Не обнаружено",
        ]),
      ) +
        note(
          "Одна звезда может иметь два основания. Это не удваивает её влияние. Грабитель богатства относится к десяти богам; Личный разрушитель здесь обозначает столкновение с ветвью дня.",
        ),
    );
    content += section(
      "05 / Гуа и пространство",
      `<h3>Гуа ${gua.number} · ${gua.palace.name} · ${gua.group} группа</h3>` +
        directionGraphic(gua.number) +
        table(
          ["Направление", "Качество", "Тема"],
          gua.directions.map((d) => [d.direction, d.quality, d.meaning]),
        ) +
        note(
          `${gua.method}. Солнечный год ${gua.year}.${gua.uncertain ? " Время около Ли Чунь требует уточнения." : ""}`,
        ) +
        `<p>Сопоставьте личные направления с планировкой и назначением комнаты. Начните с освещения, тишины, свободных проходов и удобства мебели. Для карты дома дополнительно нужны фасадное направление и период здания.</p>`,
    );
    if (!chart.input.unknownTime) {
      const q = calculateQimen(chart.input);
      content += section(
        "06 / Личная карта Ци Мэнь",
        `<h3>${q.dun === "yang" ? "Ян" : "Инь"} Дунь · ${q.ju} цзюй · ${q.term}</h3><p>Юг сверху · ${e(q.pillars.join(" / "))}</p><div class="qimen-grid">${luoShuOrder
          .map((id) => {
            const p = q.palaces[id - 1];
            return `<div><small>${id} ${e(p.name)} · ${e(p.direction)}</small><strong>${e(p.heaven)} / ${e(p.earth)}${p.hosted ? ` +${p.hosted}` : ""}</strong><p>${e(p.star)} ${p.id === 5 ? "→ Кунь" : e(starNames[p.star])}</p><p>${p.door ? `${e(p.door)} ${e(doorNames[p.door])}` : "Центр размещён с Тянь Жуй"}</p><small>${e(spiritNames[p.spirit] || "")}</small></div>`;
          })
          .join("")}</div>` +
          note(q.method) +
          `<p>Чжи Фу ${e(q.dutyStar)} — дворец ${q.starTarget}; Чжи Ши ${e(doorNames[q.dutyDoor])} — дворец ${q.doorTarget}. Анализ начинается с цели вопроса и сопоставления слоёв, а не с изолированного названия двери.</p>`,
      );
    } else
      content += section(
        "06 / Ци Мэнь",
        note("Личная карта Ци Мэнь не построена: время рождения неизвестно."),
      );
    const currentYear = Number(date.slice(0, 4)),
      birthYear = Number(chart.input.date.slice(0, 4));
    content += section(
      "07 / Годы жизни",
      table(
        [
          "Год / возраст*",
          "Столп",
          "Десять богов",
          "Такт**",
          ...(professional ? ["Связи / звёзды"] : []),
        ],
        lifeYears(
          chart,
          professional
            ? birthYear
            : Math.max(birthYear, Math.min(currentYear, birthYear + 90)),
          professional ? 100 : 10,
        ).map((y) => [
          `${y.year} / ${y.age}`,
          y.ganZhi,
          y.tenGod,
          y.luck ?? "—",
          ...(professional
            ? [
                y.relations
                  .map((r) => `${r.position} ${r.symbols}`)
                  .concat(y.stars)
                  .join("; ") || "—",
              ]
            : []),
        ]),
      ) +
        note(
          "* Разница календарных лет. Годовой столп показан после Ли Чунь. ** В год смены такта сверяйтесь с точной датой Да Юнь.",
        ),
    );
  }
  if (professional)
    content += section(
      "08 / Структура столпов",
      table(
        [
          "Столп",
          "Ствол / десять богов",
          "Скрытые стволы / десять богов",
          "На Инь / фаза",
        ],
        chart.pillars.map((p) => [
          p.label,
          `${p.stem} ${p.tenGod}`,
          p.hidden.map((s, i) => `${s}: ${p.hiddenGods[i]}`).join("; "),
          `${p.nayin} / ${p.stage}`,
        ]),
      ),
    );
  if (options.comment?.trim())
    content += section(
      "Комментарий консультанта",
      `<p class="consultant-comment">${e(options.comment.trim())}</p>`,
    );
  content += section(
    "Методика и следующий шаг",
    `<p>${e(chart.method.description)}</p><p>Расчётное время: ${e(chart.method.localTime)} · UTC: ${e(chart.method.utcTime)} · ${e(chart.method.engineVersion)}</p>` +
      note(chart.warnings.join(" ")) +
      `<p>Автоматические пояснения Astrowed не являются личным заключением эксперта. Сила карты, полезные элементы и итоговые рекомендации требуют отдельного разбора.</p><div class="consultation-card">${artwork.expert ? `<img src="${e(artwork.expert)}" alt="Знак Юлии Гаврилычевой">` : ""}<div><h3>Юлия Гаврилычева</h3><p class="expert-role">Эксперт-астролог</p><p>Личная консультация · Ба Цзы · Фэн Шуй · Ци Мэнь</p><p>Запись на консультацию: +7 777 764-46-55<br><a href="${e(consultationLinks.whatsapp)}">WhatsApp ↗</a><a href="${e(consultationLinks.telegram)}">Telegram ↗</a></p></div></div>`,
  );
  const cover = options.cover ?? artwork.cover;
  const roadmap = `<section class="roadmap"><div class="roadmap-head">${reportOrnament}<div><span class="tag">НАВИГАЦИЯ ПО ОТЧЁТУ</span><h2>Ваша карта исследования</h2><p>От исходных данных к наблюдениям и вопросам для консультации.</p></div></div><ol class="contents">${chapters.map((chapter) => `<li><a href="#${chapter.id}"><b>${chapter.number}</b>${e(chapter.title)}<span>↗</span></a></li>`).join("")}</ol><div class="reading-key"><div><strong>01 · Данные</strong><p>Сначала проверьте дату, время, город и параметры расчёта.</p></div><div><strong>02 · Наблюдения</strong><p>Изучайте повторения и связи. Один символ не описывает всю карту.</p></div><div><strong>03 · Контекст</strong><p>Сопоставьте материал с опытом и обсудите вопросы с консультантом.</p></div></div></section>`;
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Astrowed — ${e(reportLevels[level])} отчёт · ${e(chart.input.name)}</title><style>${reportDocumentStyles}${reportGraphicStyles}</style></head><body>
    <header class="cover"><div class="cover-top"><span class="cover-brand">ASTROWED</span><span class="tag">${e(reportLevels[level]).toUpperCase()} ОТЧЁТ</span></div><h1>Личная карта.<br>Время и пространство.</h1><p class="cover-subtitle">БА ЦЗЫ · ФЭНШУЙ · ЦИ МЭНЬ</p>
    ${cover ? `<img class="cover-art" src="${e(cover)}" alt="Обсерватория Astrowed">` : reportOrnament}
    <h2 class="cover-name">${e(chart.input.name)}</h2><p class="birth-meta">${e(chart.input.date)} · ${chart.input.unknownTime ? "Время неизвестно" : e(chart.input.time)}<br>${e(chart.input.city)} · ${e(chart.input.timezone)}</p>
    <div class="identity">${artwork.expert ? `<img src="${e(artwork.expert)}" alt="Знак Юлии Гаврилычевой">` : ""}<div><h3>Юлия Гаврилычева</h3><p>Эксперт-астролог<br>Человек · пространство · время</p></div></div><div class="cover-date">СНИМОК НА ${e(date)} · ПЕРСОНАЛЬНЫЙ СПРАВОЧНИК</div></header>
    ${roadmap}${content}<footer>ASTROWED · ${e(reportLevels[level])} отчёт · ${e(date)} · Юлия Гаврилычева</footer></body></html>`;
}
