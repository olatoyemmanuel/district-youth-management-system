# DYMS Phase 2 — Owner Decision Package

**Project:** District Youth Management System (DYMS)  
**Product scope:** v1.0, Sango District  
**Prepared:** 2026-11-02  
**Status:** Decision package for project-owner and delegated-authority review  
**Working branch:** `phase-1/requirements-consolidation`  
**Implementation authorization:** NOT GRANTED

## 1. Purpose

This package gives the project owner one controlled entry point for the policy, governance, and environment decisions that remain necessary to complete the DYMS physical-design proposal.

It consolidates and links existing canonical records. It does not replace the Phase 2 Owner Decision Register, the approved DDD decisions, the requirements specification, or the requirement-to-ERD crosswalk. Where those sources disagree, the discrepancy is recorded for reconciliation rather than silently resolved.

This package is documentation and design governance only. It does not approve the physical database design or authorize implementation.

## 2. Decision baseline that must be preserved

The following decisions are treated as approved baselines and must not be reopened merely because this package is created.

| Baseline | Recorded decision | Governance treatment |
|---|---|---|
| DFR-001–DFR-006 | Frozen architecture, security, database and operations decisions | Preserve all six. The repository contains conflicting DFR-006 status statements; resolve only through a documented governance review. |
| Conceptual ERD | Project-owner approval on 2026-10-31 for exact revision `25f2813e0256d9472daded45657dfb7ac9f70a43` | Conceptual ERD approval only. It authorizes progression to physical-design review, not physical-design approval or implementation. |
| DDD-001–DDD-015 | Approved domain-decision baseline as recorded in the Phase 1 requirements and decision records | Preserve approved rules. Any new or changed policy requires a separately recorded decision and, where applicable, DFR-006 change governance. |
| Individual member account rule | Every member has an individual account and login linked one-to-one to the member; no shared, guardian-owned, guardian-managed or delegated guardian-to-child account model | Do not introduce guardian relationship, guardian login or delegated-account entities. Younger-member safeguarding and onboarding requirements remain evidence questions. |
| DDD-005 follow-up | Four explicit-deny and role-conflict policy groups approved on 2026-10-31 | Do not request reapproval of deny precedence, administration controls, role-pair classifications or independent-review requirement. |
| DDD-013 follow-up | Authentication idempotency decisions are separately recorded, including the approved BIGINT fencing/version counter and AUTH-IDEM decisions | Preserve their exact recorded scope. Do not interpret these approvals as approval of the complete physical design or implementation. |

Canonical records:
- [Phase 1 requirements consolidation](../product/PHASE-1-REQUIREMENTS-CONSOLIDATION.md)
- [Phase 1 testable requirements](../product/PHASE-1-TESTABLE-REQUIREMENTS.md)
- [Requirement-to-ERD traceability](../product/PHASE-1-REQUIREMENT-TO-ERD-TRACEABILITY.md)
- [Phase 1 conceptual ERD approval](./PHASE-1-CONCEPTUAL-ERD-APPROVAL.md)
- [Phase 2 Owner Decision Register](./PHASE-2-OWNER-DECISION-REGISTER.md)

## 3. Open owner and delegated-authority decision queue

The following 13 packages are already defined in the canonical Owner Decision Register. The summaries below are an index, not replacement decision wording. The register contains the detailed questions, authority guidance, policy boundaries and physical-design impacts.

| ID | Decision package | Primary domain / requirement trace | Priority | Current disposition |
|---|---|---|---|---|
| ODR-001 | Member category eligibility and progression | Membership; MEM-001–MEM-006 | P0 | Official source applicability and local authority confirmation required. |
| ODR-002 | Church transfer completion, rejection and cancellation | Organization; ORG-001–ORG-007 | P0 | Approved transfer workflow is preserved; cancellation, rejection, appeal and effective-date edge cases need reconciliation. |
| ODR-003 | Appointment lifecycle exceptions and authority | Leadership; APP-001–APP-007 | P0 | Core appointment rules are preserved; acting, overlap and exceptional transition rules need confirmation. |
| ODR-004 | Organizational ownership and scope boundaries | Organization, authorization, events, finance and reporting; AUTHZ-001–AUTHZ-011 plus affected domain groups | P0 | District-only boundary and explicit scope are preserved; department ownership and cross-scope cases remain open. |
| ODR-005 | Finance approval, payment and budget policy | Finance; FIN-001–FIN-012 | P0 | Account ownership, currency and separation-of-duties baseline preserved; approval matrix and accounting/payment exceptions remain open. |
| ODR-006 | Attendance registration and correction rules | Attendance; ATT-001–ATT-007 | P0 | Authorized recording, QR/manual entry, duplicate prevention and correction history preserved; registration prerequisite and attendance modes need confirmation. |
| ODR-007 | Department eligibility and membership lifecycle | Department membership; DEPT-001–DEPT-006 | P1 | Request, coordinator approval, multiple memberships and history preserved; eligibility, renewal and appeal details remain open. |
| ODR-008 | Event registration, capacity and schedule exceptions | Events and registration; EVT-001–EVT-007, with attendance dependencies | P1 | Event approval and significant-change controls preserved; capacity-consuming states, waitlists and exceptions remain open. |
| ODR-009 | Credential standards, issuer authority and disclosure | Credentials; CRED-001–CRED-004, plus MEM-003 | P1 | Versioned catalogue, recognized issuer and evidence controls preserved; official standards and disclosure rules remain open. |
| ODR-010 | Audit access and investigation authority | Audit; AUD-001–AUD-004 | P1 | Append-only audit and separately audited access preserved; named roles, exceptional access and review authority remain open. |
| ODR-011 | Retention record classes, legal basis and disposal authority | Retention; RET-001–RET-004 | P0 for retention implementation | No invented retention duration. Record-class enrollment, approved basis, holds and disposal authority remain open. |
| ODR-012 | Notifications, consent and provider operations | Notifications/integrations; NOTIF-001–NOTIF-006 | P1 | Provider-independent architecture and consent principles preserved; channel selection, provider and retry operations remain open. |
| ODR-013 | Reporting scope, classification and export governance | Reporting; report definitions, runs and export audits | P1 | Scope rechecks and audited exports are baseline controls; report catalogue, classification, export authority and retention remain open. |

**Priority meaning:** P0 decisions affect core integrity or authorization and must be resolved before physical-design approval where they affect the design. P1 decisions complete the affected domain specification and must remain visible as blockers for the affected tables, constraints or workflows. The canonical register is authoritative for each item's exact priority and status.

### Decision authority rule

A decision must be confirmed by the authority competent for that subject. The project owner records the resulting DYMS platform rule and its design implications. The project owner must not be treated as a substitute for an official ministry, finance, records, safeguarding or other delegated authority where external policy evidence is required.

For every decision, record:
1. Exact decision ID and question.
2. Final decision text, including explicit rejected alternatives where material.
3. Decision authority, approver and approval date.
4. Official policy source, version, effective date or other evidence.
5. Rationale and any approved exception.
6. Affected requirement IDs, bounded context, ERD entities, physical tables, constraints and tests.
7. Whether a DFR-006 change request is required.
8. Implementation authorization status. This remains NOT AUTHORIZED unless separately approved.

## 4. Technical and deployment confirmations

These seven items are technical-owner confirmations, not ministry-policy votes.

| ID | Confirmation required | Design dependency |
|---|---|---|
| ODR-ENV-001 | Production PostgreSQL major version and managed service/provider | Constraint, extension, collation and operational compatibility. |
| ODR-ENV-002 | Whether `btree_gist` and other required extensions are permitted | Appointment-overlap and other PostgreSQL-specific enforcement. |
| ODR-ENV-003 | UUID generation strategy | Consistent identifier defaults and environment portability. |
| ODR-ENV-004 | Database collation/locale and login identifier normalization | Deterministic identity lookup and uniqueness. |
| ODR-ENV-005 | Timestamp authority and update-time policy | Explicit defaults and timestamp semantics. |
| ODR-ENV-006 | Managed database role/privilege model | Append-only audit, trigger, migration, backup and restore controls. |
| ODR-ENV-007 | Deployment topology and evidence for DFR-005 backup/restore targets | Operational validation of the approved RPO/RTO without changing them. |

The detailed questions and rationale remain in [the canonical Owner Decision Register](./PHASE-2-OWNER-DECISION-REGISTER.md).

## 5. Requirements and domain traceability

The current testable requirements source enumerates 97 requirement IDs across these groups:

| Requirement group | Count | Main domain |
|---|---:|---|
| ID | 4 | Identity and account |
| MEM | 6 | Member category and membership |
| ORG | 7 | Church membership and transfer |
| DEPT | 6 | Department membership |
| APP | 7 | Appointments |
| AUTHZ | 11 | Authorization |
| EVT | 7 | Events |
| ATT | 7 | Attendance |
| FIN | 12 | Finance |
| CRED | 4 | Credentials |
| AUD | 4 | Audit |
| RET | 4 | Retention |
| NOTIF | 6 | Notifications and integrations |
| SEC | 12 | Security and platform controls |
| **Total** | **97** | |

The existing [Requirement-to-ERD Traceability](../product/PHASE-1-REQUIREMENT-TO-ERD-TRACEABILITY.md) is the source of truth for the current requirement-group-to-ERD crosswalk and the DFR/DDD mapping. The table above is a navigation summary; it does not claim every individual requirement has been proven by executable tests.

### Reporting traceability gap

The current 97-row requirements catalogue does not expose a dedicated REPORT requirement group, although the conceptual ERD and physical design contain report definitions, report runs and export audits. ODR-013 therefore has a documented domain and physical-design target but lacks a dedicated report-specific requirement-ID range in the current catalogue.

Before final physical-design approval, add or explicitly map testable requirements for:
- Report definition ownership, approval and versioning.
- Requester scope and authorization rechecks at request, execution and export retrieval.
- Data classification, aggregation and redaction.
- Export format, access, expiry, retention and audit evidence.

Do not invent requirement IDs or alter the reported 97-row count without updating the testable requirements source and traceability crosswalk together.

### Requirements reconciliation items

The existing traceability crosswalk identifies preliminary range discrepancies in the parent requirements consolidation document. For example, preliminary ranges exceed the IDs present in the detailed testable requirements file for MEM, ORG and AUTHZ. The detailed testable requirements file and current crosswalk must be reconciled before requirements sign-off. The 97 count refers to IDs actually enumerated in the detailed source, not preliminary range labels.

## 6. Physical-design dependencies and current blockers

The owner decisions feed the working physical proposal as follows:

| Design area | Owner decisions / evidence | Required outcome before approval |
|---|---|---|
| Member categories | ODR-001 | Source-backed eligibility, progression, evidence and exception rules. |
| Church transfers | ODR-002 | Exact cancellation/rejection/appeal rules and one-pending-request semantics. |
| Appointments and roles | ODR-003, ODR-004 | Approved lifecycle exceptions and confirmed position/organizational scope rules. |
| Departments and events | ODR-004, ODR-007, ODR-008 | Owner scope, eligibility, registration and capacity state definitions. |
| Finance | ODR-005 | Approved account multiplicity, authority matrix, payment lifecycle, budget and reversal semantics. |
| Attendance | ODR-006, ODR-008 | Registration prerequisite, event/session mode, status and correction authority. |
| Credentials | ODR-001, ODR-009 | Applicable standards, issuer authority, evidence and disclosure rules. |
| Audit and retention | ODR-010, ODR-011, ODR-ENV-006 | Audit access authority, enrolled record classes, approved schedules and enforceable privileges. |
| Notifications | ODR-012, ODR-ENV-001, ODR-ENV-006 | Provider/channel decisions and environment-compatible retry/webhook controls. |
| Reporting | ODR-004, ODR-013 | Report-specific requirements, scope ownership, classification and export governance. |
| PostgreSQL physical mechanisms | ODR-ENV-001–006 | Confirm deployed PostgreSQL version, extension and privilege support before selecting implementation-specific mechanisms. |
| Disaster recovery | ODR-ENV-007 | Evidence for the already approved DFR-005 targets. |

The current physical-design review records 65 distinct physical tables, 155 named FK relationships, a 617-entry column register and a 214-entry index inventory. Those are document-level inventories, not proof of executable PostgreSQL behavior. The current design review still identifies incomplete defaults, policy-dependent checks, lifecycle predicates, PostgreSQL compatibility and other evidence requirements.

Canonical physical-design references:
- [Phase 2 physical database design](../architecture/PHASE-2-PHYSICAL-DATABASE-DESIGN.md)
- [Phase 2 relational integrity matrix](../architecture/PHASE-2-RELATIONAL-INTEGRITY-MATRIX.md)
- [High-severity relational-integrity remediation](../architecture/PHASE-2-HIGH-SEVERITY-RELATIONAL-INTEGRITY-REMEDIATION.md)
- [Phase 2 physical-design second review](../architecture/PHASE-2-PHYSICAL-DATABASE-DESIGN-SECOND-REVIEW.md)

## 7. Decision recording and change control

Use the canonical Owner Decision Register's recording template for each decision. Update the relevant source documents together:
1. Owner Decision Register.
2. Requirements consolidation and testable requirements, where the business rule changes or needs a new testable statement.
3. Requirement-to-ERD traceability.
4. Domain boundaries and conceptual/physical design, where affected.
5. Lifecycle catalogue, integrity matrix and tests, where affected.
6. Review findings and approval package.

A decision is not complete merely because a discussion occurred. It is complete only when the authority, decision text, evidence, date and downstream document changes are recorded and independently checked.

Do not overwrite historical approvals. If a previously approved decision changes, retain the old record and link a formal change request under the applicable DFR governance.

## 8. Approval gates and prohibited actions

Current gates:

- **Conceptual ERD:** APPROVED for exact revision `25f2813e0256d9472daded45657dfb7ac9f70a43`.
- **Physical database design:** WORKING PROPOSAL; NOT APPROVED FOR IMPLEMENTATION.
- **Owner/delegated-authority decisions:** OPEN as listed in the canonical register.
- **Technical environment confirmations:** OPEN as listed in the canonical register.
- **Implementation:** NOT AUTHORIZED.

Until the project owner separately approves the exact final physical-design revision and explicitly authorizes implementation, do not:
- Edit `backend/prisma/schema.prisma`.
- Generate or change Prisma models or clients.
- Create, edit or run migrations.
- Write or execute SQL DDL.
- Create or alter database objects.
- Seed production or development data from unresolved policy values.
- Begin application feature implementation.

DFR-001 through DFR-006 remain preserved. The individual-account rule remains mandatory. Blockchain verification remains deferred from the MVP. This package grants no implementation authority.

## 9. Owner review sequence

Recommended review sequence, consistent with the canonical register:

1. ODR-001 to ODR-003: category eligibility, transfers and appointments.
2. ODR-004: organizational ownership and scope.
3. ODR-005: finance policy.
4. ODR-006 and ODR-008: attendance and event registration.
5. ODR-007 and ODR-009: department membership and credentials.
6. ODR-010 and ODR-011: audit access and retention.
7. ODR-012 and ODR-013: notifications and reporting.
8. ODR-ENV-001 to ODR-ENV-007: deployment and database environment confirmations.

This is a sequencing recommendation, not an approval request for every item at once. Each decision must be handled by its competent authority and recorded individually.

---

**Package owner:** DYMS Project Owner  
**Package maintainer:** DYMS Engineering  
**Decision register:** [PHASE-2-OWNER-DECISION-REGISTER.md](./PHASE-2-OWNER-DECISION-REGISTER.md)  
**Implementation status:** NOT AUTHORIZED


## 10. Technical blocker resolution update (2026-11-02)

The engineering blockers that do not require a ministry, church, finance, safeguarding, privacy or records-policy decision are now consolidated in [Phase 2 Technical Blocker Resolution TBR-01](../architecture/PHASE-2-TECHNICAL-BLOCKER-RESOLUTION.md). It establishes the PostgreSQL 15 minimum design baseline, extension-free enforcement direction, UUID/timestamp/collation conventions, appointment overlap guard, attendance concurrency design, audit role separation, DDD-013 technical refinement and safe boundaries for policy-blocked modules.

A dedicated [Reporting Requirements Proposal RPT-PR-01](../product/PHASE-2-REPORTING-REQUIREMENTS-PROPOSAL.md) supplies candidate REPORT-001–REPORT-010 requirements. They are not counted in the approved 97-row requirements baseline until the owner approves and the catalogue/crosswalk are updated together.

This update does not close ODR-001–ODR-013 or ODR-ENV-001–007 where a competent authority or deployment owner must supply evidence. It does not change DFR-001–DFR-006 or authorize implementation.


## 11. Recommended owner decisions

The detailed [Phase 2 Owner Decision Recommendations ODR-REC-01](./PHASE-2-OWNER-DECISION-RECOMMENDATIONS.md) provides exact conservative v1 recommendations for ODR-004 through ODR-013, while preserving the authority requirements for ODR-001, ODR-002, ODR-003, ODR-007, ODR-009 and ODR-ENV-007. These are proposed decisions, not approvals. The owner may approve, amend or defer each item to the competent authority.
