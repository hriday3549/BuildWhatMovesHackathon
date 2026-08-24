# Smart CPGRAMS Project Audit

Date: 2026-08-24

## 1. Existing architecture

- React + Vite single-page application written in TypeScript.
- UI state is held in `src/App.tsx` with view switching instead of React Router.
- Browser persistence is provided by `src/services/api.ts` through localStorage.
- Location behavior is split between `src/components/LocationMap.tsx` and `src/services/location.ts`.
- Department routing is split into `src/services/routing.ts`.

## 2. Existing features

- Demo citizen and officer entry points.
- Guided complaint choices, typed complaint entry, and browser speech recognition.
- Current browser location, address search, draggable/clickable Leaflet map pin, reverse geocoding, and explicit confirmation.
- Rule-based department routing with confidence and reason.
- Complaint creation with generated grievance ID and timeline.
- Citizen complaint list and ticket lookup.
- Officer evidence upload with EXIF GPS and original capture-time validation.
- Citizen accept/reject verification loop.
- Duplicate detection based on routed category, Haversine proximity, and a 48-hour window.
- Community parent ticket fields and parent resolution for officer lookup.

## 3. Existing APIs

- `getTickets`, `getTicket`, `createTicket`, `addOfficerUpdate`, and `verifyOfficerUpdate` in `src/services/api.ts`.
- `routeComplaint` in `src/services/routing.ts`.
- `reverseGeocode` and `searchAddress` in `src/services/location.ts`.
- No HTTP backend or server API exists.

## 4. Existing database schema

- No relational database or server schema exists.
- The mock persistence shape is a `Ticket` object in localStorage.

## 5. Existing UI pages

- Login/demo access view.
- Complaint intake view.
- Complaint success view.
- Citizen tracking view.
- Officer evidence workspace.
- These are views in `App.tsx`, not URL-addressable routes.

## 6. Existing dependencies

- React, React DOM, TypeScript, Vite, Leaflet, lucide-react, and exifr.
- No test runner, router, backend framework, database client, auth provider, or chart package.

## 7. Existing authentication

- Demo role selection only. No OTP, password, session, JWT, RBAC enforcement, or user identity stored on tickets.

## 8. Existing tests

- No automated test files or test script were found.
- Production typecheck/build is available through `npm run build`.

## 9. Existing problems

- Ticket data does not include citizen identity, priority, classification history, assignment history, or structured escalation history.
- SLA timestamps exist, but the interface shows static copy rather than a dynamic countdown or automatic escalation.
- Officer lookup now resolves a clustered child to its parent, but the officer presentation needs a visible community tag.
- localStorage is suitable only for a prototype and is not authorization-safe.
- Nominatim calls are made directly from the browser and require a production proxy/provider.

## 10. Missing Smart CPGRAMS requirements

- Production database and HTTP API.
- Secure authentication and role-based authorization.
- URL routes for dashboard and complaint details.
- Configurable department/category mapping service with priority and low-confidence alternatives.
- Full status transition history with actor, reason, and audit log.
- Configurable SLA rules, live countdown, automatic escalation path, and escalation notifications.
- Photo attachment during citizen intake.
- Public privacy-preserving heatmap.
- Automated unit, integration, and browser tests.

## 11. Recommended implementation order

1. Extend the mock contract with identity, structured history, classification, SLA, escalation, and community cluster metadata.
2. Add dynamic SLA and escalation behavior to the existing citizen and officer views.
3. Add visible community cluster state and parent/child navigation to both roles.
4. Add citizen photo attachment and low-confidence routing alternatives.
5. Add URL routing and separate dashboard/detail views if the prototype scope requires it.
6. Add a backend/database and secure auth before production deployment.

## Feature checks

| Feature | Existing status | Action |
| --- | --- | --- |
| Complaint creation | Complete prototype | Reuse and extend |
| Map/GPS | Complete prototype | Reuse |
| Department routing | Partial | Extend configuration and confidence handling |
| Tracking/timeline | Partial | Extend with structured history |
| SLA | Partial | Implement dynamic countdown and rules |
| Escalation | Missing as executable behavior | Implement in mock service |
| Officer workflow | Partial | Reuse and extend for parent clusters |
| Evidence | Complete prototype | Reuse |
| Citizen verification | Complete prototype | Reuse |
| Duplicate detection | Partial | Extend parent-only officer workflow and UI tag |
| Database/API/auth/tests | Missing | Document as production follow-up; keep prototype boundary explicit |
