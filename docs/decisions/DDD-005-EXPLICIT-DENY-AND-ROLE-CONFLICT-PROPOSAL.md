# DDD-005 Follow-up: Explicit-Deny and Role-Conflict Policy Proposal

- Status: APPROVED
- Date: 2026-10-31
- Applies to: DYMS v1.0, Sango District
- Related decisions: DDD-004, DDD-005, DDD-012
- Approval status: APPROVED
- Approval date: 2026-10-31
- Approver: Project owner
- Approval basis: Explicit approval without modification of all four decision groups. Additional instructions: none.
- Implementation status: NOT IMPLEMENTED
- Schema/migration authorization: NOT GRANTED

## 1. Purpose

DDD-005 approves additive permissions, explicit-deny-overrides-allow, strict assignment/resource scope, and the approved role-to-permission matrix for four leadership roles. The remaining policy work is to define how an explicit deny behaves and which concurrent role combinations are prohibited or require review.

This proposal supplies a conservative policy for project-owner approval. It does not define physical tables, columns, APIs, or migrations.

## 2. Proposed explicit-deny policy

### 2.1 What a deny means

An explicit deny is a deliberate, auditable restriction on a specific permission for a specific actor and resource scope. It is distinct from:
- A permission that has not been granted.
- A HOLD entry in the approved role matrix.
- An expired, ended, revoked, or suspended role assignment or appointment.
- An account or membership status restriction.

A missing grant remains denied by the existing deny-by-default rule. An explicit deny is an additional, recorded restriction that overrides otherwise valid grants.

### 2.2 Proposed scope and precedence

1. Evaluate the authenticated actor's valid grants and applicable restrictions on every protected server-side request.
2. Combine valid grants additively, as already approved.
3. If at least one applicable explicit deny matches the requested permission and resource, deny the request even when another role grants the permission.
4. A deny applies only to the permission and resource scope recorded in the restriction. It does not silently spread to unrelated churches, departments, or districts.
5. A broader-scope deny applies to descendant resources only where the permission's approved scope model explicitly defines that relationship. A narrower deny does not affect sibling resources.
6. A deny never expands an actor's access and cannot override account suspension, membership restrictions, appointment validity, or other business rules in a way that grants access.
7. If the scope or target of a deny cannot be resolved unambiguously, fail closed for the affected protected operation and record the authorization failure.

### 2.3 Proposed administration and audit controls

- A deny must be created only by a separately authorised administrative authority. Ordinary role holders must not be able to deny permissions to themselves or peers merely because they hold a business role.
- The person affected by a deny must not create, approve, remove, or modify that deny.
- Each deny must carry a documented reason, target actor, permission, resource scope, effective start, optional expiry/review date, issuing actor, and lifecycle status.
- Denies must be reviewable and revocable only by an authorised authority other than the affected actor.
- Creation, attempted use, review, modification, expiry, and revocation must be auditable. Audit history must be retained; revocation must not erase the original restriction record.
- Temporary restrictions should have an expiry or scheduled review. Permanent restrictions require a documented reason and periodic review.
- The technical representation is intentionally undecided. A dedicated restriction record or another explicit model may be proposed during technical design, but the existing ROLE_PERMISSION junction must not be assumed to represent both grants and denies.

## 3. Approved role-combination policy

The following classifications are proposed for concurrent roles held by the same Member. “Allowed” means the roles may coexist only with separate valid assignments/appointments and their own scopes. It never merges scopes or bypasses self-approval and separation-of-duties rules.

| Concurrent roles | Approved classification | Conditions and rationale |
|---|---|---|
| District Youth Leader + District Departmental Coordinator | Allowed with separate valid appointments | District authority does not enlarge the assigned department scope; all action-specific restrictions remain. |
| District Youth Leader + Local Church Youth Leader | Allowed with separate valid appointments | The district appointment does not create a church appointment or church-scope access. |
| District Youth Leader + Local Church Youth Assistant | Review required | Confirm distinct responsibilities and avoid self-review or self-approval within the same church. |
| District Departmental Coordinator + Local Church Youth Leader | Allowed with separate valid appointments | Department and church scopes remain independent; department participation grants no leadership authority. |
| District Departmental Coordinator + Local Church Youth Assistant | Allowed with separate valid appointments | Department and church scopes remain independent; no inherited permissions. |
| Local Church Youth Leader + Local Church Youth Assistant in the same church | Prohibited | Avoid simultaneous appointment to the lead and assistant positions within the same local leadership chain. |
| Local Church Youth Leader + Local Church Youth Assistant in different churches | Review required | Requires separate appointments and explicit confirmation that cross-church duties do not create self-review or conflicting authority. |
| Same Member assigned as Local Church Youth Leader in multiple churches | Review required | Multiple church appointments must be explicitly justified; no cross-church scope inheritance. |
| Same Member assigned as District Departmental Coordinator in multiple departments | Review required | Each department needs a separate appointment and scope; duplicate or overlapping assignments must be checked. |
| System Administrator + any leadership role | Prohibited | Preserve separation between technical administration and operational leadership authority. |
| System Administrator + Audit Administrator | Prohibited | Preserve independent audit-access administration and review; System Administrator retains the already approved authority to appoint/revoke Audit Administrators. |
| System Administrator + Audit Viewer | Review required | Prevent technical administration from becoming general audit-record access without a separately approved need and scope. |
| Audit Administrator + Audit Viewer | Allowed only with separate explicit audit scopes | Audit Administrator does not inherit unrestricted Viewer access; each permission and record scope must be separately authorised. |
| Audit Administrator + operational leadership role | Review required | Prevent self-review of actions appearing in the audit scope; independent review must be available. |
| Audit Viewer + operational leadership role | Allowed only with separately authorised audit scope | Operational permissions do not expand audit visibility; no access to records outside the approved Viewer scope. |

### 3.1 General conflict rules

1. A role title never outranks another role title.
2. Each role assignment must be independently valid, scoped, and appointment-backed where required.
3. Additive grants do not cancel explicit denies or separation-of-duties controls.
4. No actor may approve, renew, or end their own appointment where DDD-004 prohibits it.
5. A person must not approve their own submission or perform both sides of a controlled financial workflow where the approved finance policy prohibits it.
6. If a combination is review-required, the combination must not become effective until an authorised reviewer records approval. The reviewer must not be the affected Member.
7. A prohibited combination must not be activated concurrently. The product must preserve historical assignments and appointments rather than deleting them.
8. The combination rules do not create new appointment authorities or resolve DDD-004's mid-year and early-ending lifecycle questions.

## 4. Decision groups submitted for approval

The following four groups were submitted for decision. All four have since been approved without modification, as recorded in §8.

### A. Explicit-deny scope and precedence
Approve the proposed rule that a deny applies only to its named permission and resource scope, overrides every applicable grant, and does not spill into unrelated scopes.

### B. Explicit-deny administration
Approve the proposed controls: independent authorised issuer/reviewer, reason and effective dates, optional expiry/review, immutable audit history, and no self-removal.

### C. Role-combination classifications
Approve the proposed Allowed, Review required, and Prohibited classifications in §3, or provide replacements for individual pairs.

### D. Review-required combination workflow
Approve the requirement for independent review before a review-required combination becomes effective.

## 5. Still outside this proposal

This proposal does not resolve:
- DDD-004 mid-year appointment creation, early ending, replacement, or other appointment lifecycle rules.
- Exact higher-authority appointment workflows for leadership actions still marked HOLD.
- Stable permission identifiers and complete permission-to-resource mapping.
- Department membership, event, attendance, finance, credential, and remaining audit policies under DDD-006 through DDD-012.
- Secretary, Financial Secretary, or other roles not in the approved initial catalogue.
- Physical representation of role assignments, explicit denies, constraints, indexes, or authorization history.

## 6. Verification after approval

After approval, the design must include tests for:
- Allow from one role overridden by a matching deny from another role.
- Deny limited to one church or department without affecting sibling scopes.
- Broader deny affecting descendants only where the permission scope explicitly permits it.
- Expired/revoked deny and review lifecycle.
- Deny creation/removal attempted by the affected actor.
- Every proposed prohibited and review-required role pair.
- Separate valid assignments with no scope inheritance.
- Self-approval, self-renewal, and separation-of-duties enforcement.
- Audit evidence for creation, use, review, and revocation.

## 7. Preservation and implementation gate

This proposal does not amend DFR-001 through DFR-005, the historical DFR-006 lift, DDD-004, the approved DDD-005 role catalogue/scope/permission matrix, or DDD-012 audit-administration decisions.

This is a policy proposal only. It does not approve the ERD, physical database design, Prisma models, migrations, APIs, or application implementation. The corrected ERD still requires separate explicit project-owner approval before Prisma models or migrations are created.


## 8. Formal approval record — 2026-10-31

The project owner approved all four decision groups without modification. Additional instructions: none.

1. **Explicit-deny scope and precedence: APPROVED.** A deny applies only to its named permission and resource scope, overrides every applicable grant, and does not spread to unrelated scopes. Descendant-resource coverage applies only where the permission's approved scope model expressly defines it. Ambiguous scope fails closed for the affected protected operation.
2. **Explicit-deny administration and audit: APPROVED.** Only a separately authorised administrative authority may create or revoke a deny. The affected actor cannot create, approve, modify, or remove their own restriction. Record the reason, target actor, permission, resource scope, effective start, optional expiry/review date, issuer, and lifecycle status. Audit creation, attempted use, review, modification, expiry, and revocation. Preserve history after revocation. Temporary restrictions should expire or receive scheduled review; permanent restrictions require a reason and periodic review. Physical representation remains a technical design decision.
3. **Role-combination classifications: APPROVED.** Every role-pair classification in §3 is approved unchanged. Allowed combinations require separate valid assignments/appointments and independent scopes. Prohibited combinations must not be active concurrently. Review-required combinations remain inactive until independently approved.
4. **Independent review workflow: APPROVED.** An authorised reviewer who is not the affected Member must record approval before a review-required combination becomes effective.

This approval does not change the existing role catalogue, approved four-role permission matrix, DDD-004 appointment lifecycle decisions, or DDD-012 audit-administration authority. It does not determine physical storage, schema, Prisma models, migrations, APIs, or application implementation.
