# DDD-005: Explicit-Deny Representation and Assignment-Conflict Technical Proposal

- Status: DRAFT FOR PROJECT-OWNER REVIEW
- Decision: DDD-005 technical follow-up
- Date prepared: 2026-10-31
- Applies to: DYMS v1.0, Sango District
- Related decisions: DDD-004, DDD-005, DDD-012
- Policy approval: Existing explicit-deny, role-combination, permission-catalogue and resource-scope decisions remain approved
- This proposal approval: NOT APPROVED
- Implementation status: NOT IMPLEMENTED
- Schema/migration authorization: NOT GRANTED

## 1. Purpose and boundary

This proposal translates the already approved DDD-005 authorization policy into a reviewable logical technical design for:
1. Representing explicit access restrictions without confusing them with role grants, missing grants, HOLD, NO GRANT, expired appointments, account suspension, or membership state.
2. Enforcing the approved prohibited and review-required role combinations across valid assignments and appointment periods.
3. Detecting duplicate or overlapping assignment/appointment records without inventing appointment lifecycle rules that remain unresolved under DDD-004.

The stable permission identifiers and logical resource mappings are approved in [the DDD-005 Stable Permission Catalogue](DDD-005-STABLE-PERMISSION-CATALOGUE-AND-RESOURCE-SCOPE-PROPOSAL.md). The role-pair classifications and explicit-deny policy are approved in [the DDD-005 Explicit-Deny and Role-Conflict Policy](DDD-005-EXPLICIT-DENY-AND-ROLE-CONFLICT-PROPOSAL.md).

This document is a technical proposal only. It does not amend approved policy, approve a new role or permission, resolve DDD-004 mid-year creation/early-ending/replacement rules, or authorize a physical schema, Prisma model, migration, API, or application code.

## 2. Explicit-deny logical representation

### 2.1 Recommendation: a distinct access-restriction concept

Represent each explicit deny as a distinct, first-class access-restriction record. Do not encode denies as:
- A negative or special row in `ROLE_PERMISSION`.
- A missing `ROLE_PERMISSION` grant.
- A HOLD or NO GRANT catalogue state.
- An expired or revoked `ROLE_ASSIGNMENT` or `APPOINTMENT`.
- An account suspension or membership status.

The restriction targets one actor, one approved permission identifier, and one resolvable logical resource scope. A restriction does not grant access and does not modify the underlying role assignment.

### 2.2 Required logical attributes

| Attribute | Requirement |
|---|---|
| Restriction identity | Stable unique identifier for the restriction. |
| Subject actor | The User whose access is restricted. |
| Permission | One identifier from the approved stable permission catalogue. |
| Resource target | Resource type and exact target/scope reference required to evaluate the restriction. |
| Scope mode | Explicit approved scope mode; no implicit descendant expansion. |
| Reason | Required human-readable reason and, where policy requires, a reason category. |
| Effective start | Required timestamp from which the restriction applies. |
| Expiry | Optional expiry timestamp; if present it must be later than the effective start. |
| Review due | Required for temporary/permanent review policy as applicable; must not be mistaken for automatic expiry. |
| Issuer | Separately authorised actor who created the restriction. |
| Lifecycle | Proposed states: scheduled, active, expired, revoked. |
| Revocation | Actor, timestamp, and reason; revocation does not delete the restriction. |
| Creation metadata | Creation timestamp and request/audit correlation. |

The logical target must resolve to a resource type and target compatible with the permission catalogue. For example, a church-scoped member permission restriction targets the named church context, not an arbitrary client-supplied identifier. The authorization service resolves the target's actual organizational relationship on every protected operation.

A restriction's review date is a governance reminder, not an access-state transition. An expired restriction ceases to apply according to its effective period. A revocation is an explicit lifecycle event and must retain the original restriction and history.

### 2.3 History and audit

Recommendation:
- Preserve the restriction's original issuer, subject, permission, target, reason, and effective start.
- Record creation, attempted use, review, amendment, expiry, and revocation as append-only audit/security events.
- Treat changes to a restriction's scope, subject, permission, or reason as a new version or a new restriction plus a linked supersession event. Do not silently overwrite the original decision.
- Record failed and denied attempts where feasible, including the actor, permission, target, outcome, timestamp, and correlation identifier. Do not put secrets in audit payloads.
- Enforce the approved rule that the affected actor cannot create, approve, modify, or revoke their own restriction.
- Require the applicable separately authorised authority for restriction creation/revocation. Do not assume that System Administrator, Audit Administrator, or an operational leadership role has this authority unless an explicit approved permission is assigned. DDD-012's Audit Administrator authority is not general access-restriction administration authority.

### 2.4 Authorization evaluation

For each protected operation, the server should:
1. Resolve the authenticated User and current account/security state.
2. Resolve valid role assignments and appointment state where required.
3. Resolve the permission identifier and target resource from the operation, not from client assertions.
4. Collect applicable grants from independently valid assignments and preserve each grant's own scope.
5. Resolve restrictions matching the subject, permission, target resource, scope mode, and effective period.
6. Deny if any applicable explicit restriction matches, even when another assignment grants the permission.
7. Apply all other business rules and separation-of-duties constraints. A restriction can only reduce access; it cannot bypass another control.
8. Fail closed for the affected operation if a restriction's target or scope cannot be resolved unambiguously.
9. Record the authorization outcome using the approved audit policy, including denied access attempts where feasible.

A narrow church or department restriction must not affect sibling resources. Descendant-resource coverage is allowed only where the approved permission's scope mapping expressly defines it. Never infer hierarchy expansion from a role title.

## 3. Assignment and appointment conflict enforcement

### 3.1 Separate concepts

Keep these concepts distinct:
- Role catalogue entry: the type of role.
- Role assignment: the actor's assignment to a role and its organizational scope.
- Appointment: the leadership appointment that activates or governs an appointment-required role assignment.
- Combination review: independent approval required before a review-required role combination becomes effective.
- Explicit restriction: a permission/resource-specific deny, independent of assignment validity.

A role assignment and its appointment must agree on subject Member, role, scope, and relevant validity. A valid assignment does not bypass appointment requirements. An appointment does not widen the assignment's scope.

### 3.2 Conflict evaluation matrix

Apply the approved DDD-005 classifications unchanged:

| Combination | Enforcement outcome |
|---|---|
| District Youth Leader + District Departmental Coordinator | Allow only with separate valid appointments and independent scopes. |
| District Youth Leader + Local Church Youth Leader | Allow only with separate valid appointments; no inherited church scope. |
| District Youth Leader + Local Church Youth Assistant | Keep inactive pending independent review approval. |
| District Departmental Coordinator + Local Church Youth Leader | Allow only with separate valid appointments and independent scopes. |
| District Departmental Coordinator + Local Church Youth Assistant | Allow only with separate valid appointments and independent scopes. |
| Local Church Youth Leader + Local Church Youth Assistant in the same church | Reject concurrent activation. |
| Local Church Youth Leader + Local Church Youth Assistant in different churches | Keep inactive pending independent review approval. |
| Local Church Youth Leader in multiple churches for the same Member | Keep additional concurrent assignment inactive pending independent review approval. |
| District Departmental Coordinator in multiple departments for the same Member | Keep additional concurrent assignment inactive pending independent review approval. |
| System Administrator + any leadership role | Reject concurrent activation. |
| System Administrator + Audit Administrator | Reject concurrent activation. |
| System Administrator + Audit Viewer | Keep inactive pending independent review approval. |
| Audit Administrator + Audit Viewer | Allow only with separately authorised audit scopes. |
| Audit Administrator + operational leadership role | Keep inactive pending independent review approval. |
| Audit Viewer + operational leadership role | Allow only with separately authorised audit scope. |

A review-required combination is not provisionally active while waiting for review. The reviewer must be authorised and independent of the affected Member. Approval is specific to the reviewed combination and its stated assignments/scopes; it does not grant additional permissions or merge scopes.

### 3.3 Duplicate and overlap detection

The authorization/appointment workflow must detect at least:
- Duplicate active assignment for the same Member, role, and identical scope.
- Duplicate appointment for the same Member, role, and scope over the same effective period.
- Two active appointments that represent the same prohibited role pair within the same church.
- Concurrent appointments for a review-required role combination without recorded independent approval.
- An assignment whose appointment is missing, expired, ended, revoked, or belongs to a different Member, role, or scope.
- Conflicting active records where scope or role identity cannot be resolved unambiguously.

Do not reject all overlapping appointments indiscriminately. Some combinations are explicitly allowed when they have separate valid appointments and independent scopes. Some are review-required. Some are prohibited. Enforcement must use the approved classification table rather than a generic "one active role per Member" rule.

For temporal comparisons, use half-open effective intervals `[start, end)` as a technical comparison convention only, so adjacent non-overlapping periods do not count as concurrent. This convention does not decide the still-open DDD-004 rules for mid-year creation, early ending, replacement, or appointment state transitions. Those business rules must be approved before physical constraints are designed.

### 3.4 Concurrency and transaction boundary

Recommendation for later implementation design:
- Re-evaluate role-pair conflicts and review status within the same transaction that activates an assignment or appointment.
- Serialize competing activations for the same Member, or use an equivalently proven concurrency-control mechanism.
- Ensure two concurrent requests cannot both pass a conflict check using stale snapshots.
- Commit assignment/appointment activation, independent review evidence where applicable, and required audit events atomically.
- Return a deterministic conflict outcome when another transaction wins or a prohibited/review-required combination is detected.
- Do not delete or rewrite historical assignments and appointments to resolve a conflict.

The exact PostgreSQL locking strategy, exclusion/unique constraints, indexes, and transaction isolation remain physical-schema design items and are not selected here.

## 4. Invariants to carry into the corrected ERD and test plan

| ID | Invariant |
|---|---|
| DDD005-AR-01 | An explicit restriction is separate from role grants, HOLD, NO GRANT, missing grants, account state, and appointment state. |
| DDD005-AR-02 | A restriction identifies one subject actor, one stable permission identifier, and one resolvable logical resource scope. |
| DDD005-AR-03 | Any matching active restriction overrides every applicable allow for that permission/resource operation. |
| DDD005-AR-04 | A restriction never grants access; ambiguous target/scope fails closed for the affected operation. |
| DDD005-AR-05 | Restriction creation/revocation is performed by separately authorised actors; the affected actor cannot administer their own restriction. |
| DDD005-AR-06 | Restriction lifecycle and attempted use are auditable; revocation preserves history. |
| DDD005-AR-07 | Role assignment, appointment, combination review, and explicit restriction remain separate concepts. |
| DDD005-AR-08 | A role assignment and its required appointment agree on Member, role, scope, and validity. |
| DDD005-AR-09 | Prohibited role pairs cannot be concurrently effective. |
| DDD005-AR-10 | Review-required role pairs remain ineffective until independent approval is recorded. |
| DDD005-AR-11 | Allowed role pairs require separate valid assignments/appointments and independent scopes. |
| DDD005-AR-12 | Duplicate/conflicting activation checks are concurrency-safe and preserve history. |
| DDD005-AR-13 | No generic one-active-role-per-Member rule may override the approved role-pair classifications. |
| DDD005-AR-14 | DDD-004 unresolved appointment lifecycle rules are not inferred from temporal overlap mechanics. |

## 5. Required verification scenarios

### Explicit restrictions
- A valid allow plus a matching restriction is denied.
- A restriction on one church does not deny the same permission in a sibling church.
- A restriction on one department does not deny the same permission in a sibling department.
- A district/descendant restriction applies only where the permission catalogue expressly allows descendant coverage.
- An expired or revoked restriction no longer applies, while its history remains available.
- A scheduled restriction does not apply before its effective start.
- An ambiguous target or scope fails closed for the affected operation.
- The affected actor cannot create, approve, modify, or revoke their own restriction.
- An unauthorised issuer cannot create or revoke a restriction.
- A denied access attempt is audited where feasible without recording secrets.

### Assignment and appointment combinations
- Every approved allowed pair succeeds only with separate valid appointments and independent scopes.
- Every prohibited pair is rejected, including concurrent activation races.
- Every review-required pair remains inactive until an independent reviewer approves it.
- A reviewer who is the affected Member cannot approve the combination.
- Duplicate same-role/same-scope active assignments are rejected or routed for review.
- A role assignment with a missing or mismatched appointment grants no appointment-dependent permission.
- Multiple allowed assignments do not merge church, department, district, or audit scopes.
- Concurrent activation attempts cannot bypass conflict checks.
- Historical ended/revoked appointments remain reportable but do not grant current authority.

## 6. Open questions for project-owner review

1. **Logical restriction record:** Approve a distinct first-class access-restriction concept, separate from `ROLE_PERMISSION`, with the logical attributes and lifecycle in §2.2.
2. **Restriction changes:** Approve append-only lifecycle/audit history and version/supersession rather than destructive edits to subject, permission, scope, or reason.
3. **Administration authority:** Confirm that the authority to create/revoke access restrictions remains unassigned until a separate permission/role authority is explicitly approved. No existing operational, System Administrator, or Audit Administrator role receives it by inference.
4. **Combination activation:** Approve the rule that prohibited pairs are rejected, review-required pairs remain inactive pending independent approval, and allowed pairs require separate appointments/scopes.
5. **Duplicate and temporal checks:** Approve the listed logical duplicate/overlap detection requirements and half-open interval comparison convention, while leaving DDD-004 appointment lifecycle decisions open.
6. **Concurrency contract:** Approve atomic conflict evaluation and activation, with exact locking/index/constraint implementation deferred to physical schema design.

## 7. Explicit non-decisions

This proposal does not decide:
- Which existing role or person is authorised to create/revoke explicit restrictions.
- Any new permission identifier or role grant.
- The exact System Administrator, Audit Administrator, or Audit Viewer operational access beyond existing DDD-012 decisions.
- DDD-004 mid-year appointment creation, early termination, replacement, cancellation, or full state machine.
- Whether any additional role pair not listed in the approved matrix is allowed.
- Exact database tables, columns, foreign keys, unique/exclusion constraints, indexes, triggers, row-level security, or lock implementation.
- API routes, DTOs, UI workflows, or application code.
- Prisma models, migrations, or physical schema.

## 8. Approval and implementation gate

Project-owner approval of this proposal would settle only the logical technical contract and invariants expressly listed above. It would not approve physical schema design or implementation.

The corrected ERD remains NOT READY for formal approval until all remaining domain decisions and physical design reviews are complete. No Prisma models, migrations, or application code may be created before the project owner separately approves the corrected ERD.
