import type { StyleSpecification, ExpressionSpecification } from "maplibre-gl";
export function russianMapStyle(style: StyleSpecification): StyleSpecification {
  return {
    ...style,
    layers: style.layers.map((layer) => {
      if (
        layer.type !== "symbol" ||
        !JSON.stringify(layer.layout?.["text-field"] ?? "").includes("name")
      )
        return layer;
      return {
        ...layer,
        layout: {
          ...layer.layout,
          "text-field": [
            "coalesce",
            ["get", "name:ru"],
            ["get", "name"],
            ["get", "name:latin"],
            "",
          ] as ExpressionSpecification,
        },
      };
    }),
  };
}
