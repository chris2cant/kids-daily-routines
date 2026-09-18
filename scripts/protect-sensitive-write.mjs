import { readFileSync } from "node:fs";
import { basename } from "node:path";

const payload = JSON.parse(readFileSync(0, "utf8"));
const filePath = payload.tool_input?.file_path;

if (typeof filePath === "string") {
  const name = basename(filePath);
  const isAllowedExample = name === ".env.example";
  const isSensitive =
    /^\.env(?:\..+)?$/u.test(name) ||
    /credential|private[-_.]?key|secret/iu.test(name) ||
    /\.(?:key|pem|p12|pfx)$/iu.test(name);

  if (isSensitive && !isAllowedExample) {
    process.stderr.write(`Blocked write to sensitive file: ${filePath}\n`);
    process.exit(2);
  }
}
