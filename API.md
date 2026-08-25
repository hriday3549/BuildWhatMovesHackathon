# Prototype API Contract

The current implementation is local and asynchronous, but these functions define the service boundary.

- `getTickets()` returns citizen-visible tickets and applies due SLA escalation.
- `getTicket(id)` returns one ticket and applies due SLA escalation.
- `getOfficerTicket(id)` resolves a child cluster ticket to its root parent.
- `createTicket(input)` creates a ticket and returns an optional duplicate match.
- `addOfficerUpdate(id, update)` stores validated resolution evidence.
- `verifyOfficerUpdate(id, decision)` accepts or reopens a resolution.
- `routeComplaint(text)` returns category, department, team, confidence, and reason.

A production API should enforce authentication, authorization, validation, audit logging, rate limiting, and server-side cluster matching.
