# DYMS CPERD-07 — Database Security and Least-Privilege Role Architecture

- Revision: CPERD-07
- Date: 2026-11-11
- Repository: olatoyemmanuel/district-youth-management-system
- Branch: phase-1/requirements-consolidation
- Status: **DESIGN RECONCILIATION COMPLETE; OWNER/ENVIRONMENT CONFIRMATIONS REQUIRED**
- Implementation: **NOT AUTHORIZED**

## 1. Purpose and authority

This document refines TBR-07 and the CPERD-06 requirement for a least-privilege database role and grant matrix. It defines role boundaries, intended capabilities, prohibited privileges, audit-write protections, reporting isolation, migration ownership, and backup/restore separation.

This is a design-only artifact. It creates no PostgreSQL roles, grants, schemas, functions, triggers, SQL DDL, Prisma models, migrations, database state, application code, or deployment resources.

Authority order remains DFR-001–DFR-006, formal owner governance records, explicit owner decisions, approved DDD decisions, the canonical Owner Decision Register, the approved requirements baseline, and the physical-design registers. This document does not amend the CPERD-01 master ERD or silently approve unresolved delegated authority.

## 2. Governing security constraints

1. PostgreSQL 15 is the minimum design target recorded in TBR-01. Production provider, exact major/minor version, managed-service restrictions, topology and operational evidence remain deployment confirmations under ODR-ENV-001/006/007.
2. DFR-001/004 authentication controls remain unchanged: Argon2id, short-lived access credentials, rotating refresh credentials, server-side sessions, Secure HttpOnly cookies, CSRF and origin controls, rate limiting, brute-force protection, refresh reuse detection, and single-use expiring reset tokens.
3. Database roles are not DYMS user roles, application permissions, appointments, or service_principals. They are technical database identities attached to connections or controlled execution paths.
4. No application-facing database login is a superuser, database owner, schema owner, role administrator, or unrestricted DDL principal.
5. Runtime application and worker identities do not own tables and receive no TRUNCATE, CREATE, ALTER, DROP, ownership transfer, role management, or unrestricted audit-evidence mutation.
6. Business authorization remains in the application authorization layer. Database grants are a second, coarse technical boundary and do not replace actor, scope, separation-of-duties, or lifecycle checks.
7. No row-level security (RLS) policy is selected by this document. RLS requires a separate connection-pooling, actor-context, bypass, migration and test design review.
8. No retention schedule is inferred. Unknown/unapproved business-record retention schedules disable automated permanent deletion. DFR-005 backup retention is separate from business-record retention.

## 3. Proposed role catalogue

The following names are logical role identifiers for design discussion, not approved SQL identifiers or created database objects. Exact names and role attributes must be confirmed against the target provider.

| Logical role | Login | Purpose | Ownership / inheritance |
|---|---|---|---|
| `dyms_object_owner` | NOLOGIN | Owns application schemas, tables, sequences and approved database functions | Dedicated non-login owner. No application service connects as this role. |
| `dyms_migrator` | LOGIN, tightly controlled | Executes reviewed, version-controlled schema migrations and controlled object changes | Membership in object-owner role only through an explicit, audited deployment procedure. Credentials unavailable to runtime services. |
| `dyms_runtime` | LOGIN | Serves synchronous API requests using the minimum required application DML and approved function execution | No ownership or role-management membership. No inherited broad administrator role. |
| `dyms_worker` | LOGIN | Processes durable outbox work, delivery attempts, webhook processing and approved recovery tasks | Separate credential and pool from API runtime. Permissions limited to worker-owned operational tables and approved functions. |
| `dyms_reporting` | LOGIN | Executes approved read-only reporting contracts | SELECT only on explicitly approved views/read models; no source-table writes, DDL, temp-object privilege unless separately justified. |
| `dyms_audit_reader` | LOGIN, controlled | Supports separately authorized audit investigation and audit review | Read access only to explicitly approved audit views/tables. No write, ownership, DDL or retention-disposal authority. |
| `dyms_backup_operator` | LOGIN or provider-managed identity | Performs approved backup, verification and restore operations | Restricted operational identity, separate from application credentials. Exact provider-specific privileges remain unselected. |
| `dyms_audit_writer` | NOLOGIN or controlled function owner | Narrowly scoped append path for audit facts where direct table INSERT is not acceptable | Only the approved append function/path may execute with this identity. Not a general-purpose login. |

### 3.1 Membership and connection rules

- Role inheritance is denied by default. Any membership must be explicit, minimal, time-bounded where supported, and reviewed.
- `dyms_runtime`, `dyms_worker`, `dyms_reporting`, `dyms_audit_reader` and `dyms_backup_operator` must not be members of `dyms_migrator` or `dyms_object_owner`.
- The migration identity is not used by application processes, workers, health checks, reporting jobs or interactive administration.
- Human operator access uses individually attributable identities and the provider's approved privileged-access mechanism. Shared human credentials are prohibited.
- Application connection pools use their own service role. A pooled database session must not be treated as proof of the end-user's identity or organizational scope.
- DYMS actor identity, request correlation and authorization outcome are supplied through trusted application context and recorded in audit evidence. A client-supplied actor ID is never trusted.
- Passwords, connection strings, TLS keys and backup encryption keys are held in the approved secret-management boundary, not in source control, audit payloads, outbox payloads or ordinary database rows.

## 4. Privilege boundary matrix

This matrix states intended capability classes. It deliberately does not issue table-by-table SQL grants because the target provider, final trigger/function inventory, approved read contracts and operational procedures are not yet certified.

| Capability | Object owner | Migrator | Runtime | Worker | Reporting | Audit reader | Backup operator | Audit writer |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Own application objects | Yes | Via controlled migration only | No | No | No | No | No | No |
| CREATE/ALTER/DROP schema objects | Owner only | Controlled migration | No | No | No | No | No | No |
| Ordinary business-table SELECT | No automatic service access | As required for migration | Allowlisted | Allowlisted worker rows only | Approved views only | No | No by default | No |
| Ordinary business-table INSERT/UPDATE | No service use | Migration only | Allowlisted workflow writes | Worker-owned state transitions only | No | No | No | No |
| Ordinary business-table DELETE | No service use | Migration only | No general delete; specific approved workflow only if design explicitly requires | No general delete | No | No | No | No |
| Audit event append | No general service use | Schema maintenance only | Through approved append path | Through approved append path | No | No | No | Yes, narrow path |
| Audit event UPDATE/DELETE/TRUNCATE | No routine use | Controlled schema maintenance only | No | No | No | No | No | No |
| Audit event read | No automatic right | No automatic right | No | No | Only approved aggregate/read model | Explicitly approved scope | No | No |
| Outbox claim/lease/attempt updates | No | Migration only | Insert required outbox event only | Narrow claim/lease/complete/retry path | No | No | No | No |
| Reporting source mutation | No | Migration only | Domain-owned writes only | Specific operational writes only | Never | Never | No | No |
| Backup/restore | No | No | No | No | No | No | Approved procedure only | No |
| Role administration / superuser | Provider break-glass only | No | No | No | No | No | No | No |

A role's absence of permission in this matrix means deny. Any exception requires a documented purpose, owner, scope, duration, risk assessment and approval. A successful application authorization decision does not justify granting the database connection broad table privileges.

## 5. Data-domain access boundaries

### 5.1 Synchronous runtime

Runtime access is limited to the domain operations required by the API. The owning bounded context remains responsible for its aggregate writes. Cross-context reads use approved contracts; one context does not write another context's aggregate through direct ORM access.

The runtime role must not receive broad write access to:
- `audit_events`, `audit_access_events`, `idempotency_recovery_events` or other append-only evidence;
- `transaction_revisions`, `transaction_approvals`, `transaction_reversals`, `attendance_corrections`, `event_approvals`, `event_change_records` and other historical decision/evidence records, except narrowly defined INSERT paths;
- `retention_actions` or other disposal-control records;
- outbox delivery state owned by the worker.

Specific append/insert operations must be authorized by the application and, where required, exposed through narrow database functions or narrowly granted INSERT privileges. No general UPDATE/DELETE privilege is implied by the existence of a table.

### 5.2 Background worker

The worker role is isolated from the API runtime role. Its intended work is restricted to:
- claim and lease eligible `outbox_messages`;
- record bounded delivery attempts in `notification_deliveries`;
- process approved `webhook_events` and record `integration_failures`;
- update only the worker-owned processing/lease/retry fields defined by the final column and transition contract;
- invoke approved idempotent recovery/fencing paths when the final DDD-013 contract permits them.

The worker must not:
- approve or post finance transactions;
- create or approve appointments, membership transfers, credentials or attendance corrections;
- change user roles or permissions;
- read or export audit history;
- alter business records merely because an external provider reports success;
- bypass authorization, lifecycle, fencing, idempotency or audit controls.

External provider calls occur outside the business database transaction. Durable outbox rows remain the source of dispatch truth. Queue loss must be recoverable from PostgreSQL.

### 5.3 Reporting

The reporting role is read-only. It receives no INSERT, UPDATE, DELETE, TRUNCATE, DDL or ownership privileges.

- Reporting queries must use approved report definitions and read contracts/read models.
- Every report is constrained to the authenticated user's authorized district, church or department scope.
- Authorization is rechecked at request, execution and export retrieval.
- Federation oversight, where present, remains application-level read-only oversight and does not create database write capability.
- A generic shared reporting login does not enforce row-level scope by itself. Until RLS or isolated per-scope credentials are separately approved, the application/report execution service must enforce scope using trusted actor context and parameterized, server-controlled query plans.
- Report catalogue, classification, disclosure matrix and export permissions remain subject to ODR-013 delegated data/security authority confirmation.
- No global or cross-district report access is introduced.

### 5.4 Audit reader and audit writer

DDD-012 establishes append-only audit evidence, protected audit access, actor types USER/SYSTEM/SERVICE/ANONYMOUS, and no secrets in logs.

- System administration does not automatically grant audit-read access.
- Audit Officer access is distinct from System Administrator access.
- Audit read and export are separately permissioned and themselves audited through `audit_access_events`.
- Runtime and worker roles receive no UPDATE, DELETE or TRUNCATE on audit tables.
- Audit writes must be append-only. Preferred design is a narrow append function or dedicated writer capability with fixed object references, strict input validation, a pinned search path, no caller-controlled dynamic SQL, and EXECUTE granted only to approved callers.
- If direct INSERT is selected instead, the exact column-level/table-level grant, actor provenance validation and trigger/constraint defense must be specified. Direct INSERT must not grant UPDATE/DELETE/TRUNCATE.
- A SECURITY DEFINER function is not approved merely by being proposed. Its owner, search_path, EXECUTE grants, object qualification, input validation, error behavior and privilege-escalation tests require independent review.
- Audit investigation, exceptional access and break-glass remain disabled pending ODR-010 authority decisions. No generic audit-reader grant is presumed.

### 5.5 Migration and object ownership

- All application objects are owned by a non-login object-owner role, not by runtime, worker, reporting or human application users.
- Migration execution is performed by a dedicated identity in a controlled release/deployment workflow.
- Migration credentials are not present in production application containers or worker environments.
- Migrations are reviewed, version-controlled, applied in a controlled sequence, and separately audited.
- Runtime roles receive no CREATE on application schemas and no ability to alter triggers, constraints, indexes, functions, grants or ownership.
- Default privileges must be explicitly configured so newly created objects do not accidentally become accessible to all roles.
- Public-schema CREATE and unnecessary temporary-object privileges are revoked where compatible with the confirmed provider and application behavior.
- Migration rollback is not an excuse to rewrite immutable business history. Schema rollback and business compensation are separate procedures.

### 5.6 Backup and restore

DFR-005 remains unchanged:
- automated daily database backups;
- encrypted and access-restricted backups;
- RPO no greater than 24 hours;
- critical service RTO within 8 hours;
- scheduled restore tests;
- backup failure monitoring/alerting;
- documented disaster-recovery procedure.

The backup identity is separate from application and migration identities. Backup access is restricted to the approved backup/restore workflow and protected by separate credentials and encryption-key controls.

The exact privilege mechanism depends on the selected PostgreSQL provider and backup method. Do not assume that a generic SQL role alone is sufficient for managed-service snapshots, WAL archiving, point-in-time recovery or restore operations. The provider must confirm required privileges, retention, encryption, key custody, immutable-copy options, restore isolation and evidence of RPO/RTO tests.

Backup retention is not a business-record retention schedule. Restoring a backup must not silently re-enable a revoked user, stale credential, completed payment or expired session without the documented recovery/reconciliation process.

## 6. Append-only and controlled-mutation classification

The following records are treated as append-only evidence or controlled history at the application and database privilege boundary:

- `audit_events`
- `audit_access_events`
- `idempotency_recovery_events`
- `transaction_approvals`
- `transaction_revisions` after the associated posting/immutability boundary
- `transaction_reversals`
- `attendance_corrections`
- `event_approvals`
- `event_change_records`
- `retention_actions`
- `report_export_audits)
- `notification_deliveries` as attempt history, subject to the final correction/retention policy

This list is a security classification proposal for privilege design, not a blanket declaration that every listed table has identical lifecycle rules. The final integrity/trigger register must specify whether each table permits INSERT only, INSERT plus narrowly scoped status progression, or controlled archival/disposal after an approved retention action.

For truly append-only evidence, runtime and worker roles receive INSERT only through an approved path and no UPDATE, DELETE or TRUNCATE. Any retention disposal must use a separately authorized, audited process after the schedule and hold checks are approved. No application role receives a generic delete capability.

## 7. Trigger and function privilege safety

The CPERD-06 trigger/transaction register remains authoritative for the proposed business invariants. CPERD-07 adds these privilege requirements:

1. Trigger functions must not be executable as arbitrary application entry points unless explicitly required.
2. SECURITY DEFINER functions require a dedicated non-login owner, pinned safe search_path, schema-qualified object references, no dynamic SQL from untrusted values, narrow EXECUTE grants and security review.
3. SECURITY INVOKER is preferred where it preserves required behavior and least privilege.
4. Trigger execution must not create a privilege-escalation route through caller-controlled object names, temporary schemas, unsafe search_path or unvalidated identifiers.
5. Application roles must not disable triggers, change replication-role settings, alter function ownership or change session configuration to bypass integrity enforcement.
6. Exact trigger timing, events, row/statement scope, function owner, execution mode, lock order and bypass protection remain to be reconciled before implementation.
7. Database superuser/provider administration remains outside application operation. Any emergency provider-level break-glass must be individually attributable, time-bounded and reviewed.

## 8. Prisma and connection-pool assumptions

- Prisma application connections use the restricted runtime login, not the migration/object-owner identity.
- Migration execution uses a separate controlled connection and credential.
- Worker and reporting processes use distinct connection credentials and pools.
- A pooled connection is a database service identity, not an end-user identity. Per-request actor context must be set and cleared safely if later used by audited functions or any approved RLS design.
- If session variables are used for trusted actor context, the design must use transaction-scoped settings, ensure reset on pool reuse, reject client-controlled identity claims, and test concurrent requests for context leakage.
- No RLS is enabled by this document. Any future RLS proposal must show compatibility with Prisma pooling, transaction boundaries, background jobs, migration bypass, connection reuse, tests and emergency access.

## 9. Threat and control mapping

| Threat | Required control |
|---|---|
| Compromised API credential | Runtime role has no DDL, role administration, audit mutation, backup or unrestricted delete privilege |
| Compromised worker credential | Separate worker role; only outbox/delivery/webhook/recovery operations; no finance approval/posting or identity administration |
| Malicious or compromised reporting job | Read-only approved views/read models; scoped report contract; authorization recheck at execution and retrieval |
| Privileged administrator reads audit history | Audit read separated from system administration; explicit Audit Officer permission; access itself audited |
| Runtime process tampers with audit evidence | Append-only grants; restricted append path; no UPDATE/DELETE/TRUNCATE |
| Migration credential theft | Dedicated controlled identity; not mounted in runtime/worker; release approval and audit |
| Function/trigger privilege escalation | Dedicated owner, safe search_path, schema qualification, narrow EXECUTE, adversarial tests |
| Backup credential compromise | Separate backup identity, encryption/key separation, restricted storage, restore monitoring and review |
| Pooled connection leaks actor context | Transaction-scoped context, reset/clear rules, concurrency and pool-reuse tests |
| Report scope manipulation | Server-derived scope, parameterized queries, authorization recheck, no client-controlled scope widening |
| Retention misuse | No automated deletion without approved schedule; hold-aware controlled action; separate approver/initiator where required |

## 10. Verification requirements before implementation

The following evidence must be produced against the confirmed PostgreSQL provider/version before coding or implementation authorization:

1. Complete role attribute and membership matrix, including LOGIN/NOLOGIN, INHERIT, CREATEDB, CREATEROLE, REPLICATION, BYPASSRLS and SUPERUSER attributes.
2. Object/schema ownership map and explicit schema CREATE/USAGE boundaries.
3. Table-by-table and column/function-level grants for all 70 tables, sequences and functions, reconciled to the canonical column/FK/index/integrity registers.
4. Explicit grant matrix for every append-only and controlled-history table.
5. Default-privilege behavior for future tables, sequences and functions.
6. Audit append path proof, including function owner, search_path, caller validation and denied mutation tests.
7. Trigger/function privilege-escalation tests and trigger bypass tests.
8. Worker-only outbox claim/lease/complete/retry tests, including stale worker fencing and poison-message handling.
9. Reporting read-only and scope-isolation tests, including cross-district and federation boundaries.
10. Migration credential isolation and runtime DDL-denial tests.
11. Backup/restore permission proof, encrypted backup evidence, isolated restore test and measured RPO/RTO.
12. Connection-pool context isolation tests if any actor/session context is stored in PostgreSQL session state.
13. Privilege audit queries/checklist for unintended grants, PUBLIC privileges, inherited membership and object ownership.
14. Independent security review of any SECURITY DEFINER function or exceptional-access path.
15. Evidence that the database role model does not weaken DFR-001/004, DDD-005, DDD-012, DDD-013 or DFR-005.

These are design/implementation verification requirements. No tests were executed and no runtime certification is claimed in this reconciliation.

## 11. Open decisions and authority gates

| Item | Status | Required closure |
|---|---|---|
| ODR-ENV-001 PostgreSQL provider/version | OPEN | Confirm production PostgreSQL version and managed provider capability |
| ODR-ENV-006 role/privilege model | OPEN | Confirm target-provider grants, ownership, audit path, backup and restore privileges |
| ODR-ENV-007 deployment/backup topology | OPEN | Confirm topology and produce DFR-005 evidence |
| ODR-010 audit investigation authority | OPEN | Name Audit Officer authority, ordinary/sensitive audit visibility, investigation approval, exceptional access and independent review |
| ODR-011 retention | OPEN | Approve record classes, basis, duration, trigger, disposal authority and hold policy |
| ODR-013 reporting governance | OPEN | Approve report catalogue, classification, disclosure, export permissions and expiry |
| Trigger/function contracts from CPERD-06 | OPEN | Finalize timing, execution mode, ownership, lock order and bypass controls |
| DDD-013 external independent technical assurance | NOT PERFORMED | Independent technical assurance remains separate from this role design |
| DFR-006 governance discrepancy | OPEN | Preserve the dated governance clarification and reconcile historical repository wording |
| Final consolidated ERD reconciliation | OPEN | Reconcile this and prior CPERD findings into one exact current owner-review package |
| Separate implementation authorization | NOT GRANTED | Explicit project-owner authorization required after design gates |

## 12. CPERD-07 disposition

- Role families and security boundaries: **DEFINED AT DESIGN LEVEL**.
- Least-privilege intent: **DEFINED**.
- Table-by-table SQL grants: **NOT ISSUED; pending final physical reconciliation and provider confirmation**.
- RLS: **NOT SELECTED**.
- Audit reader and break-glass authority: **PENDING ODR-010**.
- Reporting read contracts and disclosure: **PENDING ODR-013**.
- Backup provider privileges and measured recovery evidence: **PENDING ODR-ENV-001/006/007**.
- Trigger/function execution hardening: **OPEN under CPERD-06**.
- CPERD-07 closure: **NOT CLOSED** pending the evidence and authority gates above.
- Implementation authorization: **NOT GRANTED**.

## 13. Protected implementation boundary

Do not create or modify application code, Prisma schema/models, SQL DDL, PostgreSQL roles/grants/functions/triggers, migrations, database state, seeds, implementation tests or deployment resources under this reconciliation.

This document does not amend the owner-approved CPERD-01 master ERD. Any material physical changes identified by this work must be incorporated into a reconciled candidate and submitted for explicit project-owner review. The owner retains approval authority. No coding-stage transition is inferred.
