# DYMS Database Design Decision Register

> **Restoration and current-decision note (2026-10-30):** This document is restored from the latest recoverable project snapshot located in the user's saved files. Its original content is retained as the design baseline, with the status corrections below taking precedence wherever older text conflicts. This restoration is not ERD approval and does not authorize Prisma models or migrations.
>
> The resolution records added in this restoration supersede earlier statuses for DDD-001 through DDD-004, DDD-013's authentication-specific scope, and DDD-014's authentication retention subset. Unresolved decisions remain blocked. See the dated resolution section at the end of this register and `DOMAIN-DECISION-APPROVAL-UPDATE-2026-10-30.md`.

## 1. Purpose and Status

This register consolidates the material unresolved decisions identified in the current DYMS Requirements Traceability Matrix and Invariant Enforcement Register. It is a decision-preparation artifact, not an approval of product policy, an ERD, a Prisma schema, or a migration.

- **Scope:** DYMS v1.0, Sango District.
- **Status:** **NOT READY** — material approval blockers remain.
- **Approval boundary:** DFR-001 through DFR-005 remain approved; DFR-006 was lifted on 2026-10-29. The final ERD requires the user's explicit approval.
- **Source and review status:** This register has been checked against the live working treeat `/home/nuel_toye/project/dyms` during the documentation review on 2026-10-23. Cross-register reconciliation is still in progress; this check does not resolve blocked decisions or approve the ERD, schema, or migrations.

## 2. Status Vocabulary

| Status                | Meaning     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BLOCKED**           | A material product rule or policy decision is unresolved; the design must not silently choose an outcome.     |
| **EVIDENCE REQUIRED** | The decision may already exist, but an authoritative source or provenance has not been located.     |
| **AWAITING APPROVAL** | A decision proposal has been explicitly prepared and awaits approval by an established authority. No such proposal is approved merely by appearing in this register. |
| **RESOLVED**          | Sufficient authoritative evidence and required approval are recorded, including approver, date, rationale, and source.     |

Priority describes the potential consequence of leaving the question unresolved, not the urgency or authority of any particular stakeholder.

## 3. Decision Register

### DDD-001 — Authoritative Product Requirements

- **Priority:** Critical
- **Status:** EVIDENCE REQUIRED
- **Decision question:** How should the project record the product-requirements baseline when no historical authoritative document has been recovered?
- **Current documented position:** No historical authoritative product-requirements documenthas been recovered, and the available Git history did not reveal one. The project owner approved `docs/product/PRODUCT-REQUIREMENTS-BASELINE.md` (PRB-001) on 2026-10-21 as the working review baseline. This does not automatically approve proposed requirements, resolve blocked domain decisions, or approve the ERD, schema, or migrations. DFR-001–DFR-006 and the user-confirmed domain baseline remain sources for the decisions they cover.
- **Affected requirements, entities, and invariants:** Traceability B-001; RT-001–RT-026; all proposed domain entities and workflows.
- **Evidence or approval required:** PRB-001 has been explicitly approved as the working review baseline, with the project owner as approver and 2026-10-21 as the approval date. The historical source remains unrecovered. Product-policy gaps must be resolved individually and recorded; do not treat baseline approval as approval of every proposed requirement.
- **Required follow-up:** Record PRB-001 provenance in the traceability matrix; classify downstream requirements against approved evidence; keep unresolved policy decisions blocked until individually decided and recorded.

### DDD-002 — Member Categories and Transitions

- **Priority:** High
- **Status:** BLOCKED
- **Decision question:** Can a member have only one active category at a time? What transitions are permitted, are effective dates required, and must category history be preserved?
- **Current documented position:** The current baseline lists Adventurer, Pathfinder, and Senior Youth as categories and Master Guide as a credential. Exact transition and history rulesremain blocked.
- **Affected requirements, entities, and invariants:** Traceability B-002; RT-006; `MEMBER`,`CREDENTIAL_DEFINITION`, `MEMBER_CREDENTIAL`; relevant membership invariants.
- **Evidence or approval required:** Authoritative product/youth-ministry policy or explicitapproved product decision covering category cardinality, transitions, effective dating, and history.
- **Required follow-up:** Update requirements, ERD/data model, invariants, and tests after approval. Do not reinterpret Master Guide as a category.

### DDD-003 — Church Membership Transfers

- **Priority:** High
- **Status:** BLOCKED
- **Decision question:** What transfer states and effective-date rules apply, and how must the system preserve one current primary church under concurrent transfers?
- **Current documented position:** The model proposes one current primary church and preserved transfer history. The concurrency mechanism and exact lifecycle rules are not fully approved.
- **Affected requirements, entities, and invariants:** Traceability B-004; RT-004; IM-03, IM-04, IM-05; `MEMBER`, `CHURCH`, `CHURCH_MEMBERSHIP_HISTORY`.
- **Evidence or approval required:** Approved transfer policy covering initiation, acceptance/approval if applicable, effective dates, cancellation/reversal, and conflict behavior.
- **Required follow-up:** Specify lifecycle invariants first; choose database constraint/locking strategy later during schema design without changing the policy.

### DDD-004 — Appointment Lifecycle and Precedence

- **Priority:** Critical
- **Status:** BLOCKED
- **Decision question:** What are the exact appointment states, mid-year changes, renewal rules, overlapping-position rules, and behavior when appointments conflict?
- **Current documented position:** Annual term, higher-authority renewal, no self-appointment/self-renewal/self-approval, retained history, and expiry of appointment-derived authority are part of the confirmed baseline. Broader state and precedence policies remain unresolved.
- **Affected requirements, entities, and invariants:** Traceability B-003; RT-007–RT-009; LA-01–LA-06; `ROLE_ASSIGNMENT`, `APPOINTMENT`, `ROLE`, `PERMISSION`, `ROLE_PERMISSION`.
- **Evidence or approval required:** Authoritative appointment policy covering states, dates, early ending, renewal, replacement, overlapping appointments, and conflict resolution.
- **Required follow-up:** Preserve approved appointment rules; document any new policy through formal change control if it alters a frozen decision.

### DDD-005 — Authorization Scope and Permission Precedence

- **Priority:** Critical
- **Status:** BLOCKED
- **Decision question:** What is the approved scope model for each leadership role, which roles are appointment-independent, what is the permission catalogue, and how are multiple roles/permissions combined?
- **Current documented position:** Server-side authorization, organizational scope enforcement, and separation of assignment from appointment are approved. The permission catalogue, overlapping-role precedence, and some scope rules are blocked.
- **Affected requirements, entities, and invariants:** Traceability B-003; RT-007–RT-009; LA-03, LA-04, LA-06; `ROLE`, `PERMISSION`, `ROLE_PERMISSION`, `ROLE_ASSIGNMENT`, `APPOINTMENT`.
- **Evidence or approval required:** Approved role/permission catalogue and scope matrix, including conflict/deny rules and appointment-independent roles.
- **Required follow-up:** Map each permission to an action and scope; add authorization matrix tests; do not infer authority from department membership.

### DDD-006 — Department Membership Lifecycle

- **Priority:** High
- **Status:** BLOCKED
- **Decision question:** What eligibility, status, effective-period, and duplicate-active-membership rules govern department participation? Does any participation rule grant or affect leadership eligibility?
- **Current documented position:** Church participation and member participation are separate relationships; department membership alone does not grant leadership authority. Exact membership lifecycle and eligibility rules remain blocked.
- **Affected requirements, entities, and invariants:** Invariant register DP-02 and DP-04; traceability B-003; `CHURCH_DEPARTMENT`, `DEPARTMENT_MEMBERSHIP`.
- **Evidence or approval required:** Authoritative department participation and eligibility policy.
- **Required follow-up:** Define lifecycle and uniqueness rules after policy approval; retain the separation between participation and leadership authorization.

### DDD-007 — Event Lifecycle and Registration

- **Priority:** High
- **Status:** BLOCKED
- **Decision question:** Who owns events, who may register, what eligibility applies, and what are the rules for capacity, cancellation, waitlists, and active-registration uniqueness?
- **Current documented position:** UTC timestamps and event time-zone preservation are approved. Event-registration policy remains unresolved; eligibility, lifecycle, cancellation, capacity, waitlist, and active-registration uniqueness must not be inferred from “where applicable.”
- **Affected requirements, entities, and invariants:** Traceability RT-015, RT-025, and B-005; DDD-007 remains blocked for registration policy; `EVENT`, `EVENT_REGISTRATION`.
- **Evidence or approval required:** Approved event and registration policy specifying ownership, eligibility, registration state transitions, capacity/waitlist behavior, cancellation, and duplicate handling.
- **Required follow-up:** Split approved timestamp/time-zone requirements from blocked registration behavior in traceability.

### DDD-008 — Attendance Scans and Corrections

- **Priority:** High
- **Status:** BLOCKED
- **Decision question:** What is the exact response to duplicate scans, retries, and concurrent corrections, and what retention rules apply to attendance history?
- **Current documented position:** Attendance corrections must preserve old/new values, reason, actor, time, request context, and audit history. Duplicate-scan and concurrent-correctionbehavior remains blocked.
- **Affected requirements, entities, and invariants:** Traceability RT-016–RT-017 and B-005;AT-01–AT-04; `ATTENDANCE_RECORD`, `ATTENDANCE_CORRECTION_HISTORY`, `IDEMPOTENCY_RECORD`, `AUDIT_LOG`.
- **Evidence or approval required:** Approved attendance policy for scan identity, duplicatebehavior, conflict/retry responses, correction authority, retention, and any event-specific exceptions.
- **Required follow-up:** Decide policy before choosing uniqueness, idempotency, locking, oroptimistic-concurrency implementation.

### DDD-009 — Finance Account Scope and Currency

- **Priority:** Critical
- **Status:** BLOCKED
- **Decision question:** Who owns each financial account, what scope applies, when is an account required, and which currency rules govern a transaction?
- **Current documented position:** Fixed-precision money and prevention of submitter self-approval are approved. Account ownership/scope, account requiredness, currency, and numbering policy are not fully resolved.
- **Affected requirements, entities, and invariants:** Traceability B-006; RT-018–RT-019; `FINANCIAL_TRANSACTION`, `FINANCIAL_APPROVAL`.
- **Evidence or approval required:** Approved finance/accounting policy for ownership, organizational scope, account requirements, supported currency, numbering, and applicable limits.
- **Required follow-up:** Only then finalize fields, precision, indexes, and validations.

### DDD-010 — Finance Workflow and Authority

- **Priority:** Critical
- **Status:** BLOCKED
- **Decision question:** What transaction states and stages apply, who may review, approve, post, or view transactions, what thresholds apply, and how are reversals serialized?
- **Current documented position:** Submitters cannot approve their own transactions; posted transactions are immutable; corrections use reasoned linked reversals; duplicate reversals must be prevented. Full lifecycle and role/threshold rules remain blocked.
- **Affected requirements, entities, and invariants:** Traceability B-006; RT-018–RT-019; finance invariants and `AUDIT_LOG`.
- **Evidence or approval required:** Approved financial lifecycle, role/scope matrix, thresholds, multi-stage approval rules, posting authority, reversal rules, and concurrency policy.
- **Required follow-up:** Preserve the approved separation-of-duties and immutability rules;add state-transition and negative-authorization tests.

### DDD-011 — Credential Policy

- **Priority:** High
- **Status:** BLOCKED
- **Decision question:** What catalogue ownership, eligibility, issuer authority, reissue eligibility, verification disclosures, privacy, and retention rules apply to credentials?
- **Current documented position:** Credential issuance, revocation, and reissue preserve history; each issuance is a separate record; Master Guide is a credential; blockchain/public verification is deferred from MVP. Further policy details remain unresolved.
- **Affected requirements, entities, and invariants:** Traceability B-007; RT-020; `CREDENTIAL_DEFINITION`, `MEMBER_CREDENTIAL`.
- **Evidence or approval required:** Authoritative credentialing policy covering eligibility, issuer authority, expiry/renewal if applicable, reissue, verification disclosure, privacy, and retention.
- **Required follow-up:** Update credential requirements and verification behavior only after approval; do not place sensitive PII on-chain.

### DDD-012 — Audit Actor Representation and Access

- **Priority:** High
- **Status:** BLOCKED
- **Decision question:** How are system/anonymous actors represented, who may access audit records, and what access exceptions are allowed?
- **Current documented position:** Audit history is intended to be append-only, scope-aware,and secret-free. Actor representation and audit access policy need further specification.
- **Affected requirements, entities, and invariants:** Traceability B-008; RT-021; LA-02; `AUDIT_LOG`, `SECURITY_EVENT`, relevant actor references.
- **Evidence or approval required:** Approved audit access matrix and policy for unauthenticated/system actors, sensitive fields, access review, and exceptional access.
- **Required follow-up:** Align audit schema and authorization with approved policy; preserve append-only controls and avoid secrets.

### DDD-013 — Idempotency Contract

- **Priority:** High
- **Status:** BLOCKED
- **Decision question:** What is the idempotency-key scope, payload fingerprint, replay response, retention period, failure recovery, and handling of external side effects for each sensitive operation?
- **Current documented position:** Operation-specific idempotency is required for sensitive mutations, but endpoint-specific contracts and recovery details remain unresolved.
- **Affected requirements, entities, and invariants:** Traceability B-008; RT-022; `IDEMPOTENCY_RECORD`; related mutation/audit invariants.
- **Evidence or approval required:** Approved API/idempotency contract by operation class, including key scope, payload mismatch behavior, replay semantics, retention, retry, and recovery rules.
- **Required follow-up:** Keep policy separate from the eventual database locking and storage design; add same-key concurrency and response-loss tests.

### DDD-014 — Retention and Deletion

- **Priority:** High
- **Status:** BLOCKED
- **Decision question:** What retention/deletion periods and exceptions apply separately to audit logs, security events, sessions, refresh-token history, reset tokens, membership/appointment history, attendance corrections, finance records, and credentials?
- **Current documented position:** Historical business records are preserved under approved rules, but the traceability matrix explicitly identifies audit/security-record retention and broader retention policy as unresolved. Do not infer one common retention period for all records.
- **Affected requirements, entities, and invariants:** Traceability B-008–B-009; RT-010–RT-014, RT-016, RT-019–RT-021, and RT-026; relevant historical/security entities.
- **Evidence or approval required:** Authoritative retention schedule and legal/privacy policy, with record-class-specific periods, legal holds, purge/anonymization rules, and exceptions.
- **Required follow-up:** Separate audit retention from session/token lifecycle; update eachrecord class and operational process consistently.

### DDD-015 — External-Event Delivery and Recovery

- **Priority:** Medium
- **Status:** BLOCKED
- **Decision question:** For security notifications or other external side effects, what delivery guarantees, retries, dead-letter/recovery behavior, and operational ownership are required?
- **Current documented position:** Database state changes and event rows should be coordinated transactionally where possible; external delivery details remain blocked.
- **Affected requirements, entities, and invariants:** Traceability DFR-004 coverage and RT-014; AU-06; `SECURITY_EVENT` and related operational components.
- **Evidence or approval required:** Approved operational/security requirement for delivery guarantees, retry limits, recovery, alerting, and ownership.
- **Required follow-up:** Keep external delivery design out of the ERD unless a real domain entity is justified; record operational deliverables separately.

## 4. Approved Baseline That This Register Does Not Reopen

The following remain approved and must not be changed by this register.

- **DFR-001 — Authentication/security:** Argon2id, short-lived access credentials, rotating refresh credentials, secure HttpOnly cookies, CSRF/origin controls, rate limiting, reuse detection, and single-use expiring reset tokens.
- **DFR-002 — API and authorization:** REST API `/api/v1`, authorization and scope enforcement, financial separation of duties, audit/idempotency, rate limiting, OpenAPI/contract-test obligations.
- **DFR-003 — Database foundation:** PostgreSQL + Prisma, UUIDs, relational integrity, historical preservation, transaction-safe critical workflows, fixed-precision money, UTC timestamps with event time zones, reviewed migrations.
- **DFR-004 — Session and token lifecycle:** Approved session deadlines, cookie paths/attributes, CSRF and refresh-rotation controls, revocation behavior, password-reset invalidation, and appointment-expiry behavior.
- **DFR-005 — Backup and disaster recovery:** RPO no more than 24 hours; critical-service RTO within 8 hours; automated daily database backups; encryption/restricted access; scheduled restore tests; failure monitoring/alerting; documented recovery procedure. Implementation evidence is still absent in the traceability snapshot.
- **DFR-006 — Design freeze:** Formal design freeze and change-control requirement.
- **Other confirmed domain rules and reconciled design elements:** The 28-entity conceptual inventory has been reconciled but is not final ERD or schema approval. The separate `ROLE_ASSIGNMENT` and `APPOINTMENT` model; `ROLE_PERMISSION`; `REFRESH_TOKEN_USE`; finance immutability/reversals; attendance correction history; credential issuance history; and deferred blockchain/public verification remain subject to their applicable approved decisions and documented constraints.

If later evidence conflicts with a frozen decision, follow the formal change-request and impact-review process. Do not silently modify the baseline.

## 5. Dependencies and Suggested Sequence

1. Record PRB-001 as the approved working review baseline and retain the historical-source gap. Resolve downstream policy decisions using evidence or explicit decisions; this baseline approval alone does not close DDD-002 through DDD-015.
2. Resolve the membership, appointment/authorization, event/attendance, finance, and credential decisions with the appropriate authoritative policy owners.
3. Resolve audit/idempotency and retention policies, coordinating record-class-specific requirements with security and operational needs.
4. Update the traceability matrix, ERD, data model, invariant register, and final review only after decisions are evidenced and approved.
5. Re-run cross-document validation and request explicit final ERD approval.

This is a recommended dependency sequence, not a claim that a particular approver or governing body has already been established. The current uploaded traceability record says the decision authority for missing product requirements may not be established in the repository; confirm that in the live repository.

## 6. Items That May Be Deferred to Approved Technical Design

The traceability matrix identifies physical index names, field/enum names, exact check-constraint expressions, decimal precision after currency policy, and the selected locking or optimistic-concurrency technique as implementation design items that can be decided during approved schema/API design once the relevant product policies are supplied.

These are not permission to create the Prisma schema now and must not silently change approved rules.

DFR-005 operational artifacts—backup/recovery procedure, backup configuration, restore-test procedure/evidence, failure monitoring/alerting, recovery runbook, and measured RPO/RTO demonstration—are production-readiness deliverables. They do not create a logical ERD entity, but their absence remains an operational readiness gap.

## 7. Resolution Record Template

For each decision, append a resolution record only when evidence and approval exist.

- **Decision ID:**
- **Decision made:**
- **Approver / approving authority:**
- **Approval date:**
- **Authoritative source and version:**
- **Rationale:**
- **Affected requirements and invariants updated:**
- **Documents updated:**
- **Verification/tests required:**
- **Status:** `RESOLVED` only after the evidence and required approval are recorded.

## 8. Current Conclusion

**NOT READY** — do not approve the ERD or generate `schema.prisma`/migrations while materialblockers remain unresolved.

This register organizes the questions; it does not resolve them. Before adding this draft tothe live repository, compare it with the current `REQUIREMENTS-TRACEABILITY.md`, invariant register, approved decision register, and working tree to confirm no newer changes or additional blockers are missing.
nuel_toye@nueltoye:~/project/dyms$

## 9. Resolution and reconciliation update — 2026-10-30

The following records supersede earlier status text in this register where the earlier entry says EVIDENCE REQUIRED or BLOCKED for the specific question now resolved. They do not close adjacent policy questions that were not decided.

### DDD-001 — Authoritative product requirements baseline

- **Status:** RESOLVED for the working-baseline question; historical provenance gap retained.
- **Decision:** PRB-001 v0.1 is approved as the reconstructed, versioned working product baseline.
- **Approver:** Project owner.
- **Approval date:** 2026-10-30 (explicit confirmation of the reconstructed-baseline recommendation; earlier working-baseline approval recorded 2026-10-21).
- **Qualification:** The historical authoritative original PRD has not been recovered. PRB-001 must not be described as the original PRD. Proposed requirements and blocked policies remain individually classified.

### MEM-02 — User–Member cardinality

- **Status:** RESOLVED.
- **Decision:** One User is associated with at most one Member, and every Member has exactly one User. The mandatory association policy remains in force for platform members.
- **Approver:** Project owner.
- **Approval date:** 2026-10-30.
- **Implementation note:** The policy is approved; exact mandatory-participation enforcement and transaction mechanics remain schema-design details.

### DDD-002 — Youth categories and affiliations

- **Status:** RESOLVED for the category/affiliation classification and age-21 overlap rule. Other category lifecycle/history details not expressly decided remain open.
- **Decision:** DYMS top-level categories remain Adventurer (4–9), Pathfinder (10–15), and Senior Youth (16–30+). Ambassador and Young Adult are Senior Youth affiliations. Public Campus Ministry is an additional affiliation. Master Guide is a training/credential pathway, not a top-level age category.
- **Age-21 rule:** A 21-year-old may hold both Ambassador and Young Adult affiliations concurrently, subject to approval by the relevant local ministry authorities. DYMS must not impose a new age boundary or mutual exclusivity at age 21.
- **Source:** Official General Conference Adventist Youth Ministries website. It publishes Ambassador 16–21 and Young Adults 21–30; a July 2025 Adventist News Network report gives Young Adults as 22–30. Preserve this published-source discrepancy in the traceability record.
- **Approver:** Project owner.
- **Approval date:** 2026-10-30.

### DDD-003 — Primary church membership and transfers

- **Status:** RESOLVED for cardinality and transfer-history policy; technical concurrency mechanism remains a schema-design item.
- **Decision:** Each Member has one current primary church membership. A transfer closes the prior membership and opens the new membership atomically. Prior membership history is preserved.
- **Approver:** Project owner.
- **Approval date:** 2026-10-30.

### DDD-004 — Annual appointment lifecycle

- **Status:** RESOLVED for annual term, renewal, authority, and self-renewal policy. Other role-precedence and conflicting-position rules remain under DDD-005.
- **Decision:** Terms run January 1 through December 31. Renewal creates a new historical appointment record. The designated higher authority controls appointment and renewal. Self-appointment and self-renewal are prohibited. Expiry ends appointment-derived authority without deactivating the account or deleting membership.
- **Approver:** Project owner.
- **Approval date:** 2026-10-30.

### DDD-013 — Authentication idempotency

- **Status:** PARTIALLY RESOLVED for authentication operations; non-authentication business-domain idempotency remains outside this decision.
- **Decision evidence:** AUTH-IDEM-001 through AUTH-IDEM-041 are consolidated in DDD-013-AUTHENTICATION-IDEMPOTENCY-SPECIFICATION.md on the associated specification branch. The consistency review is DDD-013-CONSISTENCY-REVIEW.md.
- **Review result:** Policy consistency passed with implementation-contract gaps. ERD readiness remains NOT READY. CR-01 through CR-06 were approved and incorporated into the consolidated DDD-013 specification. The remaining work is physical ERD modeling and verification of the approved contracts, as listed in DDD-013-CONSISTENCY-REVIEW.md §9. No Prisma/schema authorization is granted.

### DDD-014 — Retention and deletion

- **Status:** PARTIALLY RESOLVED for authentication record classes only; all other business-domain retention remains BLOCKED.
- **Approved authentication retention:** Session records: 12 months after expiry/revocation; refresh-token history: 12 months after expiry/consumption/revocation; password-reset records: 90 days after expiry/consumption/revocation; security events: 24 months after occurrence. Legal holds and active security investigations suspend deletion. Cleanup must be audited and retry-safe. Backup retention is separate.
- **Approver:** Project owner.
- **Approval date:** 2026-10-30.

### Still blocked

DDD-005 through DDD-012 and DDD-015 remain blocked to the extent stated in their entries. DDD-014 remains blocked for non-authentication business records. DDD-002 category transition/history rules not expressly covered above remain open. None of these resolutions approves the ERD or a physical schema.

## 10. Current implementation gate

The recovered database documents are restored and the decisions above are recorded for reconciliation. The ERD remains a proposed design. DDD-013's authentication slice is not ERD-ready until the approved CR-01 through CR-06 contracts are physically modeled and validated against the consistency-review checklist. No Prisma models or migrations are authorized until the user formally approves the corrected ERD.
