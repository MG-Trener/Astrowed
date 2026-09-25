import { elements } from "@/domain/bazi/catalog";

export { libraryArticles as articles } from "@/data/library";
export const edges = elements.map((e, i) => ({
  sourceId: e.id,
  targetId: elements[(i + 1) % 5].id,
  relation: "generation",
}));
