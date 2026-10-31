# **DYMS Requirements Traceability Matrix**
## **1. Purpose and status**
This record provides provenance for the conceptual ERD and database domain
model. It is a review document, not an approval of a new product rule, Prisma
schema, or migration.
- **Status:** Proposed traceability matrix; database design remains **NOT READY** pending authoritative product requirements, resolution of material blockers, and explicit final ERD approval.
- **Scope:*** DYMS v1.0, Sango District
- **Companion documents:*** [ERD](ERD.md), [Database Domain Model](DATA-MODEL.md),
  [Invariant Enforcement Register](INVARIANT-ENFORCEMENT-REGISTER.md)
- **Approval rule:*** Only the user may approve the final ERD. DFR-001 through
  DFR-006 remain unchanged.
## **2. Evidence consulted and provenance result**
| Evidence | Result and use |
|---|---|
| `docs/decisions/DECISION-REGISTER.md` | Direct source for approved DFR-001 through DFR-006. |
| `docs/security/SECURITY-BASELINE.md` | Approved security requirements supporting authentication, authorization, rate limiting, audit, historical preservation, and recovery controls. |
| `docs/architecture/ARCHITECTURE.md` | Approved architectural baseline for the modular monolith, PostgreSQL, Prisma, UUIDs, migrations, transactions, and operations. |
| `README.md` | Project-scope and repository-layout context. It is not a detailed product-requirements source. |
| `docs/product/PRODUCT-REQUIREMENTS-BASELINE.md` (PRB-001, v0.1) | Approved by the project owner on 2026-10-21 as the working review baseline. It is a reconstructed baseline, not a recovered historical PRD; proposed requirements and blocked decisions remain separately classified. |
| `docs/database/DATA-MODEL.md` at commit `440b929` | Shows the original proposed domain model; it is not authoritative product requirements. |
| Current `docs/database/ERD.md` | Proposed conceptual relationships reviewed and remediatedin this change. It is not evidence that an unresolved product rule is approved. |
| Available Git history (`git log --all`) | Contains no product requirements, PRD, or earlier approved domain-requirements artifact. |
| User-provided remediation brief, 2026-10-21 | Confirms the listed “Other approved domain decisions” as task baseline. These are traceable here, but should be added to a durable approved requirements or decision record before implementation when no existing decision-register entry exists. |
No historical authoritative product-requirements document was recovered.
PRB-001 is approved as the working review baseline, but that approval does
not establish the missing historical source or automatically approve
proposed requirements. Product policies not covered by approved decisions
or explicitly approved requirements remain blocked. The database design
remains NOT READY pending resolution of material blockers and explicit
final ERD approval.
### **2.1 Classification vocabulary**
| Status | Meaning |
|---|---|
| \***\***Approved*** | Directly supported by an approved decision, approved security/architecture baseline, or the user-confirmed approved domain baseline above. |
| \***\***Verified*** | Directly supported by an authoritative source, but is an implementation or operational deliverable rather than a separate architecture decision. |
| \***\***Proposed*** | A design recommendation needed to implement a supported requirement; it has no independent approval. |
| \***\***Blocked*** | Requires missing product requirements, stakeholder input, or an approved design decision. |
## **3. Decision-register coverage**
| Decision | Design trace | Status |
|---|---|---|
| DFR-001 Authentication Architecture | `USER`, `SESSION`, `REFRESH_TOKEN_USE`, `PASSWORD_RESET_TOKEN`, and `SECURITY_EVENT`; cookie, CSRF, CORS, rate-limit, reuse-detection, and audit requirements in ERD §5. | Approved and preserved. |
| DFR-002 API, Domain and Authorization | Scoped relationships, `ROLE` through `APPOINTMENT`, `AUDIT_LOG`, `IDEMPOTENCY_RECORD`, server authorization, financial separation of duties, and contract-test obligations. | Approved and preserved. Role precedence and catalogues are blocked product policy. |
| DFR-003 Database Consistency | UUIDs, foreign keys, unique constraints, fixed decimal money, UTC/event time zone, history, transactions, and reviewed migrations. | Approved and preserved. Specific keys, indexes, nullability, and checks are proposed until schema review. |
| DFR-004 Session Lifecycle and Deployment | Session deadlines, cookie paths, atomic refreshrotation, reuse response, revocation, password-reset invalidation, and appointment-expiry behavior. | Approved and preserved. Retention and external-event delivery details are blocked. |
| DFR-005 Backup and Disaster Recovery | Operational delivery matrix in §5 below; no ERD entity was added for infrastructure. | Approved target; implementation evidence is absent. |
| DFR-006 Formal Design Freeze | Historical design freeze was explicitly lifted on 2026-10-29; implementation was authorized subject to the remaining ERD and schema approval gates. | Historical decision preserved; freeze no longer active. |
## **4. Requirement-to-design traceability matrix**
The “test” column is a required future automated or operational verification;
it does not claim that the test already exists.
| ID | Requirement | Exact source | ERD entity or relationship | Invariant / enforcement mechanism | Required verification | Status |
|---|---|---|---|---|---|---|
| RT-001 | PostgreSQL is the record of authority; IDs are UUIDs; schema changes use reviewedmigrations. | DFR-003; Architecture §7 | All entities | UUID primary key, foreign keys, reviewed migration process. | Schema-review and migration-review checks. | Approved |
| RT-002 | V1 is limited to Sango District. | User-approved domain baseline; DATA-MODEL §3 |`DISTRICT` → `CHURCH`, `DEPARTMENT` | Scope foreign keys and server authorization. | Cross-scope authorization tests. | Approved |
| RT-003 | Proposed relationship: each member has exactly one user; each user has at most one member. The cardinality requires authoritative product confirmation. | ERD §3.1; DATA-MODEL§4.2 (proposed design, not authoritative requirements) | `USER` ↔ `MEMBER` | Do not finalizecardinality constraints until the product rule is approved; then review the exact database mechanism during schema design. | Confirm cardinality in an authoritative requirements record before schema approval; subsequently test creation rollback and cardinality. | Blocked |
| RT-004 | One current primary church and preserved transfer history. | ERD §3.2; DATA-MODEL§4.3 | `MEMBER` → `CHURCH`; `CHURCH_MEMBERSHIP_HISTORY` | Required current-church reference;effective-dated history; transfer transaction and concurrency control. | Concurrent transferand history-integrity tests. | Proposed |
| RT-005 | Churches and members participate in departments through separate relationships. |ERD §3.3; DATA-MODEL §4.4 | `CHURCH_DEPARTMENT`; `DEPARTMENT_MEMBERSHIP` | Separate foreign-key junctions and lifecycle records. | Isolation and lifecycle tests. | Verified |
| RT-006 | Categories are Adventurer, Pathfinder, Senior Youth; Master Guide is a credential. | ERD §3.4; user-approved domain baseline | `MEMBER`; `CREDENTIAL_DEFINITION`, `MEMBER_CREDENTIAL` | Category representation and credential relation. | Category/credential classification tests. | Approved |
| RT-007 | Roles, permissions, assignments, and appointments are separate concepts. | User-approved domain baseline; ERD §4 | `ROLE`, `PERMISSION`, `ROLE_PERMISSION`, `ROLE_ASSIGNMENT`,`APPOINTMENT` | Explicit junction and linked assignment/appointment relationship. | Relationship and scope-consistency tests. | Approved |
| RT-008 | Appointment-derived authority requires a valid appointment, ends at expiry, retains history, and does not deactivate the account. | DFR-004; Security §6; user-approved domainbaseline | `ROLE_ASSIGNMENT` ↔ `APPOINTMENT`; `USER`, `MEMBER` | Server evaluation of dates/state/scope; immutable history. | Expiry, ending, account-status, and historical-report tests. | Approved |
| RT-009 | Annual appointment term; higher-authority renewal; prevent self-appointment, self-renewal, and self-approval. | User-approved domain baseline; Security §6 | `APPOINTMENT`, actor references, `AUDIT_LOG` | Authority/scope check in transaction; actor comparison; audit. | Negative authority and renewal tests. | Approved |
| RT-010 | Authentication sessions are persistent, revocable, and deadline-bound. | DFR-001,DFR-004; Security §§3–5 | `USER` → `SESSION` | Status, last activity, inactivity and absolute expiry, per-session/account-wide revocation. | Expiry, logout, suspension, and all-devices tests. | Approved |
| RT-011 | Refresh credentials rotate, bind to sessions, are hash-only, and detect confirmedreuse. | DFR-001, DFR-004; Security §5 | `SESSION` → `REFRESH_TOKEN_USE` | Unique hash lookup, consumption state, replacement linkage, atomic rotation. | Concurrent refresh and reuse-detection tests. | Approved |
| RT-012 | Hash mismatch or unknown token does not itself prove replay; no undocumented reuse grace period; lost replacement requires reauthentication absent an approved recovery mechanism. | ERD §5.4; remediation brief | `REFRESH_TOKEN_USE`, `SECURITY_EVENT` | Deliberate response policy and audit; no account-wide revocation from unknown token. | Invalid-token, confirmed-reuse, and lost-response tests. | Approved |
| RT-013 | Reset tokens are hash-only, 30-minute, single-use; reset invalidates sessions. | DFR-001, DFR-004; Security §§3–5 | `PASSWORD_RESET_TOKEN`, `SESSION` | Expiry/consumption constraints and reset transaction. | Expired/reused reset and session-invalidation tests. | Approved |
| RT-014 | Security events record relevant outcomes without secrets and can exist before identity is known. | DFR-001; Security §§3, 11; ERD §5.6 | `SECURITY_EVENT` | Optional user/session references; redaction controls; transaction with state mutation where possible. | Unauthorized-event and secret-redaction tests. | Approved |
| RT-015 | Event timestamps preserve UTC and the relevant event time zone. | DFR-003; ERD §6.2 | `EVENT` | Store UTC timestamps and preserve the event time-zone context as required by the approved database consistency baseline. | Verify UTC storage and event-time-zone handling.| Approved |
| RT-016 | Attendance corrections preserve old and new values, reason, actor, time, request context, and audit record. | User-approved domain baseline; ERD §6.4; Security §10 | `ATTENDANCE_RECORD` → `ATTENDANCE_CORRECTION_HISTORY`; `AUDIT_LOG` | One transaction for change, history, audit; no destructive overwrite. | Correction rollback and history/audit consistency tests. | Approved |
| RT-017 | Duplicate attendance scans and concurrent corrections require defined behavior. |ERD §§6.3–6.5 | `ATTENDANCE_RECORD`, `IDEMPOTENCY_RECORD` | Proposed uniqueness/idempotency/versioning or locking strategy. | Retry and concurrent-correction tests. | Blocked |
| RT-018 | Money uses fixed decimal representation; submitters cannot approve their own transactions. | DFR-002, DFR-003; Security §10; user-approved domain baseline | `FINANCIAL_TRANSACTION`, `FINANCIAL_APPROVAL` | Decimal fields; transaction-scoped actor separation authorization. | Decimal, negative self-approval, and scope tests. | Approved |
| RT-019 | Posted financial transactions are immutable; corrections use a reasoned linked reversal; duplicate reversal is prevented. | Security §10; user-approved domain baseline; ERD §7.4 | Self-linking `FINANCIAL_TRANSACTION`, `AUDIT_LOG` | Status/state transition policy, original/reversal link, uniqueness/locking, transaction/audit. | Immutability, double-reversal, and rollback tests. | Approved |
| RT-020 | Credential issuance, revocation, and reissuance preserve records; Master Guide isa credential; blockchain/public verification are deferred. | User-approved domain baseline; ERD §8 | `CREDENTIAL_DEFINITION`, `MEMBER_CREDENTIAL` | New issuance per credential; revoke in place; link reissue to prior record; no on-chain PII. | Revocation/reissue/history and scope tests. | Approved |
| RT-021 | Audit history is append-only, scope-aware, and secret-free. | DFR-002; Security §11; user-approved domain baseline | `AUDIT_LOG` | Database permissions plus application policy; actor/action/target/outcome/scope/time/request context. | Mutation-denial, access-control,and redaction tests. | Approved |
| RT-022 | Sensitive mutations have operation-specific idempotency. | DFR-002; Security §8; ERD §9 | `IDEMPOTENCY_RECORD` + protected records | Scoped key, payload fingerprint, transactional state, replay/recovery policy. | Same-key concurrency, mismatch, response-loss tests. |Approved |
| RT-023 | Every API is rate limited; sensitive endpoints have stricter reviewed policies. |DFR-001, DFR-002; Security §7; user-approved domain baseline | No logical ERD entity required | Redis-backed/API-layer control; security events where applicable. | Distributed limit andRedis-failure tests. | Approved |
| RT-024 | Daily encrypted restricted backups, restore tests, monitoring, 24-hour RPO and 8-hour RTO. | DFR-005; Security §15 | No logical ERD entity required | Operational procedures and infrastructure configuration. | Scheduled restore evidence and RPO/RTO exercise. | Approved |
| RT-025 | Event registration rules, including eligibility and lifecycle, remain unresolved and must not be inferred from the ERD. | B-005; DDD-007; ERD §6.3 | `EVENT_REGISTRATION` | Donot finalize registration constraints or workflow behavior until an authoritative policy is approved. | Confirm registration eligibility, active-registration uniqueness, cancellation, capacity, and waitlist rules before implementation. | Blocked |
| RT-026 | Audit history remains append-only under approved controls; retention period and exceptions follow an authoritative, formally approved policy. Indefinite retention is not assumed. | DDD-014; ERD §9.3; Invariant Enforcement Register AD-06 | `AUDIT_LOG` | Preserve append-only controls; do not assume indefinite retention or implement deletion exceptions before policy approval. | Verify the authoritative policy, approved retention behavior, and resolution of DDD-014 before implementation. | Blocked |
## **5. DFR-005 operational traceability**
DFR-005 does not create a data entity. The current repository contains no
backup configuration, recovery procedure, restoration evidence, alert rule, or
runbook. These are implementation and release deliverables, not completed
controls.
| Required artifact | Intended evidence | Current state | Release relevance |
|---|---|---|---|
| Backup and recovery procedure | Versioned procedure naming ownership, schedule, encryption, restoration, and escalation. | Absent. | Required before production readiness. |
| Database backup configuration | Job/configuration showing daily automated backup, encryption, and restricted access. | Absent. | Required before production readiness. |
| Restore-test procedure and evidence | Scheduled test record with measured data loss and restore duration. | Absent. | Required to demonstrate RPO/RTO. |
| Backup failure monitoring and alerting | Alert configuration, recipient/escalation, and test evidence. | Absent. | Required before production readiness. |
| Recovery runbook | Critical-service recovery sequence and responsible roles. | Absent. | Required before production readiness. |
| RPO/RTO demonstration | Evidence of no more than 24 hours data loss and restoration within8 hours. | Absent. | Required release evidence. |
## **6. Material approval blockers and exact decisions required**
| ID | Exact question requiring an authoritative decision | Why it matters / consequence if unresolved |
|---|---|---|
| B-001 | Where is the approved product-requirements record, or who will approve a reconstructed, versioned replacement? | Without it, proposed entities, cardinalities, and workflows cannot be verified as product requirements. Final ERD approval would have no complete provenance. |
| B-002 | What are the category-transition rules: one active category only, effective dates,history, and permitted transitions? | Member category fields and history constraints cannot be designed safely. |
| B-003 | What are the exact appointment states, mid-year and renewal rules, scope model, conflicting-position rules, appointment-independent roles, permission catalogue, and permission-combination/precedence policy? | Effective authorization and active-record uniqueness cannotbe implemented without risking over- or under-authorizing users. |
| B-004 | What are the membership-transfer states and the approved mechanism for one currentchurch under concurrency? | The transfer workflow cannot prove its invariant or choose correct partial uniqueness/locking behavior. |
| B-005 | What event ownership, registration eligibility, active-registration uniqueness, cancellation, capacity, waitlist, duplicate-scan response, correction-conflict, and retention rules apply? | Registration and attendance tables would encode arbitrary policy and may handleretries inconsistently. |
| B-006 | What are financial-account ownership/scope, account requiredness, currency, numbering, transaction states, reviewer/approver/poster/viewer authority, thresholds, stages, and reversal concurrency rules? | A finance schema cannot safely represent authority or a completelifecycle; separation of duties alone is insufficient. |
| B-007 | What are credential catalogue ownership, eligibility, issuer authority, reissuanceeligibility, verification disclosures, privacy, and retention rules? | Issuance authorization and external disclosures cannot be implemented safely. |
| B-008 | What are audit-system actor representation, audit access and retention exceptions,idempotency key scope, fingerprint, replay, retention, failure recovery, and external-side-effect coordination policies? | Audit evidence and retry safety could differ by endpoint without a defensible contract. |
| B-009 | What retention/deletion policy applies to audit logs, sessions, refresh-token history, reset tokens, security events, and historical business records, including any exceptions? | Security/privacy storage duration and purge behavior cannot be designed or audited. DDD-014 specifically blocks approval of audit-retention duration and exceptions. |
## **7. Non-blocking implementation design items**
These are still required before a schema or feature is built, but can be
resolved during approved schema/API design after the related product policies
are supplied: physical index names, field names, enum names, exact decimal
precision after currency policy, exact check-constraint expressions, and the
selected locking or optimistic-concurrency technique. They must follow the
[Invariant Enforcement Register](INVARIANT-ENFORCEMENT-REGISTER.md) and may
not silently change an approved rule.
## **8. Traceability conclusion**
The ERD remains a proposed design and the database design remains **NOT READY** because the material questions in §6 lack authoritative product evidence. DFR-006 was lifted on 2026-10-29; DFR-001 through DFR-005 remain approved. The dated decision reconciliation in §9 supersedes older statuses for MEM-02, DDD-002, DDD-003, DDD-004, authentication idempotency, and authentication retention. RT-025 event-registration policy, RT-026 non-authentication audit/business retention, and other unresolved product policies remain blocked. This matrix does not establish that every ERD relationship or workflow is approved. In particular, RT-003 cardinality, RT-025 event-registration policy, and RT-026 audit retention remain blocked until the relevant authoritative requirements or decisions are approved. No new rule in this document converts a blocked or proposed item into an approved one.
nuel_toye@nueltoye:~/project/dyms$ 

## 9. Current decision reconciliation — 2026-10-30

This section supersedes older traceability rows only for the specific decisions stated below. It does not imply that every related implementation mechanism is approved.

| Requirement | Current approved rule | Design trace | Status and remaining boundary |
|---|---|---|---|
| RT-003 / MEM-02 | Every Member has exactly one User; each User has at most one Member. | USER ↔ MEMBER; unique User reference from Member. | Policy approved 2026-10-30. Exact mandatory-participation enforcement remains a schema-design choice. |
| RT-004 / DDD-003 | Each Member has one current primary church. Transfer closes the previous membership and opens the new membership atomically; history is preserved. | MEMBER, CHURCH, CHURCH_MEMBERSHIP_HISTORY. | Policy approved 2026-10-30. Exact concurrency/constraint mechanism remains proposed. |
| RT-006 / DDD-002 | Top-level categories: Adventurer 4–9, Pathfinder 10–15, Senior Youth 16–30+. Ambassador and Young Adult are Senior Youth affiliations; Public Campus Ministry is an additional affiliation; Master Guide is a credential/training pathway. | Member category and ministry affiliation representation; CREDENTIAL_DEFINITION, MEMBER_CREDENTIAL. | Classification approved 2026-10-30. A 21-year-old may hold both Ambassador and Young Adult affiliations with local ministry approval. Other transition/history details remain open. |
| RT-008 / DDD-004 | Appointment term is Jan 1–Dec 31. Renewal creates a new historical appointment; higher authority controls appointment/renewal; no self-appointment or self-renewal. | ROLE_ASSIGNMENT, APPOINTMENT, actor/authority references. | Policy approved 2026-10-30. Role catalogue, precedence, and conflicting-position matrix remain blocked under DDD-005. |
| RT-027 / DDD-013 | Authentication mutations use the approved idempotency contract in AUTH-IDEM-001–041. | IDEMPOTENCY_RECORD and protected authentication mutation workflows. | Authentication policy approved. CR-01 through CR-06 are approved. The authentication ERD slice remains NOT READY pending physical modeling and verification. Do not infer idempotency policy for other business domains. |
| RT-028 / DDD-014 | Authentication retention: sessions 12 months; refresh-token history 12 months; password-reset records 90 days; security events 24 months. Legal holds/investigations suspend deletion. | SESSION, REFRESH_TOKEN_USE, PASSWORD_RESET_TOKEN, SECURITY_EVENT. | Authentication retention approved 2026-10-30. Other business-domain retention remains blocked. Backup retention is separate. |

### 9.1 Product baseline provenance

PRB-001 v0.1 is approved as the reconstructed, versioned working product baseline. The historical authoritative original PRD remains unrecovered. Do not describe PRB-001 as the historical original. The baseline approval does not approve every proposed requirement or close unrelated blockers.

### 9.2 Authoritative youth ministry source note

The official General Conference Adventist Youth Ministries website lists Adventurers 4–9, Pathfinders 10–15, Ambassadors 16–21, and Young Adults 21–30. A July 2025 Adventist News Network report describes Young Adults as 22–30. The approved DYMS rule permits both Ambassador and Young Adult affiliations at age 21, subject to local ministry approval, and does not invent a replacement boundary. Public Campus Ministry is campus-context affiliation, not an exclusive age category. Master Guide is a training/credential pathway.

### 9.3 DFR-006 status

DFR-006 remains part of the historical decision record but was explicitly lifted on 2026-10-29. Implementation was authorized. This does not remove the requirement for formal ERD approval before Prisma models or migrations.
