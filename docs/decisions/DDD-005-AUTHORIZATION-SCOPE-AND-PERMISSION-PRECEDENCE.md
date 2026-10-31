# DDD-005: Authorization Scope and Permission Precedence

- Decision status: APPROVED FOR THE POLICY ELEMENTS RECORDED BELOW
- Approver: Project owner
- Approval date: 2026-10-31
- Scope: DYMS v1.0, Sango District
- Source: Explicit product-owner approval in the project conversation on 2026-10-31
- Implementation status: NOT IMPLEMENTED
- Schema/migration authorization: NOT GRANTED

## 1. Approval summary

The project owner approved all four DDD-005 proposal groups without modification:

1. Initial role categories.
2. Organizational scope model.
3. Action-specific permission catalogue and domain groups.
4. Permission combination and precedence.

This approval resolves the corresponding policy questions only to the extent stated in this record. It does not approve every possible role-to-permission grant, every role-combination rule, an exhaustive permission identifier catalogue, or the remaining appointment lifecycle rules.

## 2. Initial role categories and scope

| Initial role category | Assignment scope | Leadership appointment required |
|---|---|---|
| District Youth Leader | District | Yes |
| District Departmental Coordinator | Assigned department | Yes |
| Local Church Youth Leader | Assigned church | Yes |
| Local Church Youth Assistant | Assigned church | Yes |
| System Administrator | System-wide | No leadership appointment; controlled bootstrap provisioning applies |
| Audit Administrator | Explicitly approved audit-administration scope | No leadership appointment; only the System Administrator appoints/revokes this role |
| Audit Viewer | Explicitly authorised audit-record scope | No leadership appointment |

The role categories and scopes above are approved as the initial DYMS catalogue. The appointment requirement for leadership roles remains subject to DDD-004's approved annual term, higher-authority appointment/renewal, no self-appointment/self-renewal, and retained history.

System Administrator bootstrap provisioning and Audit Administrator appointment authority remain governed by the already approved DDD-012 decisions. This DDD-005 approval does not grant technical administrators financial approval or credential-issuance authority.

Other proposed roles, including Secretary and Financial Secretary variants, are not added to the approved initial catalogue by this decision. Their definitions and authority must be decided in the relevant domain policy before implementation.

## 3. Organizational scope policy

The approved organizational scopes are:

- District.
- Church.
- Department.
- System-wide or specifically authorised audit scope for the administrative roles identified in §2.

A role assignment is bound to its approved scope. District-level access to subordinate church or department resources is permitted only where the specific permission expressly allows that resource scope. A district role does not automatically receive every permission over every subordinate resource.

There is no automatic permission inheritance between roles or scopes. Department membership alone does not grant leadership authority. A client-supplied resource identifier is never authority. The server must resolve the authenticated actor's valid assignments and verify the requested resource against the permission's approved scope on every protected operation.

## 4. Permission catalogue

Permissions represent specific actions, not unrestricted administrative titles. The approved initial permission groups are:

| Domain | Action-specific permission examples |
|---|---|
| Members | View, register, update, deactivate |
| Churches | View, create, update |
| Departments | View, manage participation |
| Leadership | View appointments, nominate, approve, renew, end |
| Events | Create, update, publish, manage registration |
| Attendance | Record, view, correct |
| Finance | View, submit, review, approve, post, reverse |
| Credentials | View, issue, revoke, reissue |
| Reports | View, export |
| Audit | View authorised records, manage audit access |
| System | Manage system configuration and administrative access |

The domain groups and action-specific permission approach are approved. This table is an initial catalogue, not an exhaustive list of permission identifiers or a role-to-permission grant matrix. Each permission must be mapped to its resource type and allowed scope before implementation.

Financial submission, review, approval, posting, and reversal remain distinct actions. The approved financial separation-of-duties rules and unresolved DDD-009/DDD-010 finance policies continue to apply. Technical administration does not automatically grant financial approval or credential-issuance authority.

## 5. Multiple roles and permission precedence

The approved combination rules are:

1. Permissions from all valid role assignments held by the authenticated actor combine additively.
2. Every permission remains limited to the scope of the assignment and the resource scope expressly allowed by that permission.
3. An explicit deny takes precedence over an allow.
4. Expired, ended, revoked, or suspended appointments contribute no appointment-dependent permissions.
5. Exact duplicate or contradictory active assignments must not silently create additional authority. They must be rejected or referred for review when their validity is unclear.
6. No role title automatically outranks another role title. There is no general seniority-based override.
7. Applicable business rules and separation-of-duties restrictions continue to apply even when the actor has multiple roles.

The explicit-deny rule is a policy precedence rule. Its exact representation in the permission/assignment model and its interaction with role-level grants must be specified and reviewed during the post-ERD-approved technical design. It must not be assumed that the current conceptual `ROLE_PERMISSION` junction alone represents explicit denies.

## 6. Remaining questions and boundaries

The following remain unresolved and must not be inferred:

- The exhaustive permission identifiers and the exact role-to-permission grant matrix.
- The exact representation and administration of explicit deny rules.
- The prohibited or review-required combinations of specific roles, including combinations held concurrently by one Member.
- The exact overlap and duplicate-active-record constraints for appointments and assignments.
- The named higher-authority actor and appointment workflow for each leadership role, where not already established by approved policy.
- Mid-year appointment creation, early ending/termination, replacement, and other lifecycle states under DDD-004.
- Secretary, Financial Secretary, and other roles not included in the approved initial catalogue.
- Domain-specific authority still blocked under DDD-010 (finance), DDD-011 (credentials), and DDD-012 (remaining audit access controls).

## 7. Required verification

Before implementation, prepare and review:

- A complete role-to-permission matrix.
- A permission-to-resource and permission-to-scope matrix.
- Positive and negative authorization tests for each role and scope.
- Cross-church, cross-department, and cross-district IDOR tests.
- Multiple-role additive-permission tests.
- Explicit-deny-overrides-allow tests.
- Expired, ended, revoked, suspended, and historical appointment tests.
- Duplicate, contradictory, and prohibited role-combination tests.
- Financial separation-of-duties and credential-issuance authority tests.
- Audit coverage for permission, scope, role assignment, and appointment changes.

## 8. Preservation and implementation boundary

This decision supplements and does not alter DFR-001 through DFR-005, the historical DFR-006 lift, DDD-004, or the approved DDD-012 audit-administration decisions.

It is a product-policy approval only. It does not approve the ERD, physical schema, Prisma models, migrations, API implementation, or deployment. The user must explicitly approve the corrected final ERD before Prisma models or migrations are created.
