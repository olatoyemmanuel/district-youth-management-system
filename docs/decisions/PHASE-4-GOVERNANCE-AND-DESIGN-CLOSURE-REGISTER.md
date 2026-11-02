# DYMS Phase 4 — Governance and Design Closure Register

- Revision: GDC-01
- Date: 2026-11-02
- Project: DYMS v1.0, Sango District
- Repository: olatoyemmanuel/district-youth-management-system
- Branch: phase-1/requirements-consolidation
- Governing baseline: DFR-001–DFR-006; approved DDD decisions; CPERD-01; D13-POA-01
- Implementation: **NOT AUTHORIZED**

## 1. Purpose and operating rule

This register is the working closure queue for the remaining design, policy-evidence and environment confirmations. It consolidates existing open decisions without treating technical proposals or project-owner defaults as delegated-authority approvals.

The project owner has authorized continued design and governance closure work. This is not implementation authorization.

## 2. Completed project-owner approvals

| Item | Current status | Evidence |
|---|---|---|
| DFR-001–DFR-006 | Preserved as approved baseline | `docs/decisions/DECISION-REGISTER.md` |
| Conceptual ERD | Approved exact revision | SHA `25f2813e0256d9472daded45657dfb7ac9f70a43` |
| CPERD-01 | Project-owner approved | SHA `6d0b47973f4e24c73409832a4986f00817805638` |
| DDD-013 detailed physical review | Project-owner approved, all ten areas | `PHASE-3-DDD-013-PROJECT-OWNER-APPROVAL-RECORD.md`, D13-POA-01 |
| ODR-REC-01 | Project-owner approved as proposed for ODR-004/005/006/008/010/011/012/013 | `PHASE-2-OWNER-DECISION-REGISTER.md` §11 |
| REPORT-001–REPORT-010 | Included in canonical 107-ID requirements baseline | Requirements and Phase 3 traceability registers |
| DFR-006 current status clarification | Recorded; no implementation authorization | `DFR-006-GOVERNANCE-CLARIFICATION-2026-11-02.md` |

These approvals do not replace delegated authority, official policy evidence, deployment-owner confirmation or the separate implementation authorization.

## 3. DFR-006 governance closure

**Status: CURRENT OPERATIVE POSITION CLARIFIED.**

The README previously claimed DFR-006 was lifted and implementation authorized on 2026-10-29. The governing Architecture Decision Register continues to record DFR-006 as approved. The project owner's current instruction confirms that implementation remains prohibited until separate explicit authorization.

The README is being aligned with that operative status. This clarification does not rewrite the historical DFR-006 decision. Future material changes to the frozen design require a documented change request and impact review.

## 4. Ministry, membership and appointment authority evidence

| Decision | Status | Competent authority | Closure evidence required |
|---|---|---|---|
| ODR-001 — Category eligibility/progression | OPEN | Recognized Adventurer, Pathfinder, Senior Youth/Ambassador and Master Guide ministry authorities | Current official standards, issuing authority, version/effective date, applicable Division/Union/Conference adaptations, DYMS category mapping, evidence and exception authority |
| ODR-002 — Church transfers | OPEN | District and local church membership authorities | Written decisions for cancellation stages/actors, receiving-church and district rejection, reason requirements, appeal, backdating and one-open-request rule |
| ODR-003 — Appointments | OPEN | Higher appointing authorities at district/church scope | Exact state transitions, termination authority, acting appointments, overlap exceptions, future/retroactive dates, replacement term and dispute route |
| ODR-007 — Department membership | OPEN | District departmental coordinators and district governance authority | Department-specific eligibility, source/version, rejection and appeal, renewal/expiry, church-transfer effects and exception authority |
| ODR-009 — Credentials | OPEN | Recognized ministry credentialing/investiture authorities | Credential catalogue, standards/version, evidence, issuer/approver authority, validity, revocation, correction/reissue and disclosure rules |

No age threshold, eligibility exception, credential validity period, transfer appeal rule or appointment exception is to be invented by engineering.

## 5. Delegated authority confirmations for owner-approved v1 defaults

The project owner approved ODR-REC-01 as proposed. The following are still not represented as approvals by the named delegated authorities.

| Decision | Project-owner default | Delegated confirmation still required |
|---|---|---|
| ODR-004 — Organization/scope | District-owned departments; events owned by district or one church; department may organize but not own | District governance authority |
| ODR-005 — Finance | Conservative account, approval, payment, reversal and budget defaults; advanced payment/FX features disabled | Authorized district/church finance authority |
| ODR-006 — Attendance | EVENT or SESSION subject mode; confirmed registration normally required; documented authorized exception; self-check-in/offline disabled | District event/attendance ministry authority |
| ODR-008 — Event registration | Confirmed registrations consume capacity; no waitlist; late registration/capacity override require approval; material changes reapproved | District and local event authorities; finance authority for fee/refund effects |
| ODR-010 — Audit access | Separate Audit Officer role; system administrator does not automatically receive audit-read; exceptional access independently approved; break-glass disabled pending procedure | District governance/security/audit authority |
| ODR-011 — Retention | No automated permanent deletion without approved schedule; holds suspend disposal; DFR-005 backup retention remains separate | Records/administrative, district/church governance, finance and privacy/legal authorities |
| ODR-012 — Notifications | In-app baseline; email only after verification/templates; SMS/WhatsApp optional with consent; provider-independent adapters | Communications/content, privacy/consent and integration authorities |
| ODR-013 — Reporting | District/church/department scope; versioned/classified reports; request/execution/retrieval authorization; CSV/PDF proposal; private exports | District reporting owner, domain data owners and security/privacy authority |

For each delegated confirmation, retain the authority's title/name, decision date, exact rule, source/resolution, effective date and any conditions. A project-owner approval must not be relabelled as committee, church, ministry, finance, privacy or records approval.

## 6. Environment and technical-owner confirmations

All seven items remain OPEN in the canonical ODR register. TBR-01 provides design-level recommendations but does not prove the production environment supports them.

| ID | Confirmation | Existing design direction | Evidence required to close |
|---|---|---|---|
| ODR-ENV-001 | Production PostgreSQL version/provider | PostgreSQL 15 minimum design target | Selected managed/self-hosted provider, exact major/minor version, service tier and supported capabilities |
| ODR-ENV-002 | Extensions | No required extension in TBR-01; core PostgreSQL mechanisms preferred | Provider confirmation that required core features/privileges are available; document any exception |
| ODR-ENV-003 | UUID generation | PostgreSQL `gen_random_uuid()` for database defaults; application UUIDv4 allowed where needed | Confirm target PG15 function availability and single-authority generation rules |
| ODR-ENV-004 | Collation and identifier normalization | Unicode NFC canonicalization and deterministic `COLLATE "C"` design | Confirm provider locale/collation and freeze login identifier policy, including email case policy |
| ODR-ENV-005 | Timestamp authority | PostgreSQL `transaction_timestamp()` for created_at and trigger-maintained updated_at using `statement_timestamp()` | Confirm provider trigger/role capability and approve import/business-time separation |
| ODR-ENV-006 | Database roles/privileges | Separate object owner, runtime, outbox worker, backup/restore and audit-reader roles | Privilege matrix and provider evidence for append-only audit, migration, backup and restore controls |
| ODR-ENV-007 | Deployment and DR | Preserve DFR-005: RPO <=24h, RTO <=8h, daily encrypted backups, restore tests and alerting | Architecture/topology, backup product/configuration, encryption/access evidence, restore-test plan/results and alert routing |

No production provider, credentials, hostnames or deployment topology are assumed.

## 7. DDD-013 and CPERD-01 residual validation

The project-owner design reviews are approved. The following remain implementation-time validation or deployment selections, not reasons to reopen approved design without evidence:

1. Freeze scope fingerprint component tags/order and publish cross-language test vectors.
2. Define endpoint-specific authenticated session-bound versus principal-scoped idempotency contracts.
3. Select protected-secret store and managed HMAC/envelope key-management arrangement.
4. Confirm secret TTL, retrieval permissions, deletion and audit behavior in the selected service.
5. Validate the two-minute lease against endpoint processing durations and worker recovery.
6. Execute PostgreSQL 15 DDL, partial/expression index and FK validation.
7. Execute concurrent claim, fencing, stale-worker, uncertain-commit and outbox recovery tests.
8. Execute retention/tombstone cleanup and secret-erasure tests.
9. Review actual query plans and workload evidence before claiming index performance.

These validations must occur only after separate implementation authorization. They do not authorize a prototype or test schema now.

## 8. Technical design closure tasks still permitted

The following documentation-only work may continue:

- Reconcile the DDD register, ODR register, API catalogue, lifecycle catalogue and 107-ID requirement crosswalk so each unresolved policy rule is marked consistently.
- Prepare source-enrollment candidate inventory for retention without adding retention FKs or inventing schedules.
- Prepare a report catalogue proposal with report purpose, owner, scope, data classes, fields, redaction, export role and retention dependency. Do not treat it as approved.
- Prepare a credential standards evidence matrix for ODR-001/009.
- Prepare transfer and appointment lifecycle decision sheets for ODR-002/003.
- Prepare a finance workflow decision sheet that preserves approved conservative defaults and identifies each authority question.
- Prepare a named-role/authority map for audit, report data ownership and records decisions.
- Reconcile the 107 testable requirements to every ODR item and identify requirements whose acceptance evidence is still missing.
- Maintain a change-impact log under DFR-006 for every proposed amendment.

## 9. Closure criteria

A policy/delegated decision is closed only when all are present:
1. Competent authority identified and confirmed.
2. Exact decision text recorded.
3. Approval evidence/source attached or referenced.
4. Approval date and effective date recorded.
5. Conditions/exceptions and scope stated.
6. Affected requirements, DDD decisions, lifecycle states, physical design and tests reconciled.
7. A consistency review confirms no contradictory status remains.

An environment item is closed only when the selected environment and its supporting capability evidence are recorded.

## 10. Implementation boundary

**Implementation remains NOT AUTHORIZED.**

This register does not authorize Prisma, SQL DDL, migrations, database objects, seeds, generated clients, API/backend/frontend code, infrastructure changes, or deployment. The project owner must issue a separate explicit implementation authorization after the applicable design and governance gates are satisfied.

## 11. Current next sequence

1. Correct and formally record the DFR-006 README discrepancy.
2. Reconcile governance and authority statuses across canonical registers.
3. Prepare evidence/decision sheets for ODR-001/002/003/007/009.
4. Prepare delegated confirmation sheets for ODR-004/005/006/008/010/011/012/013.
5. Prepare ODR-ENV-001–007 technical confirmation package.
6. Complete documentation-only cross-register consistency review.
7. Present the remaining decisions and evidence gaps for project-owner review; do not claim delegated approvals without their evidence.
