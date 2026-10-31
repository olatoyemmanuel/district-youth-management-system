# DYMS Phase 1 ERD Approval Package

**Project:** District Youth Management System (DYMS)  
**Product scope:** v1.0, Sango District  
**Status:** APPROVED by the project owner on 2026-10-31. See [formal approval record](../decisions/PHASE-1-CONCEPTUAL-ERD-APPROVAL.md).  
**Working branch:** `phase-1/requirements-consolidation`  
**Pull request:** https://github.com/olatoyemmanuel/district-youth-management-system/pull/53

## 1. Purpose of this package

This package brings together the Phase 1 requirements, domain boundaries, conceptual ERD, integrity/security review, and traceability evidence. It is intended to support an informed project-owner decision on the logical data model.

It does not authorize application implementation, Prisma schema changes, migrations, or physical database schema creation. The user must explicitly approve the consolidated ERD before any such work begins. Approval of this conceptual ERD should be treated as approval to proceed to the next agreed physical-design stage only, unless the project owner separately authorizes implementation.

## 2. Documents in this review package

8. [Phase 2 Physical Database Design](./PHASE-2-PHYSICAL-DATABASE-DESIGN.md)  
   PostgreSQL-oriented table/column proposal, keys, constraints, indexes, scope integrity, transaction controls, and physical-design blockers. This is a working proposal only and is not approved for implementation.
9. [Phase 2 Physical Database Design Review](./PHASE-2-PHYSICAL-DATABASE-DESIGN-REVIEW.md)  
   Independent consistency review with 12 findings, severity, required revisions, and acceptance tests. The physical design needs revision before approval.

1. [Phase 1 Requirements Consolidation](../product/PHASE-1-REQUIREMENTS-CONSOLIDATION.md)  
   Consolidated business and platform requirements, scope, approved rules, open decisions and implementation gate.

2. [Phase 1 Testable Requirements](../product/PHASE-1-TESTABLE-REQUIREMENTS.md)  
   Acceptance criteria with explicit status labels: approved rule, derived requirement, policy gap, and proposed control.

3. [Phase 1 Requirement-to-ERD Traceability](../product/PHASE-1-REQUIREMENT-TO-ERD-TRACEABILITY.md)  
   Crosswalk for the 97 requirement IDs currently enumerated in the detailed testable requirements document.

4. [Phase 1 Domain Boundaries](./PHASE-1-DOMAIN-BOUNDARIES.md)  
   Bounded contexts, ownership, module responsibilities and cross-domain workflows.

5. [Phase 1 Conceptual ERD](./PHASE-1-CONCEPTUAL-ERD.md)  
   Candidate entities, attributes, relationships, cardinalities, history, scope, integrity and transaction boundaries.

6. [Phase 1 Conceptual ERD Diagrams](./PHASE-1-CONCEPTUAL-ERD-DIAGRAMS.md)  
   Mermaid relationship diagrams grouped by bounded context. These are visual companions to the full conceptual model.

7. [Phase 1 ERD Integrity Review](./PHASE-1-ERD-INTEGRITY-REVIEW.md)  
   Ten design refinements and the security, data-integrity, policy and governance review.

## 3. Conceptual model coverage

The ERD covers these bounded contexts:

- Identity and account
- Member category and church membership
- Organization and department membership
- Leadership appointments and authorization
- Events, registration, sessions and attendance
- Finance accounts, transactions, approvals, payments and reversals
- Credentials and evidence
- Notifications and external integrations
- Audit, security sessions, idempotency and retention
- Reporting

The model preserves historical records and uses explicit scope. It distinguishes a member's primary category, department participation, leadership appointment, application role, and credential as separate concepts.

## 4. Owner-approved rules preserved

The current package preserves the following explicit decisions:

- Frozen DFR-001 through DFR-006.
- One active primary member category; category history retained; Master Guide is a credential.
- Member-initiated church transfer, receiving church acceptance, district approval, and approved effective date.
- Higher-authority appointment approval, fresh approval for renewal, annual term handling, no conflicting active holder in the same position/scope, and appointment history.
- Deny-by-default authorization, explicit deny precedence within its scope, no scope expansion through role accumulation, and role-conflict controls.
- Member-requested department membership, coordinator approval, multiple concurrent departments, withdrawal/authorized termination, and no leadership authority from membership alone.
- District event approval before publication, controlled registration, attendance linked to DYMS members, correction history, and event retention.
- Financial account ownership by organizational scope, one currency per account, separation of duties, controlled transaction lifecycle, and linked reversal for posted corrections.
- Controlled credential definitions and issuances, with recognized governing authority required for qualification rules.
- Append-only audit history, actor attribution, and restricted audit access.
- Idempotent sensitive operations.
- Retention schedules and legal/investigation holds, without inventing retention periods.
- The seven user-approved DDD-015 notification and integration principles.
- Every member has an individual user account and login. No shared, guardian-operated, guardian-managed or delegated guardian-to-child account model.

## 5. Unresolved policy and evidence items

These items remain open because they require official church policy, a designated authority, or a project-owner decision. They are not silently filled with invented rules.

| Area | Outstanding matter | ERD impact |
|---|---|---|
| Member categories | Eligibility, age/class requirements, verification evidence and exceptions | Category assignment rule/evidence details |
| Younger members | Safe onboarding and identity verification for individual accounts | Account/member onboarding constraints |
| Church transfers | Cancellation/rejection authority, appeals, duplicate pending requests and backdating | Transfer workflow states and decision records |
| Appointments | Acting appointments, overlap exceptions, precedence and termination authority | Appointment subtype/state constraints |
| Authorization | Complete permission catalogue, supported scope map, independent roles and conflict matrix | Final role/permission/scope constraints |
| Departments | Eligibility, renewal, appeals and effect of church transfer | Membership lifecycle and validation |
| Events | Local approval, mandatory registration, late registration, capacity exceptions, refunds and postponement | Event approval/registration lifecycle |
| Attendance | Registration prerequisite, self-check-in, QR expiry, offline sync and late/early statuses | Attendance mode and capture constraints |
| Finance | Account multiplicity, approval thresholds, accounting treatment, partial/failed payments, reimbursements and budgets | Transaction, approval, payment and budget details |
| Credentials | Official qualification requirements, issuer authority, expiry, revocation and disclosure | Credential definition and issuance validation |
| Audit | Audit-access authority, security investigators and emergency access | Audit permission model |
| Retention | Official retention periods, triggers, approvers and disposal rules | Retention schedule and destructive-action constraints |
| Integrations | Provider selection, retry ceilings and monitoring targets | Provider configuration and delivery policy |

No age threshold, credential standard, church policy, finance approval limit, or retention duration is invented in this package.

## 6. Repository governance issue

The README states that DFR-006 was lifted on 2026-10-29, while the decision register records the formal design freeze. The project owner's current instruction requires DFR-001–DFR-006 to remain frozen and prohibits implementation before final ERD approval.

For this Phase 1 work, the current explicit owner instruction is controlling. The repository governance records must be reconciled in a separately reviewed documentation change before implementation. This package does not alter the README or frozen decision register.

## 7. Technical design decisions deferred until after ERD approval

The following should be settled in physical design and implementation planning, not treated as unresolved business policy:

- Concrete relational representation of organizational scope with enforceable foreign keys.
- Exact database constraints, indexes and conditional uniqueness implementation.
- Idempotency key digest, lease, retention and concurrency strategy.
- Transaction isolation and locking strategy.
- Webhook ordering, replay handling and reconciliation implementation.
- Queue retry/backoff and monitoring configuration.
- Reporting read-model or materialized-view strategy.
- File/object storage metadata and secure access implementation.

These choices must preserve the approved conceptual relationships and invariants.

## 8. Review findings

The integrity review found ten areas requiring precision. They have been incorporated into Section 20 of the conceptual ERD:
1. Exact account/member cardinality.
2. Supported organizational scope targets.
3. Appointment/role/permission separation.
4. Decision and approval history.
5. Attendance uniqueness for event-level and session-level capture.
6. Financial amount and reversal semantics.
7. Idempotency and webhook identity.
8. Audit actor and payload minimization.
9. Retention target and hold integrity.
10. Provider event processing.

The ERD is a coherent working model, but the policy/evidence items above remain open. Final approval should be based on the ERD plus this package, not on the entity list alone.

## 9. Formal project-owner decision

**Decision: APPROVED.** On 2026-10-31, the project owner explicitly approved the conceptual ERD at exact revision `25f2813e0256d9472daded45657dfb7ac9f70a43`. The formal record is [Phase 1 Conceptual ERD Approval](../decisions/PHASE-1-CONCEPTUAL-ERD-APPROVAL.md).

This approval authorizes progression to physical database design only. It does not authorize application code, Prisma schema changes, migrations, or physical database schema implementation.

The following outcomes describe the decision process for any future material revision:

- **Approve the conceptual ERD:** Authorizes preparation of the physical database design and implementation plan, but does not by itself authorize application code, Prisma schema, migrations, or database schema changes.
- **Approve with specified amendments:** The requested amendments are recorded, applied, and re-reviewed before the ERD is marked approved.
- **Request revision:** The ERD remains a working draft and no implementation begins.

Any approval must identify the exact ERD revision/commit being approved. Material changes after approval require documented change control.

## 10. Implementation gate

The conceptual ERD approval gate is now closed for the exact approved revision. The following implementation restrictions remain in force until separate explicit authorization:
- Do not add domain models to `backend/prisma/schema.prisma`.
- Do not create or run Prisma migrations.
- Do not create physical database tables or schema objects.
- Do not begin application implementation based on this draft.
- Do not merge this draft PR as an implementation authorization.

**Current status: Conceptual ERD approved. A working Phase 2 physical database design proposal and a 12-finding review have been prepared. The physical design requires revision and is not yet approved. Application/Prisma/migration/database implementation remains unauthorized.**
