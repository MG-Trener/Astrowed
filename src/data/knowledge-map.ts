import { elements } from "../domain/bazi/catalog";
export type KnowledgeNode = {
  id: string;
  slug: string;
  title: string;
  symbol: string | null;
  summary: string;
};
export type StoredKnowledgeEdge = {
  sourceId: string;
  targetId: string;
  relation: string;
};
export type KnowledgeEdge = {
  source: string;
  target: string;
  kind: "generation" | "control" | "study" | "related";
  label: string;
  explanation: string;
};
const connections: [string, string, string][] = [
  [
    "hidden-stems",
    "four-pillars",
    "Земные ветви каждого столпа содержат скрытые стволы.",
  ],
  [
    "element-balance",
    "hidden-stems",
    "В распределении элементов учитывается состав скрытых стволов.",
  ],
  [
    "personal-gua",
    "feng-shui-compass",
    "Для чтения направлений Гуа нужна корректная ориентация.",
  ],
  [
    "personal-gua",
    "solar-terms",
    "Граница расчётного года определяется по Ли Чунь.",
  ],
  [
    "qimen-nine-palaces",
    "qimen-eight-doors",
    "Двери — один из слоёв внешних дворцов карты.",
  ],
  [
    "qimen-nine-palaces",
    "solar-time",
    "Исходное время и настройки метода нужно проверять до чтения карты.",
  ],
  [
    "four-pillars",
    "day-master",
    "Ствол дня задаёт точку отсчёта для чтения всей карты.",
  ],
  [
    "day-master",
    "ten-gods",
    "Десять богов описывают отношения других стволов к Господину дня.",
  ],
  [
    "ten-gods",
    "luck-cycles",
    "В приходящих периодах также рассматривают отношения к Господину дня.",
  ],
  [
    "four-pillars",
    "solar-time",
    "Для столпа часа нужны место рождения и корректный перевод времени.",
  ],
  [
    "solar-time",
    "unknown-time",
    "Если час неизвестен, точность нельзя заменить условным временем рождения.",
  ],
  [
    "solar-time",
    "solar-terms",
    "Поправку часа и астрономические границы календаря следует различать.",
  ],
  [
    "solar-terms",
    "four-pillars",
    "Солнечные термины задают границы года и месяцев в принятой методике.",
  ],
  [
    "unknown-time",
    "four-pillars",
    "При неизвестном времени столп часа не строится; границы даты требуют внимания.",
  ],
  [
    "four-pillars",
    "symbolic-stars",
    "Символические звёзды находят по сочетаниям знаков; они дополняют разбор.",
  ],
  [
    "four-pillars",
    "luck-cycles",
    "Сначала читают натальную основу, затем сопоставляют её с периодами.",
  ],
  ...elements.map((e): [string, string, string] => [
    "day-master",
    e.id,
    `Господин дня принадлежит одной из пяти стихий. «${e.name}» — один из возможных вариантов, а не вывод о вашей карте.`,
  ]),
];
export const learningPaths = [
  {
    id: "start",
    title: "Прочитать свою карту",
    description: "От четырёх столпов к отношениям и периодам.",
    slugs: ["four-pillars", "day-master", "ten-gods", "luck-cycles"],
  },
  {
    id: "time",
    title: "Разобраться со временем",
    description: "Город, неизвестный час и границы календаря.",
    slugs: ["solar-time", "unknown-time", "solar-terms", "four-pillars"],
  },
  {
    id: "elements",
    title: "Понять пять элементов",
    description: "Познакомиться с образами и связями стихий.",
    slugs: elements.map((e) => e.id),
  },
];
// Match stored UUIDs through published nodes; built-in connections use article slugs.
export function resolveKnowledgeEdges(
  nodes: KnowledgeNode[],
  stored: StoredKnowledgeEdge[] = [],
): KnowledgeEdge[] {
  const available = new Set(nodes.map((n) => n.slug));
  const ids = new Map(nodes.map((n) => [n.id, n.slug]));
  const result: KnowledgeEdge[] = [];
  const seen = new Set<string>();
  const add = (edge: KnowledgeEdge) => {
    const key = `${edge.source}:${edge.target}:${edge.kind}`;
    if (
      !available.has(edge.source) ||
      !available.has(edge.target) ||
      edge.source === edge.target ||
      seen.has(key)
    )
      return;
    seen.add(key);
    result.push(edge);
  };
  for (const [source, target, explanation] of connections)
    add({
      source,
      target,
      kind: "study",
      label: "Помогает понять",
      explanation,
    });
  elements.forEach((e, i) => {
    const next = elements[(i + 1) % 5],
      controlled = elements[(i + 2) % 5];
    add({
      source: e.id,
      target: next.id,
      kind: "generation",
      label: "Порождение",
      explanation: `${e.name} → ${next.name}: в традиционной модели источник поддерживает следующий элемент.`,
    });
    add({
      source: e.id,
      target: controlled.id,
      kind: "control",
      label: "Контроль",
      explanation: `${e.name} → ${controlled.name}: в традиционной модели один элемент сдерживает другой. Это не оценка «хорошо» или «плохо».`,
    });
  });
  stored.forEach((e) => {
    const source = ids.get(e.sourceId),
      target = ids.get(e.targetId);
    if (!source || !target) return;
    const kind =
      e.relation === "generation" || e.relation === "control"
        ? e.relation
        : "related";
    add({
      source,
      target,
      kind,
      label:
        kind === "generation"
          ? "Порождение"
          : kind === "control"
            ? "Контроль"
            : "Связь редактора",
      explanation:
        "Связь опубликованных материалов, добавленная редактором библиотеки. Уточняйте её смысл в статьях.",
    });
  });
  return result;
}
export function neighborsOf(
  slug: string,
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[],
) {
  return nodes
    .filter((n) => n.slug !== slug)
    .map((node) => ({
      node,
      links: edges.filter(
        (e) =>
          (e.source === slug && e.target === node.slug) ||
          (e.target === slug && e.source === node.slug),
      ),
    }))
    .filter((item) => item.links.length > 0);
}
