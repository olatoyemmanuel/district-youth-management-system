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
- **Status:** RESOLVED for the working-baseline decision; historical original PRD remains unrecovered
- **Decision question:** How should the project record the product-requirements baseline when no historical authoritative document has been recovered?
- **Current documented position:** No historical authoritative product-requirements document has been recovered, and the available Git history did not reveal one. PRB-001 v0.1 is approved as the reconstructed, versioned working review baseline; it is not the recovered original PRD. This does not automatically approve proposed requirements, resolve blocked domain decisions, or approve the ERD, schema, or migrations. DFR-001–DFR-005 and the user-confirmed domain baseline remain sources for the decisions they cover.
- **Affected requirements, entities, and invariants:** Traceability B-001; RT-001–RT-026; all proposed domain entities and workflows.
- **Evidence or approval required:** PRB-001 has been explicitly approved as the working review baseline, with the project owner as approver and 2026-10-21 as the approval date. The historical source remains unrecovered. Product-policy gaps must be resolved individually and recorded; do not treat baseline approval as approval of every proposed requirement.
- **Required follow-up:** Record PRB-001 provenance in the traceability matrix; classify downstream requirements against approved evidence; keep unresolved policy decisions blocked until individually decided and recorded.

### DDD-002 — Member Categories and Transitions

- **Priority:** High
- **Status:** PARTIALLY RESOLVED. Category/affiliation policy and its conceptual ERD representation are now documented; category transitions, effective dates, and history remain blocked.
- **Decision question:** Can a member have only one active category at a time? What transitions are permitted, are effective dates required, and must category history be preserved?
- **Current documented position:** `MEMBER.category_code` distinguishes Adventurer, Pathfinder, and Senior Youth. `MINISTRY_AFFILIATION`, `MEMBER_MINISTRY_AFFILIATION`, and `MINISTRY_AFFILIATION_APPROVAL` represent Ambassador, Young Adult, Public Campus Ministry, and the approved age-21 dual-affiliation approval. Master Guide remains a credential/training pathway. Category transitions, effective dates, and history remain blocked.
- **Affected requirements, entities, and invariants:** Traceability B-002; RT-006; `MEMBER`,`CREDENTIAL_DEFINITION`, `MEMBER_CREDENTIAL`; relevant membership invariants.
- **Evidence or approval required:** Authoritative product/youth-ministry policy or explicitapproved product decision covering category cardinality, transitions, effective dating, and history.
- **Required follow-up:** Keep category/affiliation concepts distinct in ERD and data model; validate age-21 dual affiliation requires local approval. Do not invent category transition/history rules.

### DDD-003 — Church Membership Transfers

- **Priority:** High
- **Status:** RESOLVED for one current primary church and atomic history-preserving transfer policy; technical enforcement remains proposed.
- **Decision question:** What transfer states and effective-date rules apply, and how must the system preserve one current primary church under concurrent transfers?
- **Current documented position:** One current primary church and atomic transfer with preserved history are approved. Transfer request/approval/cancellation states, if any, and the exact concurrency mechanism remain to be specified without changing the approved policy.
- **Affected requirements, entities, and invariants:** Traceability B-004; RT-004; IM-03, IM-04, IM-05; `MEMBER`, `CHURCH`, `CHURCH_MEMBERSHIP_HISTORY`.
- **Evidence or approval required:** Approved transfer policy covering initiation, acceptance/approval if applicable, effective dates, cancellation/reversal, and conflict behavior.
- **Required follow-up:** Specify lifecycle invariants first; choose database constraint/locking strategy later during schema design without changing the policy.

### DDD-004 — Appointment Lifecycle and Precedence

- **Priority:** Critical
- **Status:** PARTIALLY RESOLVED. Annual term, renewal history, higher-authority appointment/renewal, and no self-appointment/self-renewal are approved; the specified role-pair classifications are now approved under DDD-005; DDD-004 appointment lifecycle and technical overlap/duplicate enforcement remain open.
- **Decision question:** What are the exact appointment states, mid-year changes, renewal rules, overlapping-position rules, and behavior when appointments conflict?
- **Current documented position:** Annual term, higher-authority renewal, no self-appointment/self-renewal/self-approval, retained history, and expiry of appointment-derived authority are part of the confirmed baseline. Broader state and precedence policies remain unresolved.
- **Affected requirements, entities, and invariants:** Traceability B-003; RT-007–RT-009; LA-01–LA-06; `ROLE_ASSIGNMENT`, `APPOINTMENT`, `ROLE`, `PERMISSION`, `ROLE_PERMISSION`.
- **Evidence or approval required:** Authoritative appointment policy covering states, dates, early ending, renewal, replacement, overlapping appointments, and conflict resolution.
- **Required follow-up:** Preserve approved appointment rules; document any new policy through formal change control if it alters a frozen decision.

### DDD-005 — Authorization Scope and Permission Precedence

- **Priority:** Critical
- **Status:** PARTIALLY RESOLVED. The initial role categories, organizational scope policy, action-specific permission groups, additive permission combination, explicit-deny precedence, no-title-seniority rule, and role-to-permission matrix for the four leadership roles were approved on 2026-10-31.
- **Decision question:** How are explicit denies represented and administered, which specific role combinations are prohibited or require review, and what overlap/duplicate constraints apply to assignments and appointments?
- **Approved policy:** See [DDD-005 Authorization Scope and Permission Precedence](../decisions/DDD-005-AUTHORIZATION-SCOPE-AND-PERMISSION-PRECEDENCE.md) and [DDD-005 Approved Role-to-Permission Matrix](../decisions/DDD-005-ROLE-PERMISSION-MATRIX-PROPOSAL.md). The matrix's concrete grants and scope limits for District Youth Leader, District Departmental Coordinator, Local Church Youth Leader, and Local Church Youth Assistant are approved. HOLD entries remain withheld pending their domain decisions.
- **Affected requirements, entities, and invariants:** Traceability B-003; RT-007–RT-009 and RT-029; LA-03, LA-04, LA-06; `ROLE`, `PERMISSION`, `ROLE_PERMISSION`, `ROLE_ASSIGNMENT`, `APPOINTMENT`.
- **Remaining evidence or approval required:** Stable permission identifiers and complete permission-to-resource/scope mapping; technical representation/enforcement of explicit denies; assignment/appointment overlap and duplicate constraints not settled by the approved role-pair classifications.
- **Required follow-up:** Implement the approved deny and role-pair policy in the corrected design after stable permission/resource mapping and appointment lifecycle constraints are resolved; complete positive/negative authorization tests. Preserve DDD-004 appointment rules and DDD-012 audit-administration authority. Do not infer authority from department membership.

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
- **Status:** PARTIALLY RESOLVED. Role-based access, access logging, Audit Viewer/Audit Administrator permission levels, sole System Administrator appointment authority, and single-administrator sufficiency are approved. System/anonymous actor taxonomy and detailed access controls remain blocked.
- **Approved access policy (2026-10-30):**
  - Access to sensitive audit and security records is role-based and restricted to authorised administrators. Every access attempt is logged, including denied attempts where technically feasible (PR #4).
  - Audit Viewer may view only records within the viewer's authorised scope. It cannot edit/delete records or manage audit-access permissions (PR #5).
  - Audit Administrator may manage audit-access permissions and review access activity, but cannot alter or erase historical audit records (PR #5).
  - Only the System Administrator may appoint or revoke Audit Administrators. Audit Administrators cannot appoint themselves, appoint peers, or revoke another Audit Administrator (PR #6).
  - One System Administrator is sufficient to approve and execute Audit Administrator appointments/revocations; no second-person approval is required (PR #8).
  - Initial System Administrator provisioning is controlled deployment/bootstrap, not public registration. Provisioning and recovery must be audited; verified ownership and a documented recovery procedure are required (PR #9).
- **Decision question still open:** How are anonymous/system actors represented, and what exact record scopes, sensitive-field masking, exports, access reviews, break-glass controls, and audit-of-audit retention apply?
- **Affected requirements, entities, and invariants:** Traceability B-008; RT-021; AD-01, AD-02, AD-07; `AUDIT_LOG`, `SECURITY_EVENT`, `ROLE`, `PERMISSION`, relevant actor references.
- **Evidence or approval required:** Resolve the remaining scope, masking, export, access-review, emergency-access, actor-taxonomy, and audit-of-audit retention questions.
- **Required follow-up:** Keep historical audit records immutable; model viewer/admin permissions distinctly; ensure the System Administrator is the sole appointment authority for Audit Administrators; log access and all appointment/revocation actions.

### DDD-013 — Idempotency Contract

- **Priority:** High
- **Status:** PARTIALLY RESOLVED. Authentication policy is approved and its conceptual persistence structures are now represented in ERD §§2.1 and 9. Non-authentication business-domain idempotency remains blocked; physical constraints and verification remain.
- **Decision question:** What idempotency contract applies to each operation class, and how are scope, fingerprint, replay, retention, failure recovery, and external side effects represented?
- **Current documented position:** AUTH-IDEM-001–041 and CR-01–CR-06 are approved. The ERD now represents mutually exclusive authenticated/pre-authentication scopes, `PRE_AUTH_CONTEXT`, `OUTBOX_MESSAGE`, and the external protected reset-secret-store boundary. Exact index predicates, field constraints, secret-store integration, and endpoint verification remain technical gates. Other business-domain idempotency policies remain unresolved.
- **Affected requirements, entities, and invariants:** RT-022 and RT-027; `IDEMPOTENCY_RECORD`; related mutation/audit invariants.
- **Evidence or approval required:** For non-authentication operations, approve a domain-specific contract before applying idempotency behavior. For authentication, verify the represented ERD slice against DDD-013 and complete physical constraint/secret-store integration design after ERD approval.
- **Required follow-up:** Keep authentication and non-authentication policies separate; verify scope-mode exclusivity, fingerprint conflict, outbox atomicity, secret-reference protection, recovery/tombstone retention, and endpoint replay tests.

### DDD-014 — Retention and Deletion

- **Priority:** High
- **Status:** PARTIALLY RESOLVED. Authentication record retention is approved; audit-log and other business-domain retention remain blocked.
- **Decision question:** What retention/deletion periods and exceptions apply separately to audit logs, security events, sessions, refresh-token history, reset tokens, membership/appointment history, attendance corrections, finance records, and credentials?
- **Current documented position:** Authentication retention periods are approved for sessions, refresh-token history, password-reset records, and security events. Audit-log and non-authentication business-record retention remain unresolved. Do not infer one common retention period for all records.
- **Affected requirements, entities, and invariants:** Traceability B-008–B-009; RT-010–RT-014, RT-016, RT-019–RT-021, and RT-026; relevant historical/security entities.
- **Evidence or approval required:** For non-authentication records, an authoritative retention schedule and legal/privacy policy with record-class-specific periods, legal holds, purge/anonymization rules, and exceptions. Preserve the approved authentication retention subset.
- **Required follow-up:** Separate audit and business-record retention from the approved authentication retention schedule; update each record class and operational process consistently.

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
- **DFR-006 — Historical design freeze:** Approved historically and explicitly lifted on 2026-10-29. Implementation was authorized; the corrected ERD still requires explicit approval before Prisma models or migrations.
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

**NOT READY** — the three structural findings ERD-R02, ERD-R03, and ERD-R04 have been represented in the conceptual ERD and data model. DDD-005 policy decisions now include the approved role catalogue/scopes, four-role permission matrix, explicit-deny scope/precedence and independent administration/audit controls, role-pair classifications, and independent-review workflow. Remaining DDD-005 work is stable permission identifiers, complete permission/resource mapping, physical deny representation/enforcement, overlap/duplicate constraints beyond the approved role-pair classifications, and authorization tests. Other product-policy blockers DDD-006 through DDD-012 and DDD-015, DDD-002 category transition/history, DDD-014 non-authentication retention, DDD-004 appointment lifecycle, and DDD-013 physical validation remain. This register does not approve the ERD or authorize Prisma models/migrations.
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

### DDD-005 — Authorization scope and permission precedence

- **Status:** PARTIALLY RESOLVED on 2026-10-31.
- **Decision:** The project owner approved the initial role categories/scopes, action-specific permission groups, additive grants, explicit deny-overrides-allow, strict scope enforcement, no title-seniority override, four-role permission matrix, explicit-deny scope/precedence and independent administration/audit controls, all specified role-pair classifications, and the independent-review workflow.
- **Decision record:** [DDD-005 Authorization Scope and Permission Precedence](../decisions/DDD-005-AUTHORIZATION-SCOPE-AND-PERMISSION-PRECEDENCE.md).
- **Approver:** Project owner.
- **Approval date:** 2026-10-31.
- **Remaining:** Stable permission identifiers, complete permission-to-resource/scope mapping, technical representation/enforcement of denies, and assignment/appointment duplicate or overlap constraints not covered by the approved role-pair classifications. DDD-004 mid-year creation, early ending, and replacement lifecycle details remain open.

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

DDD-005 is partially resolved as recorded above; the role catalogue, four-role grant matrix, explicit-deny policy/administration, role-pair classifications, and independent-review workflow are approved. Stable permission/resource mapping, physical deny representation/enforcement, overlap/duplicate constraints beyond approved role pairs, and authorization tests remain open. DDD-006 through DDD-011 and DDD-015 remain blocked to the extent stated in their entries. DDD-012 is partially resolved as recorded above; its remaining actor/access-scope controls remain blocked. DDD-014 remains blocked for non-authentication business records. DDD-002 category transition/history rules not expressly covered above remain open. None of these resolutions approves the ERD or a physical schema.

## 10. Current implementation gate

The recovered database documents are restored and the decisions above are recorded for reconciliation. The ERD remains a proposed design. DDD-013's authentication slice is not ERD-ready until the approved CR-01 through CR-06 contracts are physically modeled and validated against the consistency-review checklist. No Prisma models or migrations are authorized until the user formally approves the corrected ERD.


### DDD-005 approval update — explicit denies and role conflicts — 2026-10-31

The project owner approved all four groups in [DDD-005 Explicit-Deny and Role-Conflict Approval](../decisions/DDD-005-EXPLICIT-DENY-AND-ROLE-CONFLICT-PROPOSAL.md) without modification. The approved policy defines permission/resource-scoped deny precedence, independently authorised deny administration and immutable audit history, all role-pair classifications, and independent approval before review-required combinations become effective. Physical representation remains undecided. Stable permission identifiers, full permission/resource mapping, overlap/duplicate constraints beyond the role-pair table, and DDD-004 mid-year/early-ending/replacement lifecycle remain open.


### DDD-005 follow-up — stable permission catalogue approval — 2026-10-31

The project owner approved all five review points in the [DDD-005 Stable Permission Catalogue and Resource-Scope Mapping](../decisions/DDD-005-STABLE-PERMISSION-CATALOGUE-AND-RESOURCE-SCOPE-PROPOSAL.md) without modification. The lowercase dot-separated permission identifiers, complete logical permission-to-resource mapping, seven scope labels, and role-grant reconciliation are approved as the stable authorization policy contract. Previously approved grants remain unchanged; HOLD entries remain withheld; NO GRANT is not an explicit deny; CONDITIONAL requires a separate valid assignment and scope. Local Church Youth Assistant member visibility remains limited with exact fields deferred; District Departmental Coordinator member visibility remains HOLD.

Logical targets and workflow boundaries are approved as policy mappings only. Unresolved persistence targets do not imply new entities. Physical deny representation/enforcement, exact assistant field visibility, department participation lifecycle under DDD-006, leadership nomination persistence/authority, audit/system access persistence, appointment lifecycle/overlap constraints, and implementation verification remain open as applicable.

**DDD-005 stable catalogue approval does not authorize Prisma, migrations, physical schema, or application code. The corrected ERD remains subject to separate explicit project-owner approval.**
