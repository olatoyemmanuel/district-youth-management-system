# DYMS Phase 3 System Design Baseline

- Revision: SD-01
- Date: 2026-11-02
- Product: District Youth Management System (DYMS)
- Release: v1.0, Sango District
- Status: **SYSTEM DESIGN BASELINE; ODR-REC-01 PROJECT-OWNER APPROVED 2026-11-02; DELEGATED-AUTHORITY CONFIRMATION PENDING**
- Logical source: Approved conceptual ERD and DDD-001–DDD-015
- Physical source: Phase 2 Physical Database Design plus TBR-01, subject to final approval
- Implementation: **NOT AUTHORIZED**

## 1. Purpose

This document starts the system-level design using the approved DYMS scope, existing architecture baseline and technical blocker resolutions. It defines the proposed application structure, bounded contexts, request flow, integration boundaries, security controls and verification strategy.

It does not create source code, Prisma models, migrations, SQL, database objects, APIs or deployment resources. Policy-dependent features remain gated by the Owner Decision Register.

## 2. Product and architecture boundaries

### 2.1 Product boundary

DYMS v1.0 serves Seventh-day Adventist Youth Ministries at Sango District level. It manages members, local churches, ministry departments, leadership appointments, events, attendance, finance, credentials, reports, audit and controlled integrations.

The platform does not extend to Conference-wide administration in v1.0. Blockchain anchoring and public credential verification remain deferred.

### 2.2 Architectural style

Use a modular monolith with Domain-Driven Design and Clean Architecture boundaries.

Why:
- DYMS has strong transactional relationships across membership, appointments, attendance and finance.
- A modular monolith keeps deployment and operational complexity appropriate for the first district release.
- Module boundaries and ports allow later extraction of selected workloads if scale or ownership requires it.
- PostgreSQL remains the system of record. Redis/BullMQ schedules asynchronous work but does not own business truth.

Do not introduce microservices for v1.0.

## 3. Technology baseline

| Layer | Baseline |
|---|---|
| Runtime | Node.js 22 LTS line, TypeScript |
| Backend | NestJS, REST API, OpenAPI |
| Frontend | React 19, TypeScript, Vite |
| UI | Tailwind CSS; shared accessible component system |
| Client routing | React Router |
| Server state | TanStack Query |
| Local UI state | Zustand, limited to client-only state |
| Forms and validation | React Hook Form and Zod |
| Database | PostgreSQL, minimum design target 15 pending provider confirmation |
| Persistence mapping | Prisma ORM, with database constraints remaining authoritative |
| Cache and jobs | Redis and BullMQ |
| File storage | Private S3-compatible object storage |
| Authentication | Server-side sessions, rotating refresh credentials, Secure HttpOnly cookies and CSRF protection |
| API path | Same-origin HTTPS reverse proxy; frontend at root and API under `/api/v1` |
| Delivery | Docker-based deployment and GitHub Actions CI/CD, subject to deployment design |

The production PostgreSQL provider, region, managed-service features and operational topology remain open under ODR-ENV-001 and ODR-ENV-007. Do not select a provider in the codebase before that decision is recorded.

## 4. Bounded contexts and module ownership

| Bounded context | Responsibilities | Primary records |
|---|---|---|
| Identity & Access | Accounts, sessions, password reset, roles, permissions, explicit denies, authorization evaluation | UserAccount, AuthSession, Role, Permission, AccessDeny |
| Membership | Member profile, member category history, church membership and transfer workflow | Member, MemberCategoryAssignment, ChurchMembership, ChurchTransferRequest |
| Organization | District, churches, departments, typed organizational ownership | District, Church, Department |
| Leadership | Positions, appointments, appointment approval, appointment-derived grants | Position, Appointment, RoleAssignment |
| Department Membership | Member requests, coordinator decisions, membership history | DepartmentMembership |
| Events | Event ownership, approval, schedule, changes, sessions and registration | Event, EventApproval, EventChangeRecord, EventRegistration, EventSession |
| Attendance | Attendance subject, event/session mode, check-in, correction history | EventAttendanceSubject, AttendanceRecord, AttendanceCorrection |
| Finance | Accounts, budgets, transaction submission/approval, payments, posting and reversals | FinancialAccount, Budget, FinancialTransaction, Payment, TransactionReversal |
| Credentials | Versioned definitions, issuance, evidence references, renewal and revocation | CredentialDefinition, CredentialDefinitionVersion, CredentialIssuance |
| Reporting | Versioned definitions, scoped runs, protected exports and export audit | ReportDefinition, ReportRun, ReportExportAudit |
| Audit & Retention | Append-only audit, audited access, retention policies, holds and disposal evidence | AuditEvent, AuditAccessEvent, RetentionPolicy, RetentionSubject, RetentionHold, RetentionAction |
| Notifications & Integrations | Preferences, templates, outbox, delivery attempts, providers, webhooks and failures | Notification, NotificationDelivery, OutboxMessage, IntegrationProvider, WebhookEvent |

Each module owns its domain rules and application use cases. Other modules interact through public application interfaces or domain events, not by writing directly to another module's tables.

The exact aggregate boundaries remain subject to the final approved ERD. The table above is the proposed module ownership map, not a substitute for that ERD.

## 5. Backend module structure

Use the following module layout as the target design:

```text
backend/
  src/
    main.ts
    app.module.ts
    shared/
      application/
      domain/
      infrastructure/
      presentation/
    modules/
      identity-access/
        domain/
        application/
        infrastructure/
        presentation/
      membership/
      organization/
      leadership/
      department-membership/
      events/
      attendance/
      finance/
      credentials/
      reporting/
      audit-retention/
      notifications-integrations/
    platform/
      database/
      cache/
      queue/
      storage/
      observability/
      security/
  test/
    unit/
    integration/
    contract/
    e2e/
```

Each module follows four layers:

1. Domain: entities, value objects, domain services, domain events and invariants. No NestJS, Prisma, Redis or HTTP dependencies.
2. Application: commands, queries, use cases, ports, authorization requirements and transaction boundaries.
3. Infrastructure: Prisma repositories, database transaction adapters, Redis/BullMQ adapters, storage adapters and provider clients.
4. Presentation: NestJS controllers, request DTOs, validation, authentication guards, authorization guards and response mapping.

Avoid a generic CRUD service for aggregates with lifecycle, approval, money, identity or audit rules. Mutations must be expressed as named use cases.

## 6. Frontend module structure

The React application mirrors business capabilities without duplicating domain authority.

```text
frontend/
  src/
    app/
      router/
      providers/
      layouts/
    features/
      auth/
      members/
      organization/
      leadership/
      departments/
      events/
      attendance/
      finance/
      credentials/
      reports/
      audit/
      notifications/
    shared/
      api/
      components/
      forms/
      hooks/
      permissions/
      validation/
      types/
```

Frontend rules:
- TanStack Query owns server-state caching and invalidation.
- Zustand stores only transient client UI state, not authoritative permissions, sessions, finance state or member lifecycle.
- React Hook Form and Zod validate user input for usability. Backend/domain validation remains authoritative.
- Route guards improve navigation but do not replace server authorization.
- Do not persist access tokens or refresh tokens in localStorage/sessionStorage.
- Sensitive exports and evidence use authorized server-issued references, never public object URLs.

## 7. API design

### 7.1 API conventions

- Prefix: `/api/v1`.
- JSON request/response contract with stable error envelope.
- OpenAPI is generated from approved controller DTOs and documented use cases.
- UUIDs are public resource identifiers; database internals remain private.
- Use cursor pagination for high-volume history/audit endpoints; bounded page pagination for smaller catalogues.
- Validate every request at the boundary and revalidate authorization in the application layer.
- Apply rate limiting to public and authenticated APIs.
- Use idempotency keys for approved sensitive mutation endpoints according to AUTH-IDEM-001–041.
- Do not expose internal SQL errors, secrets, token state or account-existence signals.

### 7.2 Proposed API groups

| Group | Example route prefix | Scope |
|---|---|---|
| Authentication | `/auth` | Login, logout, refresh, reset, session |
| Members | `/members` | Member records and category history |
| Organization | `/district`, `/churches`, `/departments` | Organizational catalogue |
| Leadership | `/positions`, `/appointments` | Appointment requests and history |
| Department membership | `/department-memberships` | Requests and coordinator decisions |
| Events | `/events` | Events, approvals, sessions and registrations |
| Attendance | `/attendance` | Check-in, attendance and corrections |
| Finance | `/finance/accounts`, `/finance/transactions`, `/finance/budgets` | Finance workflows |
| Credentials | `/credentials/definitions`, `/credentials/issuances` | Versioned catalogue and issuance |
| Reporting | `/reports/definitions`, `/reports/runs`, `/reports/exports` | Scoped reports and exports |
| Audit | `/audit/events`, `/audit/access` | Restricted, audited access |
| Notifications | `/notifications` | Preferences and delivery status |

These are route-group proposals. Exact request/response contracts are a later design artifact and must follow the approved requirements and physical model.

## 8. Authentication and authorization flow

### 8.1 Authentication

Preserve DFR-001 and DFR-004:
- Argon2id password hashing.
- Short-lived access credential with 15-minute lifetime.
- Rotating refresh credentials and server-side sessions.
- Secure, HttpOnly cookies over HTTPS.
- CSRF protection for cookie-authenticated state-changing requests.
- CORS allowlist.
- Brute-force protection and rate limiting.
- Refresh-token reuse detection.
- Single-use password-reset tokens with 30-minute expiry.
- Seven-day inactivity timeout and 30-day absolute session lifetime.
- Revoke sessions on password reset and detected refresh-token reuse according to the approved auth contract.

### 8.2 Authorization

Authorization is server-side and deny-by-default.

Evaluation sequence:
1. Authenticate the account and resolve the current server-side session.
2. Resolve current member and organizational context.
3. Load active role grants derived from approved appointments or separately authorized operational roles.
4. Resolve permission and resource scope.
5. Apply explicit DENY precedence over applicable ALLOW.
6. Reject ambiguous or mismatched scope.
7. Record sensitive decision outcomes in audit evidence.

Role accumulation never widens scope. Department membership does not grant leadership permissions. Expired or terminated appointments cannot grant appointment-derived permissions.

## 9. Cross-module transaction and event flow

### 9.1 Synchronous domain mutation

1. HTTP controller validates shape and authentication.
2. Application use case rechecks authorization and current domain state.
3. Database transaction locks the relevant aggregate/parent rows in documented order.
4. Domain invariants and database constraints are enforced.
5. Business records, audit evidence and outbox event are committed atomically where the approved design requires them.
6. API returns a stable result and correlation identifier.

### 9.2 Asynchronous work

- PostgreSQL outbox is the durable source of pending events.
- BullMQ/Redis schedules and distributes worker execution.
- Workers claim outbox records with leases and idempotent processing.
- Provider callbacks are authenticated and deduplicated.
- Notification/payment provider failure does not reverse a committed business action.
- Retry exhaustion creates an observable failure requiring authorized review.
- Redis loss must not lose business state or durable outbox work.

## 10. Security and operational controls

- Rate limit public and authenticated APIs.
- Centralized request correlation and structured logs.
- Never log passwords, access/refresh/reset tokens, cookies, provider secrets or raw protected evidence.
- Keep provider secrets in managed secret configuration.
- Private object storage with opaque references and server-side authorization.
- Audit is append-only for runtime roles; audit access is separately permissioned and itself audited.
- Database runtime roles do not own tables or have unrestricted DDL.
- Use parameterized queries through the persistence adapter.
- Apply request size limits, file type/size validation, malware scanning where supported, and private evidence access.
- Apply security headers, TLS, CSRF, CORS and session controls.
- Maintain daily encrypted backups, RPO <=24 hours, RTO <=8 hours, scheduled restore tests, failure monitoring and documented recovery under DFR-005.

## 11. Testing strategy

| Test level | Required coverage |
|---|---|
| Domain unit | Category rules, membership transfer, appointment lifecycle, role/deny precedence, event rules, finance invariants |
| Application unit | Use-case authorization, transaction boundaries, actor separation, error mapping |
| Database integration | FKs, composite scope, CHECKs, unique indexes, triggers, transaction rollback |
| Concurrency | Appointment overlap, attendance duplicates, event capacity, refresh rotation, idempotency claims, finance posting/reversal |
| Security | Authentication abuse, CSRF, CORS, rate limits, token replay, privilege escalation, scope confusion, export access |
| Contract | OpenAPI request/response and provider callback contracts |
| End-to-end | Member onboarding, appointment approval, event creation, attendance, finance approval, credential issue, report export |
| Operational | Backup restore, queue recovery, outbox replay, secret rotation, alerting and deployment rollback |

No concurrency or PostgreSQL DDL test is claimed as passed until run against an authorized test database.

## 12. Owner-approved v1 defaults and policy-gated features

The project owner approved ODR-REC-01 as proposed on 2026-11-02. The following v1 defaults are therefore the accepted project design baseline, subject to confirmation by the delegated authorities named in the canonical ODR register. Features that exceed these defaults remain disabled until the relevant authority decisions are recorded:
- member eligibility and category progression (ODR-001);
- transfer cancellation, rejection, appeal, backdating and pending-request cardinality (ODR-002);
- acting appointments and exceptional appointment transitions (ODR-003);
- department instances are district-owned; events have one district or local-church owner; departments may organize but do not own events in v1. Additional owner types and cross-scope roles remain disabled pending district governance confirmation (ODR-004);
- finance uses the owner-approved conservative workflow defaults; partial payments, multiple successful payments per transaction, FX, refunds, budget exceptions and amount-based approval thresholds remain disabled pending finance authority confirmation (ODR-005);
- attendance follows the owner-approved EVENT or SESSION subject-mode proposal and requires registration or a documented authorized exception; self-check-in and offline capture remain disabled pending attendance authority confirmation (ODR-006);
- department eligibility, renewal and appeal (ODR-007);
- only confirmed registrations consume capacity; waitlists are disabled; late registration and capacity overrides require recorded event-authority approval (ODR-008);
- credential issuance until official issuer/evidence rules are mapped (ODR-009);
- audit access is separated from system administration; temporary investigation and break-glass access remain disabled pending governance/security authority approval (ODR-010);
- automated permanent deletion remains disabled until approved record-class schedules, holds and disposal authority are supplied (ODR-011);
- in-app notifications are the baseline; email requires verified addresses and approved templates; SMS/WhatsApp remain disabled until consent and provider decisions are approved (ODR-012);
- report requirements REPORT-001–REPORT-010 are included in the 107-ID testable baseline; report catalogue, classification, disclosure matrix and export permissions remain pending delegated data/security authority confirmation (ODR-013).

## 13. Design sequence

1. Owner reviews TBR-01 and ODR-REC-01.
2. Independent review reconciles D13-PDR-01 and PostgreSQL-specific integrity mechanisms.
3. Complete canonical physical column, FK, CHECK and index registers from the accepted decisions.
4. Obtain explicit owner approval of the final physical design and consolidated ERD.
5. Record a separate explicit implementation authorization.
6. Only then begin Prisma schema, migrations, backend modules, frontend features and integration work.

DFR-001–DFR-006 remain preserved. The conflicting DFR-006 repository statements must be reconciled through a dated owner governance record before any implementation gate is reconsidered.

**Current gate:** System design may proceed. Physical design approval and implementation authorization remain outstanding.


## 14. Project-owner approval update (2026-11-02)

ODR-REC-01 was approved as proposed by the project owner on 2026-11-02. The v1 defaults described in §12 are the accepted project-design baseline. The canonical ODR register records the approval and identifies each delegated authority whose confirmation remains pending.

The reporting requirements are now part of the canonical 107-ID testable requirements catalogue. This does not approve a specific report catalogue, classification matrix or disclosure policy.

This approval does not approve the final physical ERD or authorize implementation. DFR-001–DFR-006 remain preserved; the DFR-006 repository discrepancy must still be reconciled through a dated governance record. No Prisma schema, migration, SQL DDL, database object, seed, API or application code is authorized.


## 15. Detailed Phase 3 design artifacts (2026-11-02)

The following companion documents expand this system design baseline:

1. `PHASE-3-BOUNDED-CONTEXT-MAP.md` — context ownership, aggregate candidates, dependencies, integration contracts and domain events.
2. `PHASE-3-MODULE-INTERACTION-DESIGN.md` — module dependencies, transaction boundaries, key workflow sequences, outbox/worker behavior, concurrency and failure handling.
3. `PHASE-3-AUTHENTICATION-AUTHORIZATION-DESIGN.md` — DFR-001/004 authentication controls, session flows, permission evaluation, scope, deny precedence, separation of duties, rate limiting and audit.
4. `PHASE-3-API-CONTRACT-DESIGN.md` — complete proposed v1 route catalogue, response envelopes, error codes, authorization expectations, pagination and idempotency boundaries.
5. `PHASE-3-FINAL-PHYSICAL-ERD-RECONCILIATION-PLAN.md` — source hierarchy, physical design workstreams, known blockers, traceability requirements and approval gates.

These artifacts are design proposals. The route catalogue is not a final OpenAPI contract, aggregate candidates are not final physical aggregates, and the ERD reconciliation plan does not approve physical schema. They preserve all existing policy and implementation gates.

**Milestone status:** Detailed architecture artifacts created on the working branch. They require review and reconciliation. Final physical ERD approval remains NOT GRANTED. Implementation remains NOT AUTHORIZED.


## 16. Consolidated physical ERD reconciliation package (2026-11-02)

The Phase 3 physical-design candidate has been assembled. The master artifact is [PHASE-3-CONSOLIDATED-PHYSICAL-ERD.md](./PHASE-3-CONSOLIDATED-PHYSICAL-ERD.md). Its supporting canonical registers are:

- [PHASE-3-CANONICAL-PHYSICAL-COLUMN-REGISTER.md](./PHASE-3-CANONICAL-PHYSICAL-COLUMN-REGISTER.md): 70 tables and 679 column declarations.
- [PHASE-3-CANONICAL-FOREIGN-KEY-REGISTER.md](./PHASE-3-CANONICAL-FOREIGN-KEY-REGISTER.md): 166 named FK candidates.
- [PHASE-3-CANONICAL-INDEX-INVENTORY.md](./PHASE-3-CANONICAL-INDEX-INVENTORY.md): 228 distinct named index candidates.
- [PHASE-3-PHYSICAL-INTEGRITY-AND-TRIGGER-REGISTER.md](./PHASE-3-PHYSICAL-INTEGRITY-AND-TRIGGER-REGISTER.md): structural CHECKs, trigger/transaction boundaries and concurrency tests.
- [PHASE-3-REQUIREMENT-TO-PHYSICAL-TRACEABILITY.md](./PHASE-3-REQUIREMENT-TO-PHYSICAL-TRACEABILITY.md): all 107 requirement IDs mapped.
- [PHASE-3-DDD-013-PHYSICAL-SLICE-REVIEW.md](./PHASE-3-DDD-013-PHYSICAL-SLICE-REVIEW.md): internal engineering review of all ten DDD-013 review questions.

This package is a consolidated candidate for project-owner review, not an approved physical schema. Five physical entities and two removed ownership columns are explicitly identified as conceptual-to-physical amendments. External DDD-013 review, delegated authority confirmations, DFR-006 governance clarification and final project-owner approval remain outstanding. Implementation remains NOT AUTHORIZED.
