# Database Plan

No database exists in this prototype. localStorage is intentionally used only to make the demo self-contained.

The production relational model should include:

- `users`, `citizens`, and `officers`
- `departments`, `categories`, and configurable `routing_rules`
- `complaints` and normalized `complaint_locations`
- `complaint_status_history`, `complaint_assignments`, and `complaint_evidence`
- `complaint_clusters` and cluster membership records
- `sla_rules`, `escalation_rules`, and `escalations`
- `notifications` and `audit_logs`

Cluster matching should run server-side with indexed geography and category/time filters. Personal contact details and precise private addresses must never be exposed in a public heatmap.
