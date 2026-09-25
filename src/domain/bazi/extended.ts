import { LunarUtil } from "lunar-typescript";
import { DateTime } from "luxon";
import { calculate } from "./engine";
import { annualPillar, findInteractions } from "./relations";
import {
  branches,
  elements,
  elementOf,
  stems,
  stemElement,
  tenGodNames,
} from "./catalog";
import type { Chart } from "./types";

export const godThemes: Record<string, string> = {
  Братство:
    "Самостоятельность, равноправие и совместные усилия. В обсуждении карты это тема личной позиции и сотрудничества.",
  "Грабитель богатства":
    "Конкуренция, обмен и распределение общих ресурсов. Название не означает неизбежную потерю денег.",
  "Дух наслаждения":
    "Последовательное создание результата, мастерство и возможность получать удовольствие от процесса.",
  "Вызов власти":
    "Самовыражение, критическое мышление и пересмотр привычных правил. Важно выбирать уместную форму высказывания.",
  "Косвенное богатство":
    "Инициатива, поиск возможностей и управление переменными ресурсами.",
  "Прямое богатство":
    "Практичность, регулярность, учёт ресурсов и ответственность за результат.",
  "Седьмой убийца":
    "Дисциплина под давлением, решительность и работа с вызовами. Традиционное название не трактуется буквально.",
  "Прямая власть":
    "Порядок, обязательства, репутация и взаимодействие с установленными правилами.",
  "Косвенная печать":
    "Исследование, необычные подходы и самостоятельное освоение сложного материала.",
  "Прямая печать":
    "Обучение, поддержка, систематизация опыта и передача знаний.",
};
export const tenGodFor = (master: string, stem: string) =>
  tenGodNames[LunarUtil.SHI_SHEN[master + stem]];
export function periodRelations(chart: Chart, ganZhi: string) {
  return chart.pillars.flatMap((p) =>
    findInteractions([p, { stem: ganZhi[0], branch: ganZhi[1] }]).map((r) => ({
      ...r,
      position: p.label,
    })),
  );
}
export type StarRow = {
  name: string;
  han: string;
  target: string;
  basis: string;
  positions: string[];
  meaning: string;
  kind: "star" | "marker";
};
export function symbolicStars(chart: Chart): StarRow[] {
  const rows: StarRow[] = [];
  const groups = ["申子辰", "寅午戌", "亥卯未", "巳酉丑"];
  const locate = (target: string) =>
    chart.pillars.filter((p) => target.includes(p.branch)).map((p) => p.label);
  for (const key of ["year", "day"]) {
    const p = chart.pillars.find((p) => p.key === key)!;
    const group = groups.findIndex((g) => g.includes(p.branch));
    for (const [name, han, targets, meaning] of [
      [
        "Цветок персика",
        "桃花",
        "酉卯子午",
        "Общение, привлекательность и заметность в социальной среде.",
      ],
      [
        "Путешествующая лошадь",
        "驛馬",
        "寅申巳亥",
        "Перемещения, смена обстановки и активное взаимодействие с внешним миром.",
      ],
      [
        "Цветущий балдахин",
        "華蓋",
        "辰戌未丑",
        "Сосредоточенность, самостоятельное творчество и интерес к сложным вопросам.",
      ],
    ]) {
      const target = targets[group];
      rows.push({
        name,
        han,
        target,
        basis: `Ветвь ${key === "year" ? "года" : "дня"} ${p.branch}`,
        positions: locate(target),
        meaning,
        kind: "star",
      });
    }
  }
  const master = chart.dayMaster.stem,
    index = stems.indexOf(master);
  const academic = [..."巳午申酉申酉亥子寅卯"][index];
  const noble = [
    "丑未",
    "子申",
    "亥酉",
    "亥酉",
    "丑未",
    "子申",
    "丑未",
    "寅午",
    "卯巳",
    "卯巳",
  ][index];
  rows.push({
    name: "Звезда академика",
    han: "文昌",
    target: academic,
    basis: `Ствол дня ${master}`,
    positions: locate(academic),
    meaning:
      "Учёба, работа с текстом, способность оформлять и передавать знания.",
    kind: "star",
  });
  rows.push({
    name: "Небесный благородный",
    han: "天乙貴人",
    target: noble,
    basis: `Ствол дня ${master}`,
    positions: locate(noble),
    meaning: "Тема помощи, наставничества и поддержки через людей.",
    kind: "star",
  });
  const robber = stems[index ^ 1];
  rows.push({
    name: "Грабитель богатства",
    han: "劫財",
    target: robber,
    basis: `Тот же элемент, другая полярность к ${master}`,
    positions: chart.pillars.flatMap((p) => [
      ...(p.stem === robber ? [`${p.label}: ствол`] : []),
      ...(p.hidden.includes(robber) ? [`${p.label}: скрытый ствол`] : []),
    ]),
    meaning: godThemes["Грабитель богатства"],
    kind: "marker",
  });
  const day = chart.pillars.find((p) => p.key === "day")!;
  const opposite = branches[(branches.indexOf(day.branch) + 6) % 12];
  rows.push({
    name: "Личный разрушитель",
    han: "日支六沖",
    target: opposite,
    basis: `Принятая здесь конвенция: столкновение с ветвью дня ${day.branch}`,
    positions: locate(opposite),
    meaning:
      "Маркер противоположной ветви дня. Термин зависит от школы; здесь используется именно дневное столкновение.",
    kind: "marker",
  });
  return rows;
}
const portraits: Record<string, string> = {
  甲: "Образ большого дерева: направление, опора и последовательное развитие. Вопрос для самоисследования — что помогает сохранять курс и где нужна гибкость?",
  乙: "Образ гибкого растения: адаптация, связь и постепенное движение. Вопрос для самоисследования — как сочетать чуткость к среде с собственными границами?",
  丙: "Образ солнечного света: открытость и стремление делать происходящее видимым. Вопрос — как распределять внимание и оставлять время для восстановления?",
  丁: "Образ огня светильника: сосредоточенность, тонкость и передача тепла. Вопрос — какая среда поддерживает устойчивое внимание?",
  戊: "Образ горы: устойчивость и способность удерживать форму. Вопрос — где надёжность помогает, а где привычный подход нуждается в пересмотре?",
  己: "Образ плодородной почвы: забота, накопление и практическая работа. Вопрос — что стоит развивать, а какие обязательства перегружают?",
  庚: "Образ необработанного металла: решение, границы и превращение замысла в действие. Вопрос — как совместить прямоту с вниманием к контексту?",
  辛: "Образ обработанного металла: качество, различение и точность формы. Вопрос — когда высокие стандарты помогают, а когда задерживают результат?",
  壬: "Образ большой воды: масштаб, движение и поиск связей. Вопрос — что помогает направлять широкий интерес в конкретное дело?",
  癸: "Образ дождя: наблюдательность, постепенность и внимание к деталям. Вопрос — как сделать накопленное понимание доступным другим?",
};
export function interpretChart(chart: Chart) {
  const master = chart.dayMaster;
  const dominant = [...elements].sort(
    (a, b) => chart.distribution[b.id] - chart.distribution[a.id],
  )[0];
  const roots = chart.pillars.filter((p) =>
    p.hidden.some((s) => stemElement(s) === master.element),
  );
  const month = chart.pillars.find((p) => p.key === "month")!;
  const gods = Array.from(
    new Set(chart.pillars.filter((p) => p.key !== "day").map((p) => p.tenGod)),
  );
  return [
    {
      title: `Господин дня ${master.stem} · ${master.polarity} ${elementOf(master.element).name}`,
      text: portraits[master.stem],
    },
    {
      title: "Баланс и проявление элементов",
      text: `Наибольшая структурная доля: ${dominant.name} (${chart.distribution[dominant.id]}%). ${dominant.quality}. Доли учитывают видимые и скрытые стволы; сезонная сила из этих процентов не выводится.`,
    },
    {
      title: "Опоры Господина дня",
      text: `Свой элемент найден в скрытых стволах: ${roots.map((p) => p.label).join(", ") || "не обнаружен"}. Месячная ветвь ${month.branch}, её скрытые стволы: ${month.hidden.join(" · ")}. Для силы карты совместно оцениваются сезон, корни, поддержка и взаимодействия.`,
    },
    {
      title: "Темы десяти богов",
      text: gods
        .map(
          (g) =>
            `${g}: ${godThemes[g] || "рассматривается относительно ствола дня"}`,
        )
        .join(" "),
    },
    {
      title: "Структура и полезные элементы",
      text: "Окончательный выбор структуры, полезных и неблагоприятных элементов требует принятой школы и оценки специалиста. Он не присваивается автоматически по дефициту элемента. Используйте столпы, сезон и корни как проверяемые основания для разбора.",
    },
    {
      title: "Взаимодействия",
      text: chart.interactions.length
        ? `${chart.interactions.map((r) => `${r.symbols} — ${r.name.toLowerCase()}`).join("; ")}. Сочетание показывает связь; превращение в другой элемент требует дополнительных условий.`
        : "Поддерживаемые парные взаимодействия в карте не найдены. Это не означает отсутствия динамики: отдельного разбора требуют сезон, структура и приходящие периоды.",
    },
    {
      title: "Как читать символические звёзды",
      text: "Шэнь Ша — дополнительный слой традиционной символики. Таблица указывает правило и столп обнаружения. Повторение по двум основаниям не считается удвоением эффекта; отсутствие звезды не исключает жизненную тему.",
    },
  ];
}
export function currentEnergies(chart: Chart, date: string, time = "12:00") {
  const current = calculate({
    ...chart.input,
    date,
    time,
    unknownTime: false,
    name: "Выбранный момент",
  });
  return current.pillars.map((p) => ({
    ...p,
    tenGod: tenGodFor(chart.dayMaster.stem, p.stem),
    relations: periodRelations(chart, p.stem + p.branch),
  }));
}
export function lifeYears(
  chart: Chart,
  start = Number(chart.input.date.slice(0, 4)),
  count = 100,
) {
  const birthYear = Number(chart.input.date.slice(0, 4));
  return Array.from({ length: Math.max(0, Math.min(120, count)) }, (_, i) => {
    const year = start + i,
      ganZhi = annualPillar(year),
      relations = periodRelations(chart, ganZhi);
    return {
      year,
      age: year - birthYear,
      ganZhi,
      tenGod: tenGodFor(chart.dayMaster.stem, ganZhi[0]),
      relations,
      stars: symbolicStars(chart)
        .filter((s) => s.kind === "star" && s.target.includes(ganZhi[1]))
        .map((s) => s.name)
        .filter((s, i, a) => a.indexOf(s) === i),
      luck:
        chart.luck.find((l) => year >= l.startYear && year <= l.endYear)
          ?.ganZhi ?? null,
    };
  });
}
export function detailedLuck(chart: Chart) {
  return chart.luck.map((p, i) => {
    const start = chart.luckStart
      ? DateTime.fromISO(chart.luckStart, { zone: "UTC+8" }).plus({
          years: i * 10,
        })
      : null;
    return {
      ...p,
      startDate: start?.toISODate(),
      endDate: start?.plus({ years: 10 }).minus({ days: 1 }).toISODate(),
      tenGod: tenGodFor(chart.dayMaster.stem, p.ganZhi[0]),
      relations: periodRelations(chart, p.ganZhi),
      meaning: godThemes[tenGodFor(chart.dayMaster.stem, p.ganZhi[0])],
    };
  });
}
