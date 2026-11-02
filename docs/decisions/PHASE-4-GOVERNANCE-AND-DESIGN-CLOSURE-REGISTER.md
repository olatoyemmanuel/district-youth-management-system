# DYMS Phase 4 — Governance and Design Closure Register

- Revision: GDC-01
- Date: 2026-11-02
- Project: DYMS v1.0, Sango District
- Repository: olatoyemmanuel/district-youth-management-system
- Branch: phase-1/requirements-consolidation
- Governing baseline: DFR-001–DFR-006; approved DDD decisions; CPERD-01; D13-POA-01
- Implementation: **NOT AUTHORIZED**

## 1. Purpose and operating rule

This register records project-owner design decisions, engineering defaults, and deployment-time selections. The project owner is the final decision-maker for DYMS product behavior and v1 scope. External committee, church, ministry or departmental confirmation is not a prerequisite for deciding how DYMS operates.

Official ministry standards and external policies remain relevant when DYMS represents a credential, eligibility status or institutional decision as officially recognized. Where an official rule is not yet selected, DYMS will use versioned, configurable rules and will not invent age thresholds, credential validity periods or exceptions. Such references are policy configuration inputs, not a general blocker to completing the software design.

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

These approvals govern DYMS product and system design. They do not claim to issue official church credentials, change church governance outside DYMS, or select a production hosting provider. Those external matters are represented as configurable policy references or deployment-time decisions.

## 3. DFR-006 governance closure

**Status: CURRENT OPERATIVE POSITION CLARIFIED.**

The README previously claimed DFR-006 was lifted and implementation authorized on 2026-10-29. The governing Architecture Decision Register continues to record DFR-006 as approved. The project owner's current instruction confirms that implementation remains prohibited until separate explicit authorization.

The README is being aligned with that operative status. This clarification does not rewrite the historical DFR-006 decision. Future material changes to the frozen design require a documented change request and impact review.

## 4. Owner-controlled domain configuration and lifecycle rules

The following items are no longer blocked on third-party confirmation. DYMS will model the rules explicitly, keep policy values versioned, and restrict privileged decisions to the approved DYMS role and scope. The system must not present an internally configured rule as an official denomination-wide standard unless its source is recorded.

| Decision | DYMS design disposition | Configuration rule |
|---|---|---|
| ODR-001 — Category eligibility/progression | Close as a configurable eligibility model. Preserve the approved single active primary category and category history. | Store rule source, version, effective dates, required evidence and authorized verifier. Do not hardcode age thresholds or automatic promotion. Master Guide remains a credential. |
| ODR-002 — Church transfers | Close the core workflow around member initiation, receiving-church acceptance, district final approval and effective-on-approval. | Preserve decision/cancellation history and reason fields. One unresolved request per member. Cancellation/rejection and appeal transitions must be explicit, auditable and configurable before they are enabled. No backdating by default. |
| ODR-003 — Appointments | Close the standard annual appointment lifecycle. | Higher-authority approval, fresh renewal approval, one active holder per position/scope, 1 January–31 December term, reasoned early termination. Acting, overlap and retroactive exceptions remain disabled in v1. |
| ODR-007 — Department membership | Close the request/approval/withdrawal lifecycle. | Coordinator approval; multiple department memberships; reasoned termination; preserve history. Eligibility criteria are versioned per department and must be configured before enforcement. No automatic expiry or renewal assumption. |
| ODR-009 — Credentials | Close the credential catalogue and issuance-control design. | Versioned definitions, recognized issuer role, evidence review, linked reissue/renewal, reasoned revocation and disclosure permissions. Only configured credentials may be issued. Unknown validity periods remain unset, not invented. |

These dispositions are DYMS product decisions. Official source references can be attached to individual rule versions when available. Their absence does not prevent the platform from supporting controlled configuration.

## 5. Owner-approved v1 product defaults

The project owner approved ODR-REC-01 as proposed. These are the operative DYMS v1 product defaults. No additional delegated confirmation is required to represent them as DYMS behavior. Where a rule concerns official finance, privacy, records or ministry policy outside the software, the system records the responsible authority/source separately and does not claim the project decision changes that external policy.

| Decision | Operative DYMS v1 product default | External policy boundary (not a DYMS design blocker) |
|---|---|---|
| ODR-004 — Organization/scope | District-owned departments; events owned by district or one church; department may organize but not own | External church governance remains outside the software's authority |
| ODR-005 — Finance | Conservative account, approval, payment, reversal and budget defaults; advanced payment/FX features disabled | Official accounting and finance policy remains externally governed |
| ODR-006 — Attendance | EVENT or SESSION subject mode; confirmed registration normally required; documented authorized exception; self-check-in/offline disabled | Event organizers remain accountable for event-specific authorization |
| ODR-008 — Event registration | Confirmed registrations consume capacity; no waitlist; late registration/capacity override require approval; material changes reapproved | Event-specific approvals and financial obligations remain the responsibility of the relevant organizer |
| ODR-010 — Audit access | Separate Audit Officer role; system administrator does not automatically receive audit-read; exceptional access independently approved; break-glass disabled pending procedure | Any external audit mandate remains outside the platform's authority |
| ODR-011 — Retention | No automated permanent deletion without approved schedule; holds suspend disposal; DFR-005 backup retention remains separate | Applicable records, financial and privacy obligations must be configured when identified |
| ODR-012 — Notifications | In-app baseline; email only after verification/templates; SMS/WhatsApp optional with consent; provider-independent adapters | Applicable consent and communications requirements remain configuration inputs |
| ODR-013 — Reporting | District/church/department scope; versioned/classified reports; request/execution/retrieval authorization; CSV/PDF proposal; private exports | Report data owners remain responsible for the source data and permitted disclosures |

Where an external policy or institutional approval is relevant, record its source, issuing authority, version/effective date and conditions. Keep this separate from the project-owner decision. Do not represent a DYMS product decision as an external committee, church, ministry, finance, privacy or records resolution.

## 6. Environment and deployment selections

The engineering design baseline is PostgreSQL 15, extension-free core features, deterministic identifier normalization, database-authoritative persistence timestamps and separated database roles. These choices are sufficient for design closure. Production provider, exact service tier, hostnames, credentials and topology are deployment-time selections, not Phase 1 or Phase 2 logical-design blockers.

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

A deployment item is closed only when the actual provider and its capabilities are selected and verified. This is a deployment gate, not a Phase 1 requirements or Phase 2 physical-design gate.

## 10. Implementation boundary

**Implementation remains NOT AUTHORIZED.**

This register does not authorize Prisma, SQL DDL, migrations, database objects, seeds, generated clients, API/backend/frontend code, infrastructure changes, or deployment. The project owner must issue a separate explicit implementation authorization after the applicable design and governance gates are satisfied.

## 11. Current next sequence

1. Reconcile all Phase 1 requirements, domain decisions and traceability records.
2. Complete Phase 2 physical-design consistency and integrity documentation.
3. Keep official-policy references configurable and distinguish them from DYMS product decisions.
4. Record deployment provider and operational evidence when the deployment phase begins.
5. Present the Phase 1 closure record and Phase 2 entry baseline to the project owner.
