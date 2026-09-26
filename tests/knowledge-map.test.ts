import { describe, expect, it } from "vitest";
import { libraryArticles } from "../src/data/library";
import {
  learningPaths,
  neighborsOf,
  resolveKnowledgeEdges,
} from "../src/data/knowledge-map";

describe("knowledge atlas", () => {
  it("connects every bundled article, with explanations and no missing endpoints", () => {
    const edges = resolveKnowledgeEdges(libraryArticles);
    const slugs = new Set(libraryArticles.map((n) => n.slug));
    edges.forEach((e) => {
      expect(slugs.has(e.source) && slugs.has(e.target)).toBe(true);
      expect(e.explanation.length).toBeGreaterThan(20);
    });
    libraryArticles.forEach((n) =>
      expect(
        neighborsOf(n.slug, libraryArticles, edges).length,
      ).toBeGreaterThan(0),
    );
  });
  it("resolves CMS UUIDs and removes duplicate and unpublished links", () => {
    const nodes = libraryArticles.map((n, i) => ({ ...n, id: `uuid-${i}` }));
    const wood = nodes.find((n) => n.slug === "wood")!,
      fire = nodes.find((n) => n.slug === "fire")!;
    const edges = resolveKnowledgeEdges(nodes, [
      { sourceId: wood.id, targetId: fire.id, relation: "generation" },
      { sourceId: "draft-id", targetId: wood.id, relation: "generation" },
    ]);
    expect(
      edges.filter(
        (e) =>
          e.source === "wood" && e.target === "fire" && e.kind === "generation",
      ),
    ).toHaveLength(1);
    expect(edges.some((e) => e.source === "draft-id")).toBe(false);
  });
  it("keeps incoming and outgoing element relationships distinct", () => {
    const edges = resolveKnowledgeEdges(libraryArticles);
    const wood = neighborsOf("wood", libraryArticles, edges);
    expect(wood.find((n) => n.node.slug === "water")?.links).toContainEqual(
      expect.objectContaining({
        source: "water",
        target: "wood",
        kind: "generation",
      }),
    );
    expect(wood.find((n) => n.node.slug === "earth")?.links).toContainEqual(
      expect.objectContaining({
        source: "wood",
        target: "earth",
        kind: "control",
      }),
    );
  });
  it("preserves custom editorial links without mislabelling them as generation", () => {
    const nodes = [
      ...libraryArticles,
      {
        id: "custom-id",
        slug: "custom",
        title: "Custom",
        symbol: null,
        summary: "Editorial",
      },
    ];
    const edges = resolveKnowledgeEdges(nodes, [
      { sourceId: "custom-id", targetId: "wood", relation: "context" },
    ]);
    expect(edges.find((e) => e.source === "custom")?.kind).toBe("related");
    expect(resolveKnowledgeEdges([], [])).toEqual([]);
  });
  it("offers reading routes composed entirely of published bundled topics", () => {
    learningPaths.forEach((p) =>
      p.slugs.forEach((slug) =>
        expect(libraryArticles.some((n) => n.slug === slug)).toBe(true),
      ),
    );
  });
});
