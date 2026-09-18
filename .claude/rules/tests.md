---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "tests/e2e/**/*"
---

Keep unit tests beside their implementation and DOM-free by default. E2E tests cover user journeys,
use accessible locators, and retain traces or media primarily on failure.
