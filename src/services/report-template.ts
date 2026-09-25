import type { Chart } from "../domain/bazi/types";
import { elements, elementOf } from "../domain/bazi/catalog";
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
  const table = (headers: string[], rows: string[][]) =>
    `<table><thead><tr>${headers.map((h) => `<th>${e(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${e(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const note = (s: string) => `<p class="note">${e(s)}</p>`;
  const section = (title: string, body: string) =>
    `<section class="report-section"><h2>${e(title)}</h2>${body}</section>`;
  const paras = (rows: { title: string; text: string }[]) =>
    rows
      .map(
        (r) => `<article><h3>${e(r.title)}</h3><p>${e(r.text)}</p></article>`,
      )
      .join("");
  const pillars = `<div class="pillars">${chart.pillars.map((p) => `<div class="pillar" style="--element:${elementOf(p.element).color}"><small>${e(p.label)}</small><strong>${e(p.stem)}<br>${e(p.branch)}</strong><p>${e(p.polarity)} ${e(elementOf(p.element).name)}</p><p>${e(p.tenGod)}</p><div>${e(p.hidden.join(" · "))}</div></div>`).join("")}</div>`;
  let content = section(
    "01 / Личная карта Ба Цзы",
    pillars +
      `<div class="bars">${elements.map((el) => `<div><span>${el.symbol} ${el.name}</span><i style="width:${chart.distribution[el.id]}%;background:${el.color}"></i><b>${chart.distribution[el.id]}%</b></div>`).join("")}</div>` +
      note(
        "Распределение видимых и скрытых стволов без сезонных коэффициентов. Оно не определяет силу карты.",
      ) +
      (professional ? paras(interpretChart(chart).slice(0, 6)) : ""),
  );
  content += section(
    "Понятный разбор вашей карты",
    note(reading.notice) +
      note(reading.boundaryNote) +
      (full ? reading.sections : reading.sections.slice(0, 2))
        .map(
          (s) =>
            `<article><h3>${e(s.title)}</h3><p>${e(s.text)}</p><p><b>Вопрос к себе:</b> ${e(s.question)}</p>${professional && s.evidence.length ? `<p><small>Основание: ${e(s.evidence.join("; "))}</small></p>` : ""}</article>`,
        )
        .join("") +
      `<p><b>Практический шаг:</b> ${e(reading.action)}</p>`,
  );
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
      `<p>Автоматические пояснения Astrowed не являются личным заключением эксперта. Сила карты, полезные элементы и итоговые рекомендации требуют отдельного разбора.</p><h3>Юлия Гаврилычева</h3><p>Запись на консультацию: +7 777 764-46-55<br><a href="https://wa.me/77777644655">WhatsApp</a> · <a href="https://t.me/+77777644655">Telegram</a></p>`,
  );
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Astrowed — ${e(reportLevels[level])} отчёт · ${e(chart.input.name)}</title><style>
  @page{size:A4;margin:17mm 15mm}*{box-sizing:border-box}body{margin:0;font:11px/1.65 Arial,'Microsoft YaHei','Noto Sans CJK SC',sans-serif;color:#23372f;background:white}h1,h2,h3,p{margin:0}p{margin:8px 0}h1{font-size:40px;line-height:1.14;font-weight:400;overflow-wrap:anywhere}h2{font-size:22px;font-weight:400;border-bottom:1px solid #b6c6bb;padding-bottom:12px;margin:6px 0 20px;break-after:avoid}h3{font-size:14px;margin:15px 0 6px;break-after:avoid}a{color:#2a644d}small{font-size:9px;color:#5c7065}.cover{height:248mm;position:relative;display:flex;flex-direction:column;padding:12mm;background:#102b24;color:#ecf1e8;break-after:page}.cover img{width:100%;height:85mm;object-fit:cover;margin:14mm 0 9mm}.cover .tag{font-size:9px;letter-spacing:3px;color:#c5d5c4}.cover .identity{margin-top:auto;border-top:1px solid #537364;padding-top:6mm}.cover h1{font-size:36px}.cover p{color:#d3dfd3}.report-section{margin:0 0 24px}.report-section+.report-section{break-before:page}.pillars{display:flex;margin:20px 0;border:1px solid #d5ded5}.pillar{flex:1;text-align:center;padding:15px 8px;border-top:4px solid var(--element)}.pillar strong{font-size:34px;line-height:1.5;font-weight:400}.pillar p{font-size:10px}.bars{margin:16px 0}.bars>div{display:flex;align-items:center;gap:12px;margin:9px 0}.bars span{width:76px;flex-shrink:0}.bars i{display:block;height:8px;max-width:65%}.bars b{font-weight:400}.note{font-size:10px;padding:12px 15px;background:#edf2eb;color:#4d6657;border-left:3px solid #91ae92}.qimen-grid{display:grid;grid-template-columns:repeat(3,1fr);border-left:1px solid #cad6ce;border-top:1px solid #cad6ce;margin:18px 0;break-inside:avoid}.qimen-grid>div{min-height:34mm;padding:12px;border-right:1px solid #cad6ce;border-bottom:1px solid #cad6ce}.qimen-grid strong{font-size:25px;display:block;font-weight:400}.qimen-grid p{margin:3px 0;font-size:10px}table{width:100%;border-collapse:collapse;margin:14px 0;font-size:10px;table-layout:auto}th{background:#e8efe6;text-align:left;font-weight:600}td,th{border-bottom:1px solid #d8e0d8;padding:8px 7px;vertical-align:top;overflow-wrap:anywhere}thead{display:table-header-group}tr,article{break-inside:avoid}article{margin-bottom:17px}.consultant-comment{white-space:pre-wrap}footer{margin-top:20px;padding-top:12px;border-top:1px solid #ccd7ca;font-size:9px;color:#526959}@media screen{body{max-width:800px;margin:20px auto;padding:22px;box-shadow:0 0 30px #0001}.cover{height:950px}.report-section{margin-top:40px}}@media print{.cover{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body><header class="cover"><span class="tag">ASTROWED / ЧЕЛОВЕК · ПРОСТРАНСТВО · ВРЕМЯ</span>${options.cover ? `<img src="${e(options.cover)}" alt="Обсерватория Astrowed">` : ""}<span class="tag">${e(reportLevels[level]).toUpperCase()} ОТЧЁТ</span><h1>${e(chart.input.name)}</h1><p>${e(chart.input.date)} · ${chart.input.unknownTime ? "Время неизвестно" : e(chart.input.time)}<br>${e(chart.input.city)} · ${e(chart.input.timezone)}</p><div class="identity"><h3>Юлия Гаврилычева</h3><p>Эксперт проекта · Ба Цзы · Фэн Шуй · Ци Мэнь</p><span class="tag">СНИМОК НА ${e(date)}</span></div></header>${content}<footer>ASTROWED · ${e(reportLevels[level])} отчёт · ${e(date)} · Юлия Гаврилычева</footer></body></html>`;
}
