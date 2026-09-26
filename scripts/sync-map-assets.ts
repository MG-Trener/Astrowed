import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";
// Next/Turbopack does not emit the ES worker's sibling shared module.
for (const root of ["public", "apps/pages/public"]) {
  const destination = path.join(root, "maplibre");
  mkdirSync(destination, { recursive: true });
  for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"])
    copyFileSync(
      path.join("node_modules/maplibre-gl/dist", file),
      path.join(destination, file),
    );
  copyFileSync(
    "node_modules/maplibre-gl/LICENSE.txt",
    path.join(destination, "LICENSE.txt"),
  );
}
