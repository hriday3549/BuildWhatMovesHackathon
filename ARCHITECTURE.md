# Architecture

Smart CPGRAMS is currently a Vite React prototype with a service boundary that can be moved behind HTTP APIs later.

```text
App.tsx
  -> routing.ts       complaint classification and authority recommendation
  -> location.ts      search and reverse geocoding
  -> api.ts           mock complaint, cluster, SLA, escalation, evidence, verification service
  -> localStorage     prototype persistence only
```

Business rules are kept in services rather than embedded in UI controls. Duplicate matching uses routed category, Haversine distance, and a time window. A matched report is retained as a citizen-owned child record while the officer workflow resolves it to one root parent record.

The production target is to replace `api.ts` with authenticated HTTP services and PostgreSQL persistence without changing the UI contract.
