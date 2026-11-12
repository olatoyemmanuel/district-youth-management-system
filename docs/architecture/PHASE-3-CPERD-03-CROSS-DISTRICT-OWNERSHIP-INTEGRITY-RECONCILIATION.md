# DYMS Phase 3 — CPERD-03 Cross-District Ownership Integrity Reconciliation

- Revision: XDO-CPERD-03 Draft 0.1
- Date: 2026-11-12
- Governing authority: OD-03 referential integrity; ODR-004 organization/scope; DDD-005 scope-bound authorization; current Federation read-only oversight decision
- Status: **HIGH-PRIORITY DESIGN GAP REGISTER; CANDIDATE CLOSURE PROPOSED; NOT APPROVED**
- Implementation authorization: **GRANTED CONDITIONALLY; NOT EXERCISABLE BEFORE FINAL CPERD-03 APPROVAL**

## 1. Purpose

OD-03 requires cross-district ownership to be protected at both database and application layers. This review identifies where the current CPERD-03 candidate FKs prove referential existence but do not yet prove that related records belong to the same district.

A valid FK to an existing member, church, department or event is not sufficient tenant isolation when the relationship is required to remain within one district.

This document records candidate physical corrections. It does not silently apply them to the canonical registers or authorize implementation.

## 2. Current ownership roots

- Federation owns its district set.
- District owns churches and departments.
- Members, appointments, events, registrations, attendance and operational access must resolve to the correct district scope.
- Federation oversight is read-only and restricted to the districts in one federation.
- District operational users must not read or mutate another district's operational records.

## 3. Gap matrix

| Relationship / table | Current CPERD-03 candidate | Ownership gap | Candidate closure |
|---|---|---|---|
| districts → federations | Required districts.federation_id FK; federation-scoped district code uniqueness | Parent relation is represented | Retain; verify all district reads resolve federation ownership |
| churches → districts | churches.district_id FK; composite UNIQUE(id,district_id) and district/code key | Base ownership is represented | Retain composite key and use it for every child church reference |
| departments → districts | departments.district_id FK; composite UNIQUE(id,district_id) and district/code key | Base ownership is represented | Retain composite key and use it for every child department reference |
| members → districts | members has no district_id; district is inferred indirectly through church membership | No direct database key proves the member belongs to one district; member provisioning and pre-membership states lack a durable district owner | Candidate: add members.district_id NOT NULL, FK to districts(id), and UNIQUE(id,district_id). Treat district ownership as immutable in v1 because Church Transfer is excluded |
| church_memberships → member and church | Separate member_id → members(id) and church_id → churches(id) FKs | The database does not prove the member and church share the same district | Candidate: add district_id NOT NULL; composite FKs (member_id,district_id) → members(id,district_id) and (church_id,district_id) → churches(id,district_id) |
| member_category_assignments → member | member_id → members(id) | No direct district key on the assignment | Candidate: add district_id and composite FK (member_id,district_id) → members(id,district_id), or formally document why member district ownership is sufficient without a duplicated scope key |
| department_memberships → member and department | Separate member_id and department_id FKs | A member could be linked to a department in another district at the FK level | Candidate: add district_id and composite FKs to members(id,district_id) and departments(id,district_id) |
| appointments → appointee member | appointee_member_id → members(id); appointment district is already present and position scope is composite | The appointee could belong to a different district than the appointment scope | Candidate: composite FK (appointee_member_id,district_id) → members(id,district_id) |
| event_registrations → event and member | Separate event_id and member_id FKs | No DB proof that the registering member belongs to the event's district | Candidate: add district_id; composite FKs to events(id,district_id) and members(id,district_id) |
| event_attendance_subjects → event and member | Separate event_id and member_id FKs | No DB proof that the attendance subject's member belongs to the event's district | Candidate: add district_id; composite FKs to events(id,district_id) and members(id,district_id) |
| attendance_records → event/member/subject | Composite FK to attendance subject, registration and session | Transitive same-district integrity depends on registration and attendance subject ownership being corrected | Retain composite event/member identity FKs; verify transitive ownership after subject/registration corrections |
| event_organizing_departments → event and department | Composite event/district and department/district FKs | Same-district organizer ownership is represented | Retain |
| events → church | Composite church_id,district_id → churches(id,district_id) | Same-district event ownership is represented | Retain |
| positions → church/department | Composite child scope/district FKs | Same-district position scope is represented | Retain |
| appointments → position | Composite position/district/scope type FKs | Position scope is represented; appointee district remains open | Retain position constraints and add/verify appointee ownership |
| user_role_assignments → church/department/district | Separate simple FKs and a scope-shape CHECK | Church/department references are not tied to the same district by a composite FK | Candidate: add composite child-scope FKs using district_id; define one canonical authorization scope type and scope-shape predicate |
| access_denies → church/department/district | Separate simple FKs and a scope-shape CHECK | Explicit deny scope may reference a child in a different district than the declared district | Candidate: same composite child-scope FKs and scope-shape predicate as user_role_assignments |
| audit_events / audit_access_events → organization scope | Optional simple FKs to district/church/department | A supplied district and child scope are not always proven to match | Candidate: add composite church/district and department/district FKs where the event carries both values |
| report_runs → district/church/department | Composite church/district and department/district FKs | Standard report-run scope is structurally represented | Retain; federation aggregate oversight remains a separate GET-only query surface |

## 4. Federation-scoped authorization gap

The current user_role_assignments and access_denies candidates contain district, church and department scope fields, but no federation_id scope. The read-only Federation Oversight API proposal therefore needs a federation-bound authorization grant model.

Candidate correction:
1. Add nullable federation_id to user_role_assignments and access_denies.
2. Add a dedicated authorization scope ENUM, distinct from position organizational scope, with FEDERATION, DISTRICT, CHURCH and DEPARTMENT.
3. Define scope shape: FEDERATION requires federation_id only; DISTRICT requires district_id only; CHURCH requires district_id and church_id; DEPARTMENT requires district_id and department_id.
4. Add RESTRICT FKs and composite child/district FKs.
5. Define the read-only Federation Oversight role/permissions as federation-scoped grants. No operational write permission is inherited.
6. Ensure role accumulation does not widen scope and explicit DENY remains exact-scope and deny-overrides-allow.
7. Add the equivalent federation scope to access_denies so a federation oversight grant can be explicitly denied/revoked within its federation.

The existing position scope ENUM must remain DISTRICT, CHURCH and DEPARTMENT. Do not add FEDERATION to position scope: federation users do not appoint district leaders or administer district operations.

## 5. Candidate design consequences

If the project owner accepts the candidate closure:
- members gains district_id and a composite unique target key.
- church_memberships, member_category_assignments, department_memberships, event_registrations and event_attendance_subjects gain district_id where needed for composite ownership FKs.
- appointments gains a composite appointee/member-district FK using its existing district_id.
- user_role_assignments and access_denies gain federation_id and a dedicated authorization scope type.
- audit scope FKs become composite where both district and child scope are present.
- FK, index, CHECK, ENUM, traceability and inventory counts must all be regenerated.
- District ownership immutability for a member must be explicit while Church Transfer remains excluded.

These are candidate physical corrections, not yet applied to the canonical column/FK/index registers. The exact final column count and FK/index totals therefore remain provisional.

## 6. Verification requirements

1. Every child row that carries both a district and a church/department must have a composite FK proving the child belongs to that district.
2. Every member-owned record with a district-specific operational purpose must either carry district_id and use a composite FK or rely on a formally documented, independently verified ownership path.
3. Member district ownership must be explicit and immutable in v1 unless a separately approved scope change adds Church Transfer.
4. Federation role grants and denies must be bound to one federation, never global.
5. Federation oversight queries must filter by the authorized federation's district set before aggregation.
6. Every composite FK must have an exact ordered UNIQUE target key and source support index.
7. Application authorization must independently validate ownership and scope; database constraints do not replace authorization.
8. Negative tests must prove that cross-district child references cannot be committed and cross-district queries are denied.

## 7. Status

This is an open design blocker for final CPERD-03 certification. The initial static FK check proves column/key/index consistency, not semantic tenant isolation.

**Status: DRAFT 0.1 — NOT APPROVED.**
