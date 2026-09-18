---
paths:
  - "src/features/**/*"
---

Keep each feature cohesive and locally understandable. Colocate its domain logic, browser boundary,
schema, and unit tests. Depend directly on another feature's owning module only when unavoidable.
