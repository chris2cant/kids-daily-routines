import { spawn } from "node:child_process";
import { join } from "node:path";
import { performance } from "node:perf_hooks";

const executableSuffix = process.platform === "win32" ? ".cmd" : "";
const localBin = (name) => join("node_modules", ".bin", `${name}${executableSuffix}`);
const checks = [
  ["format", localBin("oxfmt"), ["--check", "."]],
  ["lint + types", localBin("oxlint"), ["--format=agent"]],
  ["tests", localBin("vitest"), ["run", "--passWithNoTests", "--reporter=dot"]],
];

function run(command, args) {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const child = spawn(command, args, {
      env: { ...process.env, FORCE_COLOR: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";

    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    child.on("error", (error) => {
      resolve({ duration: performance.now() - startedAt, error, output });
    });
    child.on("close", (code) => {
      resolve({ code, duration: performance.now() - startedAt, output });
    });
  });
}

const startedAt = performance.now();
const results = await Promise.all(checks.map(([, command, args]) => run(command, args)));
let failed = false;

for (const [index, [label]] of checks.entries()) {
  const result = results[index];
  if (!result || result.code !== 0 || result.error) {
    failed = true;
    process.stderr.write(`\n✗ ${label}\n${result?.output ?? result?.error ?? "Unknown failure"}\n`);
  } else {
    process.stdout.write(`✓ ${label.padEnd(12)} ${(result.duration / 1000).toFixed(1)}s\n`);
  }
}

const total = ((performance.now() - startedAt) / 1000).toFixed(1);
process.stdout.write(`\n${failed ? "✗" : "✓"} check ${total}s\n`);
process.exitCode = failed ? 1 : 0;
