import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const payload = JSON.parse(readFileSync(0, "utf8"));
const filePath = payload.tool_input?.file_path;
const supported = /\.(?:css|html|js|json|jsonc|jsx|md|mdx|mjs|ts|tsx|yaml|yml)$/u;

if (typeof filePath === "string" && supported.test(filePath)) {
  const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const result = spawnSync(command, ["exec", "oxfmt", "--write", filePath], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exitCode = result.status ?? 1;
  }
}
