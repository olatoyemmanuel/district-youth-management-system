# DDD-005 Follow-up: Role-to-Permission Matrix Proposal

- Status: PROPOSAL FOR PROJECT-OWNER REVIEW
- Date: 2026-10-31
- Applies to: DYMS v1.0, Sango District
- Related decisions: DDD-004, DDD-005, DDD-006 through DDD-012
- Approval status: NOT APPROVED
- Implementation status: NOT IMPLEMENTED
- Schema/migration authorization: NOT GRANTED

## 1. Purpose and decision boundary

DDD-005 approved the initial role categories, organizational scopes, permission domains, additive permission combination, explicit-deny precedence, and strict scope enforcement. It did not approve exact grants to each role.

This proposal is a conservative starting point for reviewing the role-to-permission matrix. It does not grant permissions and must not be treated as approved policy. Where a related domain decision remains blocked, the corresponding grant is deliberately withheld rather than inferred.

## 2. Permission notation

- V: view/read.
- C: create/register/submit, only where the action is separately defined.
- U: update.
- M: manage participation or registrations, only where the related lifecycle policy is approved.
- N: nominate.
- A: approve.
- R: renew.
- E: end/revoke.
- P: publish.
- X: export.
- —: no grant proposed.
- HOLD: do not grant until the referenced domain decision is resolved.

A proposed grant is still subject to valid account and membership state, assignment scope, required appointment, resource scope, explicit denies, separation of duties, and server-side authorization on every protected request.

## 3. Proposed role-to-permission matrix

The following is a conservative proposal, not an approval.

| Permission domain/action | District Youth Leader | District Departmental Coordinator | Local Church Youth Leader | Local Church Youth Assistant | System Administrator |
|---|---|---|---|---|---|
| Members: view | V, district | HOLD, department-specific | V, assigned church | V, assigned church, limited | — by default |
| Members: register | HOLD | — | HOLD | — | — |
| Members: update | HOLD | — | HOLD | — | — |
| Members: deactivate | HOLD | — | HOLD | — | — |
| Churches: view | V, district | — | V, assigned church | V, assigned church | — by default |
| Churches: create/update | HOLD | — | — | — | — |
| Departments: view | V, district | V, assigned department | V, where linked to assigned church | V, where linked to assigned church | — by default |
| Departments: manage participation | HOLD | HOLD, assigned department only | HOLD | — | — |
| Leadership: view appointments | V, district | V, assigned department | V, assigned church | V, assigned church | — by default |
| Leadership: nominate | HOLD | HOLD | HOLD | — | — |
| Leadership: approve | HOLD, higher-authority only | HOLD | HOLD | — | — |
| Leadership: renew | HOLD, higher-authority only | HOLD | HOLD | — | — |
| Leadership: end | HOLD, authorised higher authority only | HOLD | HOLD | — | — |
| Events: create/update/publish | HOLD | HOLD | HOLD | — | — |
| Events: manage registration | HOLD | HOLD | HOLD | HOLD | — |
| Attendance: record/view/correct | HOLD | HOLD | HOLD | HOLD | — |
| Finance: view/submit/review/approve/post/reverse | HOLD | HOLD | HOLD | — | — |
| Credentials: view/issue/revoke/reissue | HOLD | HOLD | HOLD | — | — |
| Reports: view/export | V/X, non-financial district reports | HOLD, department reports | V/X, non-financial church reports | HOLD, limited reports | — by default |
| Audit: view authorised records | Only if separately authorised as Audit Viewer | Only if separately authorised as Audit Viewer | Only if separately authorised as Audit Viewer | Only if separately authorised as Audit Viewer | — |
| Audit: manage audit access | — | — | — | — | — |
| System: configuration/admin access | — | — | — | — | Manage system configuration and administrative access, subject to controlled bootstrap and least privilege |

### 3.1 Audit-specific roles

These grants reflect the existing DDD-012 approvals and remain bounded by the explicitly authorised audit scope:

| Permission | Audit Administrator | Audit Viewer |
|---|---|---|
| View authorised historical audit records | Only as needed for access administration/review activity | Yes, authorised records only |
| Review audit access activity | Yes | No, unless separately authorised |
| Manage audit access permissions | Yes | No |
| Appoint/revoke Audit Administrators | No | No |
| Alter/delete historical audit records | No | No |
| Export audit records | HOLD, export policy unresolved | HOLD, export policy unresolved |

Only the System Administrator appoints or revokes Audit Administrators under the existing DDD-012 approval. Audit Administrators cannot appoint themselves, appoint peers, or revoke peers.

## 4. Grants deliberately held pending domain decisions

| Domain decision | Policy still needed | Grants held |
|---|---|---|
| DDD-006: Department membership | Eligibility, join/leave lifecycle, approval and authority | Department participation management; member/department visibility beyond already approved scope |
| DDD-007: Events | Event ownership, lifecycle, publishing and registration authority | Event creation, update, publication and registration management |
| DDD-008: Attendance | Scan, correction, concurrency and retention rules | Attendance recording, viewing and correction beyond already established read-only reporting |
| DDD-009 / DDD-010: Finance | Account scope, workflow, approval thresholds, posting and reversal | All finance permissions for all roles |
| DDD-011: Credentials | Credential catalogue, eligibility, issuer authority and revocation | All credential issuance, revocation and reissue permissions |
| DDD-012: Audit | Record scopes, masking, exports, access review, break-glass, actor taxonomy and audit-of-audit retention | Audit export and any audit access beyond the approved Viewer/Administrator boundaries |
| DDD-004 / DDD-005: Leadership | Role-specific appointing authority, mid-year appointments, early ending and overlaps | Approval, renewal and ending grants until actor authority and lifecycle rules are explicit |

The HOLD entries are not explicit denies. They mean the product policy is incomplete and no grant should be implemented yet.

## 5. Proposed principles for finalizing grants

1. Grant the minimum permissions needed for the role's documented responsibilities.
2. Apply the narrowest resource scope: assigned church, assigned department, or district only where explicitly allowed.
3. Do not grant a district-wide permission solely because a role title contains "District".
4. Do not grant a church-wide permission solely because a person is a Local Church Youth Leader.
5. A Local Church Youth Assistant receives only delegated support permissions explicitly assigned by policy; the role does not automatically inherit all Youth Leader permissions.
6. Departmental participation does not imply departmental leadership or management permission.
7. System Administrator receives technical configuration and access-administration powers, not automatic business-data, finance, credential, or audit-record authority.
8. Audit Administrator and Audit Viewer remain distinct roles with the DDD-012 restrictions.
9. Financial submission, review, approval, posting and reversal remain separate permissions. No role receives them until DDD-009/DDD-010 are resolved.
10. Credential issuance and revocation remain unavailable until DDD-011 defines authorised issuers and lifecycle rules.
11. Every grant is subject to explicit deny-overrides-allow, appointment validity where required, and server-side resource-scope verification.
12. Any grant or permission change must be auditable.

## 6. Decisions requested from the project owner

Please review the matrix and decide:

- Whether the proposed grants for Members, Churches, Departments, Leadership and Reports are correct for each leadership role.
- Whether Local Church Youth Assistants should receive any additional operational grants beyond limited church-scoped viewing and explicitly delegated support.
- Whether District Departmental Coordinators should receive member visibility limited to members participating in their assigned department.
- Which role-specific higher authorities should receive leadership approve, renew and end permissions. This must remain consistent with DDD-004 and the prohibition on self-appointment/self-renewal/self-approval.
- Whether the conservative HOLD treatment for Events, Attendance, Finance and Credentials should remain until their domain decisions are resolved.

Do not approve the HOLD entries by implication. They require their respective domain decisions.

## 7. Verification required after approval

After the project owner approves a final matrix:

- Define stable permission identifiers and descriptions.
- Map each permission to resource type and allowed scope.
- Define explicit-deny assignment and precedence representation.
- Define prohibited and review-required role combinations.
- Verify appointment requirements for each role and action.
- Add positive and negative authorization matrix tests.
- Test cross-church, cross-department and cross-district access denial.
- Test additive permissions and explicit-deny precedence.
- Test appointment expiry, ending, revocation and historical access.
- Test separation of duties for finance and credential workflows.
- Audit all role, permission, scope and appointment changes.

## 8. Preservation and implementation gate

This proposal does not amend or supersede DFR-001 through DFR-005, the historical DFR-006 lift, DDD-004, DDD-005, DDD-012, or any other approved decision.

This is a documentation proposal only. It does not approve the final role-to-permission matrix, the ERD, physical database design, Prisma models, migrations, APIs, or application implementation. The corrected ERD still requires separate explicit project-owner approval before Prisma models or migrations are created.
