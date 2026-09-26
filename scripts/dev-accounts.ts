import { config } from "dotenv";
import { spawn } from "node:child_process";
config({ path: ".env.accounts-development", override: true, quiet: true });
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "apps/pages", "--hostname", "127.0.0.1", "--port", "3002"], { stdio: "inherit", env: process.env });
child.on("exit", code => { process.exitCode = code ?? 1; });
