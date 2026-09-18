---
name: retro
description: End-of-session retrospective that improves the repository agent harness from useful session learnings.
disable-model-invocation: true
model: sonnet
effort: medium
---

# Retrospective

Review this conversation and the resulting diff. Look for explicit corrections, repeated mistakes,
failed approaches, unnecessary reads or commands, noisy output, architectural friction, slow checks,
forgotten validation, useful conventions, and obsolete instructions.

Classify each useful learning before changing anything:

- Always-needed invariant: add only compact, durable facts to `AGENTS.md`.
- Path/domain-specific rule: update the smallest relevant `.claude/rules/*.md`.
- Repeatable workflow: create or improve a focused skill.
- Deterministic operation: prefer improving a script, hook, test, or configuration over prose.
- Debugging/project knowledge: leave to Auto Memory unless the repository must share it.
- Inferable information or one-off feedback: do not persist it.

Actively remove stale, duplicated, or inferable instructions. Do not fork context; this workflow needs
the current conversation. Optimize for a smaller, smarter harness.

Report only: what was learned; what was promoted; changed files; what was deliberately not persisted;
token-efficiency improvements; obsolete instructions removed.
