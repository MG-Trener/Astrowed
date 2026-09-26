import type { StyleSpecification, ExpressionSpecification } from "maplibre-gl";
export function russianMapStyle(style: StyleSpecification): StyleSpecification {
  const houseNumbers = style.layers.some(
    (layer) =>
      layer.type === "symbol" &&
      "source-layer" in layer &&
      layer["source-layer"] === "housenumber",
  );
  const extraLayers: StyleSpecification["layers"] =
    !houseNumbers && style.sources.openmaptiles?.type === "vector"
      ? [
          {
            id: "astrowed-house-numbers",
            type: "symbol",
            source: "openmaptiles",
            "source-layer": "housenumber",
            minzoom: 16,
            layout: {
              "text-field": ["get", "housenumber"],
              "text-font": ["Noto Sans Regular"],
              "text-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                16,
                11,
                19,
                15,
              ],
              "text-padding": 2,
            },
            paint: {
              "text-color": "#30483c",
              "text-halo-color": "#ffffff",
              "text-halo-width": 1.6,
            },
          },
        ]
      : [];
  return {
    ...style,
    layers: [...style.layers, ...extraLayers].map((layer) => {
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
