# DYMS ERD Review Findings — 2026-10-31

## 1. Review disposition

**NOT READY FOR FORMAL ERD APPROVAL.**

This review covers the restored conceptual ERD, its companion domain model, traceability matrix, invariant register, database decision register, and DDD-013 authentication-idempotency specification and consistency review.

The review is documentation and design analysis only. It does not approve a physical schema, Prisma models, migrations, or implementation.

## 2. Findings

### ERD-R01 — Requirements traceability file was restored from the wrong source

- **Severity:** Critical
- **Location:** `REQUIREMENTS-TRACEABILITY.md`
- **Finding:** The first restoration contained the contents of `ERD-FINAL-REVIEW.md` under the traceability filename. This made the companion evidence record invalid and caused cross-document references to point to the wrong material.
- **Correction:** The file has now been restored from the October 30 source snapshot titled `DYMS Requirements Traceability Matrix`, and its decision reconciliation section has been reapplied.
- **Status:** Corrected on this branch; must be reviewed in the final diff.

### ERD-R02 — Category and affiliation policy is approved, but the ERD does not model it

- **Severity:** High
- **Location:** ERD §3.4 and §11; DATA-MODEL §§4.2, 11.1, 16.2
- **Finding:** The approved rule distinguishes three top-level categories from Senior Youth affiliations. A 21-year-old may hold both Ambassador and Young Adult affiliations with local ministry approval. Public Campus Ministry is an additional affiliation, and Master Guide is a credential/training pathway. The current entity inventory has no explicit affiliation entity or relationship, and the relationship diagrams do not show how the affiliations are stored or approved.
- **Impact:** A future schema could accidentally encode Ambassador and Young Adult as mutually exclusive categories, fail to preserve simultaneous affiliation, or conflate category, affiliation, and credential.
- **Required resolution:** Add an explicit conceptual representation for member category and ministry affiliation, including the local-approval record/authority needed for age-21 dual affiliation. Keep category transition, effective-date, and history rules open until decided. Do not infer a one-active-category constraint.

### ERD-R03 — DDD-013 authentication identity scope is not represented in the ERD

- **Severity:** Critical
- **Location:** ERD §§2.1, 9.1, 9.4–9.7, 11.2; DATA-MODEL §11.1; DDD-013 consistency review §5
- **Finding:** The current audit/idempotency relationship diagram models `USER` as the owner of every `IDEMPOTENCY_RECORD`. The approved DDD-013 contract requires mutually exclusive authenticated and pre-authenticated scope modes. The ERD does not show the pre-authentication context relationship or its lifecycle.
- **Impact:** The current relationship cannot represent unauthenticated login and password-reset idempotency correctly. It also risks treating a nullable User foreign key as sufficient identity scoping, despite the approved PostgreSQL uniqueness decision.
- **Required resolution:** Model the pre-authentication context and the authenticated/pre-authenticated scope modes explicitly. Show the approved uniqueness/index strategy conceptually, then verify exact predicates and foreign keys during physical design.

### ERD-R04 — DDD-013 outbox and protected reset-secret boundary are absent from the ERD inventory

- **Severity:** High
- **Location:** ERD §§2.1, 9, 11.2; DATA-MODEL §11.1; DDD-013 AUTH-IDEM-039 and consistency review §5
- **Finding:** DDD-013 requires a transactional outbox reference and a separate envelope-encrypted, short-lived reset-delivery secret store. Queue messages carry opaque references only. The current 28-entity inventory contains neither a conceptual outbox record nor a clearly drawn external secret-store boundary.
- **Impact:** The ERD does not demonstrate how reset-token creation, idempotency completion, outbox persistence, and secret delivery are coordinated without placing raw secrets in ordinary database or queue payloads.
- **Required resolution:** Add the outbox persistence relationship and show the secret-store boundary as an external component/reference, not as a raw-secret column. Decide whether recovery metadata and tombstone identity are fields on the idempotency record or separate records. Keep vendor selection outside the ERD unless separately approved.

### ERD-R05 — Authentication idempotency retention is not reflected in the entity catalogue and generic ERD text

- **Severity:** High
- **Location:** ERD §9.4–9.7; DATA-MODEL §11.1; DDD-013 specification §§6, 12.2
- **Finding:** The generic ERD text says key scope, fingerprint, retention, state, and replay are still implementation decisions. The approved DDD-013 contract already defines these policies for authentication operations, including 24-hour response retention and 30-day tombstones. The data-model entity catalogue previously marked all idempotency policy as blocked.
- **Correction:** The generic ERD text and entity catalogue have been partially qualified to distinguish authentication from non-authentication idempotency.
- **Remaining resolution:** Complete the authentication ERD representation of operation states, response retention, tombstones, recovery outcomes, HMAC key version, and exact authenticated/pre-authenticated indexes. Keep business-domain idempotency separately blocked.

### ERD-R06 — Several data-model catalogue entries still carry stale policy statuses

- **Severity:** High
- **Location:** DATA-MODEL §11.1
- **Finding:** The original catalogue described appointment renewal and authentication record retention as unresolved even though DDD-004 and the authentication subset of DDD-014 have since been approved.
- **Correction:** Appointment, refresh-token, password-reset, security-event, and idempotency catalogue descriptions have been updated to reflect the approvals and remaining boundaries.
- **Remaining resolution:** Recheck the complete catalogue row by row against the decision register before sign-off.

### ERD-R07 — Appointment approval is conditional, but the ERD does not define the state-dependent actor constraint

- **Severity:** Medium
- **Location:** ERD §4.2.1 and appointment relationship diagram; DATA-MODEL §11.1
- **Finding:** The diagram shows optional creator, approver, and ending actor references. DDD-004 requires higher-authority appointment/renewal and no self-appointment or self-renewal. The text says an approver is required once the appointment is approved/active, but the state-dependent rule and representation of a non-human/system actor remain unresolved.
- **Required resolution:** Retain the distinction between subject, creator, approver, and ending actor. Specify the conditional approver requirement for approved/active appointments and resolve the system-actor representation under DDD-012. Do not collapse actor roles into one generic User reference.

### ERD-R08 — Primary church and membership history require a single-current-record invariant

- **Severity:** Medium
- **Location:** ERD §3.2; DATA-MODEL §4.3 and §11.1; invariant IM-03–IM-05
- **Finding:** The model stores the current church on Member and also stores effective-dated church-membership history. The approved policy requires one current primary church and atomic transfer with preserved history. The design still needs to prove that the current Member reference and the one current history record cannot diverge.
- **Required resolution:** Define the invariant that the Member's current church matches exactly one open/current history row, and choose the reviewed transaction/constraint/concurrency strategy during schema design. IM-05 should be Proposed rather than Blocked because the product policy is approved and the remaining work is technical enforcement.

### ERD-R09 — Decision and invariant statuses need consistent scope labels

- **Severity:** Medium
- **Location:** DATABASE-DESIGN-DECISION-REGISTER §§3, 9; INVARIANT-ENFORCEMENT-REGISTER §§2, 4
- **Finding:** Historical entries can still display BLOCKED or EVIDENCE REQUIRED while later appendices resolve the same policy question. Generic idempotency invariants also need to distinguish authentication from non-authentication domains.
- **Correction:** The DDD-013 main entry and AD-04/AD-05 invariants have been qualified to distinguish authentication policy from unresolved business-domain policy. IM-05 has been reclassified as Proposed.
- **Required resolution:** Apply the same status reconciliation to DDD-001 through DDD-004 and DDD-014 in their main entries, not only in the appended resolution section.

### ERD-R10 — Final review checklist contains superseded blockers

- **Severity:** Medium
- **Location:** ERD-FINAL-REVIEW.md §§4–7
- **Finding:** The original blocker table still says the PRD baseline, User–Member cardinality, appointment renewal, and authentication idempotency policy are unresolved. Later section 8 records the approvals but does not clearly replace every old blocker row.
- **Required resolution:** Update the blocker table and approval checklist to show the current partial/resolved states and the remaining technical gaps. The final disposition remains NOT READY.

### ERD-R11 — Restoration artifacts contain copied terminal prompts and references to a missing decision-update file

- **Severity:** Low
- **Location:** Restored Markdown documents
- **Finding:** Several restored snapshots contained terminal prompt lines. Some text referred to `DOMAIN-DECISION-APPROVAL-UPDATE-2026-10-30.md`, which was not part of the restored file set.
- **Correction:** Terminal prompt artifacts were removed from the principal restored documents, and the data-model reference now points to the database decision register.
- **Status:** Corrected in the principal documents; perform a final repository-wide search for residual prompt artifacts and broken relative links.

## 3. Current approved decisions reflected

- DDD-001: PRB-001 v0.1 is the reconstructed, versioned working baseline. The historical original PRD remains unrecovered.
- MEM-02: one-to-one User–Member cardinality is approved.
- DDD-002: category/affiliation classification and age-21 dual affiliation with local approval are approved; category transition/history details remain open.
- DDD-003: one current primary church and atomic history-preserving transfers are approved; physical concurrency enforcement remains proposed.
- DDD-004: Jan 1–Dec 31 annual appointments, new historical appointment on renewal, higher-authority appointment/renewal, and no self-appointment/self-renewal are approved. DDD-005 role-pair classifications are now approved; DDD-004 mid-year/early-ending/replacement lifecycle and technical overlap/duplicate enforcement remain open.
- DDD-013: AUTH-IDEM-001–041 and CR-01–CR-06 are approved. Policy consistency passes; the authentication ERD slice remains NOT READY pending physical modeling and verification.
- DDD-014: authentication retention is approved for sessions (12 months), refresh-token history (12 months), password-reset records (90 days), and security events (24 months), subject to legal holds/investigations. Audit-log and other business-domain retention remain unresolved.
- DFR-006: historical design freeze was lifted on 2026-10-29. The explicit ERD approval gate remains.

## 4. Remaining product-policy blockers

- DDD-005: stable permission identifiers and complete permission-to-resource scope mapping, technical explicit-deny representation/enforcement, and assignment/appointment duplicate or overlap constraints beyond approved role-pair classifications. The initial role categories, scopes, permission groups, combination precedence, and four leadership-role grant matrix were approved on 2026-10-31.
- DDD-006: department membership lifecycle and eligibility.
- DDD-007: event ownership and registration lifecycle.
- DDD-008: duplicate attendance scans, correction concurrency and retention.
- DDD-009: finance account scope, requiredness, currency and numbering.
- DDD-010: finance workflow, authority, thresholds and posting/reversal lifecycle.
- DDD-011: credential catalogue, eligibility, issuer authority, verification disclosure and retention.
- DDD-012: audit actor representation and audit access policy.
- DDD-014: non-authentication business-record and audit-log retention.
- DDD-015: external-event delivery and recovery outside the approved authentication-specific contract.
- DDD-002: category transitions, effective dating and category history.

## 5. Recommendation

Do not formally approve the ERD yet. First resolve ERD-R02 through ERD-R05 and update the final review/checklists and all decision-status rows. Then perform a fresh cross-document consistency pass and present the corrected ERD for explicit approval.

No Prisma models, migrations, or database schema changes are authorized by this review.

## 6. Structural remediation verification — 2026-10-31

The conceptual corrections for ERD-R02, ERD-R03, and ERD-R04 have been applied to ERD.md and DATA-MODEL.md:

- ERD-R02: added MINISTRY_AFFILIATION, MEMBER_MINISTRY_AFFILIATION, and MINISTRY_AFFILIATION_APPROVAL; separated the top-level member category from affiliation and credential; represented local approval for age-21 dual Ambassador/Young Adult affiliation.
- ERD-R03: added PRE_AUTH_CONTEXT and the mutually exclusive authenticated/pre-authentication idempotency scope modes. The pre-auth context is independent of a User.
- ERD-R04: added OUTBOX_MESSAGE, linked it to the password-reset token and idempotency operation, and specified an external envelope-encrypted short-lived secret store referenced only by opaque identifier.

The entity inventory is 33 conceptual entities. The secret store is an external component, not a database entity. DDD-013 remains NOT READY for physical schema authorization until exact scope indexes, constraints, lifecycle links, worker access, secret-store integration, and endpoint-level recovery/replay tests are verified.

## 7. Updated policy reconciliation

DDD-012 is partially resolved based on the user's approvals recorded in PRs #4, #5, #6, #8, and #9: role-based access and access logging; Audit Viewer and Audit Administrator responsibilities; sole appointment/revocation authority vested in one System Administrator; and controlled bootstrap provisioning. Remaining actor taxonomy, record scopes, masking, exports, access reviews, break-glass, and audit-of-audit retention remain open.

DDD-002 is partially resolved: category/affiliation concepts and age-21 local approval are now represented; category transition/history policy remains open. DDD-001, DDD-003, DDD-004, DDD-013, and the authentication subset of DDD-014 retain their recorded approved/partially resolved boundaries. DDD-005 is partially resolved by the 2026-10-31 approval of the initial roles, scopes, permission groups, additive grants, explicit-deny precedence, strict scope enforcement, and four leadership-role grant matrix; stable permission identifiers, complete resource mapping, physical deny representation/enforcement, and overlap/duplicate constraints beyond approved role-pair classifications remain open. DDD-006 through DDD-011 and DDD-015 remain blocked or partially resolved as listed in the decision register. DDD-014 remains blocked for non-authentication records.

**Disposition:** ERD-R02 through ERD-R04 have conceptual corrections applied. The ERD remains NOT READY for formal approval pending the physical DDD-013 validation and remaining policy blockers. No Prisma schema, migration, or database implementation is authorized.


### 7.1 DDD-005 approval update — 2026-10-31

The project owner approved all four DDD-005 proposal groups without modification. The approved initial roles, scopes, permission groups, additive permission combination, explicit-deny precedence, strict resource-scope enforcement, and no title-seniority override are recorded in [DDD-005 Authorization Scope and Permission Precedence](../decisions/DDD-005-AUTHORIZATION-SCOPE-AND-PERMISSION-PRECEDENCE.md).

At the time of this 7.1 update, the detailed role-to-permission matrix remained open. It was subsequently approved for the four leadership roles in §7.2. The permission-to-resource mapping, exact explicit-deny representation, prohibited/review-required role-combination matrix, appointment overlap/duplicate constraints, and DDD-004 mid-year/early-ending appointment lifecycle remain unresolved. ERD status remains NOT READY. No Prisma schema or migration is authorized.


### 7.2 DDD-005 role-to-permission matrix approval — 2026-10-31

The project owner approved the proposed role-to-permission matrix without modification for District Youth Leader, District Departmental Coordinator, Local Church Youth Leader, and Local Church Youth Assistant. The approved matrix is recorded in [DDD-005 Approved Role-to-Permission Matrix](../decisions/DDD-005-ROLE-PERMISSION-MATRIX-PROPOSAL.md). Its concrete grants and resource-scope limits are approved. HOLD entries remain withheld pending their domain decisions and are not grants or explicit denies.

The ERD remains NOT READY. Remaining DDD-005 questions are stable permission identifiers and complete resource mapping, explicit-deny representation and administration, specific role-conflict combinations, and appointment overlap/duplicate constraints. DDD-004 mid-year and early-ending appointment rules remain unresolved. No Prisma schema or migration is authorized.


### 7.3 DDD-005 explicit-deny and role-conflict approval — 2026-10-31

The project owner approved all four groups without modification. The approved policy defines permission/resource-scoped deny precedence, independent deny administration and immutable audit history, all role-pair classifications, and independent approval before review-required combinations become effective. Physical restriction representation remains undecided. The ERD remains NOT READY; no Prisma schema, migration, or database implementation is authorized.
