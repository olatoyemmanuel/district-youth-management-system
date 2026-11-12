# DYMS Phase 3 — CPERD-03 API Contract and Scope Reconciliation

- Revision: API-CPERD-03 Draft 0.1
- Date: 2026-11-12
- Sources: CPERD-02 API Contract Design, CPERD-11 status reconciliation, DFR/DDD/ODR decisions, IDX-R02, CPERD-03 physical registers and 107-ID traceability
- Status: **SUCCESSOR API SCOPE PROPOSAL; REQUEST/RESPONSE CONTRACT REVIEW OPEN**
- Implementation authorization: **GRANTED CONDITIONALLY; NOT EXERCISABLE BEFORE FINAL CPERD-03 APPROVAL**

## 1. Purpose and authority

This document reconciles the CPERD-02 route catalogue against the current DYMS 1.0 scope. It is a successor scope and contract proposal, not an approved OpenAPI specification. It does not modify the historical CPERD-02 API artifact.

The project owner is the final decision-maker for DYMS product scope and workflow. The current Federation oversight rule is read-only: federation-authorized users may view cross-district reports and monitor activity within their federation, but cannot perform district or local-church operational administration.

## 2. Route scope disposition

The CPERD-02 route catalogue contains 151 endpoint rows and 128 distinct route path strings. Its current route proposal includes capabilities later excluded or deferred from DYMS 1.0.

| Route family | CPERD-02 route templates | CPERD-03 disposition |
|---|---:|---|
| Authentication and sessions | 11 | INCLUDED |
| Member profile, category and membership history | Included | INCLUDED, except transfer commands |
| Church Transfer | 8 distinct path strings, including repeated command variants | EXCLUDED FROM DYMS 1.0 |
| Organization, departments, positions and appointments | Included | INCLUDED |
| Department Membership | Included | INCLUDED |
| Events, sessions and registration | Included | INCLUDED |
| Attendance and corrections | Included | INCLUDED |
| Finance, budgets, transactions, payments and reversals | 16 | DEFERRED FROM DYMS 1.0 |
| Credential definitions, versions, evidence and issuance | 9 | DEFERRED FROM DYMS 1.0 |
| Reporting, audit, retention and notifications | Included | INCLUDED WITH THE LIMITS IN §§4–6 |
| Integrations and operations | Included | INCLUDED ONLY FOR ACTIVE NON-FINANCE PROVIDERS AND APPROVED OPERATIONAL PURPOSES |

The source route rows for Church Transfer, finance and credentials must not be carried forward as active endpoints, permissions, schemas, error contracts, idempotency operations, reports or test requirements.

## 3. Included API bounded contexts

| Context | Included API responsibilities | Required authorization boundary |
|---|---|---|
| Identity & Access | Login, refresh, logout, sessions, password reset/change, CSRF, current actor | DFR-001 and DFR-004; own-account/session scope; rate limiting |
| Membership | Member provisioning/profile, category assignment/history, current church membership/history | Individual account per member; member district derived from the authorized administrator's scope; scoped membership authority; no transfer workflow |
| Organization | District, church and district-owned department catalogues | District-owned administration; federation users are read-only |
| Leadership | Position catalogue, appointment submission, approval, rejection, termination, renewal | Higher-authority approval; no self-approval; scope-bound appointment authority |
| Department Membership | Request, read, approve, withdraw, reasoned termination | Member/self or designated department coordinator |
| Events | Draft, approval, publication, material change, cancellation, sessions, registration | District/church event owner scope; departments organize but do not own events |
| Attendance | Subject setup, attendance capture, correction request/approval/application | Authorized event/attendance scope; immutable history and actor attribution |
| Reporting | District/church/department report definitions, runs and protected exports | ODR-013; server-derived scope; reauthorization at request/execution/retrieval |
| Audit & Retention | Audit search/access request, approved holds and retention control | Separate audit/records permissions; no destructive disposal without approved schedule and source enrollment |
| Notifications & Integrations | Preferences, notifications, delivery status, verified webhooks, outbox/integration operations | Own-recipient access; provider signature/replay validation; no business-truth mutation |

## 4. Church Transfer, finance and credentials are not active API domains

### 4.1 Church Transfer

Remove all routes under `/church-transfers`, including initiation, receiving-church decision, district decision, cancellation, list and detail routes. Current church membership remains supported under IDX-R02. A church transfer command must not be simulated by direct membership edits or a generic status patch.

### 4.2 Finance and payments

Remove all routes under `/finance`, including accounts, budgets, transactions, approval, rejection, payment, posting, reversal and reconciliation commands. Do not expose payment confirmation webhooks or finance reports in DYMS 1.0. Generic integration endpoints must reject/de-register finance/payment providers while finance remains deferred.

### 4.3 Credential definitions and issuance

Remove all routes under `/credentials`, including definition/version management, evidence attachment, verification, issuance and revocation. Master Guide remains a domain classification distinct from membership category. This does not activate credential issuance, evidence storage or verification.

## 5. Federation read-only oversight API

Federation oversight is a distinct read-only query surface. It is not a global operational administration role and does not widen district operational authorization.

Candidate GET-only routes:

| Method and route | Purpose | Authorization and data boundary |
|---|---|---|
| GET `/federation/oversight` | Federation-level operational overview and aggregated activity indicators | Authenticated federation-authorized user; server derives one federation scope |
| GET `/federation/oversight/districts` | List districts in the authorized federation with high-level status/activity summaries | Federation read-only permission; only districts linked to that federation |
| GET `/federation/oversight/reports/{reportCode}` | Read a predefined cross-district aggregate report | Approved report code; federation scope; aggregate-only disclosure; no member-level evidence |

Rules:
1. Every query derives the federation and district set from server-side authorization and Organization ownership. Client-supplied district lists are not trusted.
2. Results include only districts belonging to the authenticated user's authorized federation.
3. Default output is aggregate activity and operational summaries. No member-level personal records, attendance rows, credential evidence, audit event detail or sensitive investigation content is exposed.
4. Federation users cannot create, edit, delete, approve, appoint, transfer, administer members, manage events, capture attendance, approve finances, change permissions or perform local-church administration.
5. These endpoints are GET-only. They do not create report runs or exports. They return bounded read-only query results.
6. Federation oversight queries are separate from `report_runs`. The persisted report-run scope remains district, church or department; federation oversight is a read-only aggregate query contract and does not introduce GLOBAL report scope.
7. Each response is rate-limited, audited where sensitive, and filtered by federation ownership before aggregation.
8. Federation oversight permission must be assigned at one explicit federation scope. The current user-role grant/deny candidate lacks federation scope, so the API remains blocked until the proposed authorization_scope_type and federation_id correction is reconciled into the physical registers.
9. The authority permitted to issue/revoke federation oversight grants is not inferred here. It must be defined by the owner-approved governance/appointment authority model; federation users cannot grant or approve their own oversight role.

## 6. Reporting, audit and retention limits

- Standard report runs remain district-, church- or department-scoped. Scope is derived server-side; GLOBAL scope remains prohibited.
- Finance, payment, budget, Church Transfer and credential issuance/evidence report definitions are excluded/deferred.
- Federation oversight uses only the separate GET-only aggregate query surface in §5. It does not grant report-run creation, CSV/PDF export or access to underlying district records.
- Audit search and export remain restricted to explicit Audit Officer/approved permissions. Federation oversight does not imply audit-read permission.
- Retention holds and approved schedule reads remain subject to the records authority model. Retention action execution stays disabled until an approved schedule and source enrollment exist.
- Notification and integration routes must not expose payment-confirmation flows while finance is deferred.

## 7. Mutation contract

1. Use named command endpoints for approval, rejection, termination, renewal, publication, material change, attendance correction and other audited transitions.
2. Do not expose generic status PATCH endpoints.
3. Every mutation requires server-side authorization, resource ownership and exact scope validation.
4. Sensitive mutations require idempotency or a documented deduplication strategy.
5. Apply rate limiting to public, authenticated and abuse-prone routes. Rate limiting is mandatory.
6. Use the DFR-001 authentication/session protections and DFR-004 lifetimes.
7. Federation-authorized identities are denied all operational mutation routes, even if a district or church role is also presented; the federation oversight permission itself never grants operational authority.
8. Do not accept client-supplied created_at, updated_at, occurred_at, recorded_at, issued_at, approved_at, revoked_at or other trusted system/audit timestamps. The owning server, worker or database generates them. Local event/session schedules are submitted with an IANA timezone and converted to exact UTC instants.
9. Member provisioning derives district_id from the authenticated membership administrator's authorized district scope. A client-supplied district_id must not select another district.

## 8. Contract closure requirements

Before API design is approved:
1. Reconcile every included route to the 107-ID requirement register.
2. Define request/response schemas, field validation, pagination, error codes and idempotency for each mutation.
3. Map each route to a bounded context, command/query, aggregate and permission.
4. Confirm the exact lifecycle transition and persisted ENUM for each command.
5. Remove all Church Transfer, finance/payment/budget and credential definition/issuance/evidence routes from the active v1 API.
6. Confirm the Federation GET-only surface and aggregate data classification against the approved owner decision.
7. Reconcile webhook/provider routes to non-finance integrations only.
8. Reconcile report definitions, data owners, redaction, exports and retention dependencies.
9. Verify OpenAPI completeness after the design is approved.

## 9. Status and implementation boundary

This is a documentation-only scope reconciliation. It does not approve endpoint schemas or authorize controllers, generated clients, OpenAPI code generation, Prisma models, SQL DDL, migrations, application code or tests.

The project owner has granted implementation authorization conditionally. It cannot be exercised until the exact final CPERD-03 physical ERD artifacts are approved.

**Status: DRAFT 0.1 — NOT APPROVED.**
