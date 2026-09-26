import { cpSync, mkdirSync } from "node:fs";
mkdirSync("apps/pages/public", { recursive: true });
cpSync("public/locations", "apps/pages/public/locations", { recursive: true });
cpSync("public/audio", "apps/pages/public/audio", { recursive: true });
