import { readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
const path = new URL("../.env", import.meta.url);
let env = "";
try {
  env = await readFile(path, "utf8");
} catch {}
for (const key of ["WORKSPACE_PASSWORD", "SESSION_SECRET"]) {
  if (!new RegExp(`^${key}=.+$`, "m").test(env)) {
    env = env.replace(new RegExp(`^${key}=.*$`, "gm"), "");
    env += `\n${key}=${randomBytes(key === "SESSION_SECRET" ? 48 : 18).toString("base64url")}\n`;
  }
}
await writeFile(path, env);
console.log(
  "Private workspace credentials configured in .env. No secrets printed.",
);
