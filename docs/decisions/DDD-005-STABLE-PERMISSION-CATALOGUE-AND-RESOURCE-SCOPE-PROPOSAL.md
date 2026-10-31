# DDD-005: Stable Permission Catalogue and Resource-Scope Mapping Proposal

- Status: DRAFT FOR PROJECT-OWNER REVIEW
- Decision: DDD-005
- Date prepared: 2026-10-31
- Applies to: DYMS v1.0, Sango District
- Related decisions: DDD-004, DDD-005, DDD-006 through DDD-012
- Approval status: NOT APPROVED
- Implementation status: NOT IMPLEMENTED
- Schema/migration authorization: NOT GRANTED

## 1. Purpose and authority

This proposal defines stable action-specific permission identifiers and maps each permission to its logical resource target, organizational scope, and approved role-grant status.

The authoritative policy inputs are:

- `DDD-005-AUTHORIZATION-SCOPE-AND-PERMISSION-PRECEDENCE.md`: approved role catalogue, organizational scopes, permission domains, additive grants, scope enforcement, and deny-overrides-allow.
- `DDD-005-ROLE-PERMISSION-MATRIX-PROPOSAL.md`: approved concrete grants and scope limits for District Youth Leader, District Departmental Coordinator, Local Church Youth Leader, and Local Church Youth Assistant. Its HOLD entries remain withheld.
- `DDD-005-EXPLICIT-DENY-AND-ROLE-CONFLICT-PROPOSAL.md`: approved explicit-deny and role-combination policy.

This document expands those decisions into a reviewable permission catalogue. It does not enlarge any approved grant. It does not decide policies still held under DDD-006 through DDD-012, nor does it decide DDD-004 appointment lifecycle questions.

No role, permission, resource, entity, field, API, table, index, constraint, or migration is approved for implementation by this proposal.

## 2. Catalogue conventions

### 2.1 Identifier format

Use lowercase, dot-separated, domain-qualified identifiers in the form `domain.action`, with a third segment only when it distinguishes a separately authorised operation, for example `audit.access_activity.read`.

Identifier rules:

1. An identifier names one action, not a role or an organizational scope.
2. Do not encode a role name, church ID, department ID, district ID, or other instance-specific value in the identifier.
3. Do not reuse an identifier for a different action after publication.
4. A change to an action's meaning or resource target requires a documented decision and compatibility review.
5. Scope and any narrower data-visibility profile are evaluated separately from the identifier.
6. A permission identifier is not itself a grant. An actor needs a valid approved assignment, an applicable grant, valid appointment state where required, matching resource scope, and no applicable explicit deny.

### 2.2 Grant-status notation

| Status | Meaning |
|---|---|
| APPROVED | A concrete grant and its stated scope are present in the approved role matrix. |
| HOLD | The approved matrix expressly withholds the grant pending the named domain decision or authority clarification. Do not implement it as an allow. |
| NO GRANT | The approved matrix proposes no grant for this role. This is not an explicit-deny record. |
| CONDITIONAL | The role can exercise the permission only through a separate, independently valid role assignment and separately authorised scope, not through its operational role. |

An omitted grant, a HOLD, and an explicit deny are three different states. This catalogue does not convert any of them into a stored explicit-deny record.

### 2.3 Scope notation

- DISTRICT: the single Sango District boundary.
- ASSIGNED_CHURCH: only the church identified by the valid church-scoped assignment.
- ASSIGNED_DEPARTMENT: only the department identified by the valid department-scoped assignment.
- DISTRICT_DESCENDANTS: a district-scoped permission may address subordinate churches or departments only where this catalogue expressly states so for that permission.
- AUDIT_SCOPE: only the audit records and activities explicitly authorised for the Audit Viewer or Audit Administrator.
- SYSTEM: technical configuration or access-administration operations expressly granted to the System Administrator. It does not imply business-data, finance, credential, or unrestricted audit access.
- LINKED_CHURCH_DEPARTMENT: department records or participation links only where the requested department is linked to the actor's assigned church. This scope does not grant department leadership.

The server must resolve the actor's valid assignment and the target resource's actual organizational relationship. A client-supplied identifier is never proof of scope. No permission inherits scope from another role or from a parent role title.

## 3. Stable permission catalogue and resource mapping

The resource targets below are logical authorization targets aligned to the current conceptual model. They are not approval to add entities. Where the current ERD has no dedicated workflow entity, the target is described as a workflow boundary and its persistence model remains open.

| Permission identifier | Action | Logical resource target | Allowed scope when granted | Policy / mapping notes |
|---|---|---|---|---|
| `members.read` | View member information | `MEMBER` | DISTRICT, ASSIGNED_CHURCH, or department-participant filter only if separately approved | District Youth Leader: DISTRICT. Local Church Youth Leader: ASSIGNED_CHURCH. Local Church Youth Assistant: ASSIGNED_CHURCH with the approved limited-view condition. District Departmental Coordinator: HOLD, department-specific participant visibility only if later approved. |
| `members.register` | Register a member | `MEMBER` and member-onboarding workflow | No scope active until grant and registration workflow are approved | HOLD for District Youth Leader and Local Church Youth Leader. NO GRANT for the other listed operational roles. Registration authority and onboarding lifecycle remain unresolved. |
| `members.update` | Update member information | `MEMBER` | No scope active until grant is approved | HOLD for District Youth Leader and Local Church Youth Leader. NO GRANT for District Departmental Coordinator and Local Church Youth Assistant. Field-level update boundaries are not defined here. |
| `members.deactivate` | Deactivate a member profile | `MEMBER` | No scope active until grant is approved | HOLD for District Youth Leader and Local Church Youth Leader. NO GRANT for District Departmental Coordinator and Local Church Youth Assistant. Account suspension, membership status, and member deactivation remain distinct concepts. |
| `churches.read` | View church information | `CHURCH` | DISTRICT or ASSIGNED_CHURCH | District Youth Leader: DISTRICT. Local Church Youth Leader and Assistant: ASSIGNED_CHURCH. NO GRANT for District Departmental Coordinator. System Administrator has no default business-data grant. |
| `churches.create` | Create a church record | `CHURCH` | No scope active until grant is approved | HOLD for District Youth Leader. NO GRANT for other listed roles. |
| `churches.update` | Update a church record | `CHURCH` | No scope active until grant is approved | HOLD for District Youth Leader. NO GRANT for other listed roles. |
| `departments.read` | View department information | `DEPARTMENT`, `CHURCH_DEPARTMENT` | DISTRICT, ASSIGNED_DEPARTMENT, or LINKED_CHURCH_DEPARTMENT | District Youth Leader: DISTRICT. District Departmental Coordinator: ASSIGNED_DEPARTMENT. Local Church Youth Leader and Assistant: LINKED_CHURCH_DEPARTMENT. |
| `departments.participation.manage` | Manage department participation | `DEPARTMENT_MEMBERSHIP` and `CHURCH_DEPARTMENT` | No scope active until DDD-006 and the relevant grant are approved | HOLD for District Youth Leader; HOLD for District Departmental Coordinator limited to ASSIGNED_DEPARTMENT; HOLD for Local Church Youth Leader; NO GRANT for Local Church Youth Assistant. DDD-006 must clarify the participation lifecycle and the two participation relationships before implementation. |
| `leadership.appointments.read` | View leadership appointments | `APPOINTMENT`, `ROLE_ASSIGNMENT` | DISTRICT, ASSIGNED_DEPARTMENT, or ASSIGNED_CHURCH | District Youth Leader: DISTRICT. District Departmental Coordinator: ASSIGNED_DEPARTMENT. Local Church Youth Leader and Assistant: ASSIGNED_CHURCH. |
| `leadership.nominate` | Nominate a person for leadership | Leadership nomination workflow; persistence target not yet approved | No scope active | HOLD for District Youth Leader, District Departmental Coordinator, and Local Church Youth Leader. NO GRANT for Local Church Youth Assistant. Nomination workflow and authority remain unresolved. |
| `leadership.approve` | Approve a leadership appointment | `APPOINTMENT` workflow | No scope active until higher-authority mapping is approved | HOLD for District Youth Leader, restricted to higher-authority action only; HOLD for District Departmental Coordinator and Local Church Youth Leader. NO GRANT for Local Church Youth Assistant. No actor may approve their own appointment. |
| `leadership.renew` | Renew a leadership appointment | `APPOINTMENT` | No scope active until higher-authority mapping is approved | HOLD for District Youth Leader, higher-authority only; HOLD for District Departmental Coordinator and Local Church Youth Leader. NO GRANT for Local Church Youth Assistant. DDD-004 annual renewal and new historical appointment rule remain applicable. |
| `leadership.end` | End or revoke a leadership appointment | `APPOINTMENT` | No scope active until authorised higher-authority mapping is approved | HOLD for District Youth Leader, authorised higher authority only; HOLD for District Departmental Coordinator and Local Church Youth Leader. NO GRANT for Local Church Youth Assistant. DDD-004 early-ending lifecycle details remain open. |
| `events.create` | Create an event | `EVENT` | No scope active until DDD-007 is approved | HOLD for District Youth Leader, District Departmental Coordinator, and Local Church Youth Leader. NO GRANT for Local Church Youth Assistant. |
| `events.update` | Update an event | `EVENT` | No scope active until DDD-007 is approved | HOLD for District Youth Leader, District Departmental Coordinator, and Local Church Youth Leader. NO GRANT for Local Church Youth Assistant. |
| `events.publish` | Publish an event | `EVENT` | No scope active until DDD-007 is approved | HOLD for District Youth Leader, District Departmental Coordinator, and Local Church Youth Leader. NO GRANT for Local Church Youth Assistant. |
| `events.registrations.manage` | Manage event registrations | `EVENT_REGISTRATION` | No scope active until DDD-007 is approved | HOLD for all four operational leadership roles. |
| `attendance.record` | Record attendance | `ATTENDANCE_RECORD` | No scope active until DDD-008 is approved | HOLD for all four operational leadership roles. |
| `attendance.read` | View attendance records | `ATTENDANCE_RECORD` | No scope active until DDD-008 is approved | HOLD for all four operational leadership roles. Do not infer attendance visibility from event, member, or report visibility. |
| `attendance.correct` | Correct an attendance record | `ATTENDANCE_CORRECTION_HISTORY` and the affected `ATTENDANCE_RECORD` | No scope active until DDD-008 is approved | HOLD for all four operational leadership roles. Correction history must remain distinct from ordinary record updates. |
| `finance.read` | View financial records | `FINANCIAL_ACCOUNT`, `FINANCIAL_TRANSACTION`, `FINANCIAL_APPROVAL` | No scope active until DDD-009/DDD-010 and role grants are approved | HOLD for all four operational leadership roles. |
| `finance.submit` | Submit a financial transaction | `FINANCIAL_TRANSACTION` | No scope active until DDD-009/DDD-010 and role grants are approved | HOLD for all four operational leadership roles. |
| `finance.review` | Review a financial transaction | `FINANCIAL_TRANSACTION`, `FINANCIAL_APPROVAL` | No scope active until DDD-009/DDD-010 and role grants are approved | HOLD for all four operational leadership roles. Must remain distinct from submit, approve, post, and reverse. |
| `finance.approve` | Approve a financial transaction | `FINANCIAL_TRANSACTION`, `FINANCIAL_APPROVAL` | No scope active until DDD-009/DDD-010 and role grants are approved | HOLD for all four operational leadership roles. Financial separation of duties remains mandatory. |
| `finance.post` | Post an approved financial transaction | `FINANCIAL_TRANSACTION` | No scope active until DDD-009/DDD-010 and role grants are approved | HOLD for all four operational leadership roles. |
| `finance.reverse` | Reverse a posted financial transaction | `FINANCIAL_TRANSACTION` | No scope active until DDD-009/DDD-010 and role grants are approved | HOLD for all four operational leadership roles. A reversal is not deletion or alteration of the historical transaction. |
| `credentials.read` | View credential definitions and issued credentials | `CREDENTIAL_DEFINITION`, `MEMBER_CREDENTIAL` | No scope active until DDD-011 and role grants are approved | HOLD for all four operational leadership roles. |
| `credentials.issue` | Issue a credential | `MEMBER_CREDENTIAL` | No scope active until DDD-011 and role grants are approved | HOLD for all four operational leadership roles. |
| `credentials.revoke` | Revoke an issued credential | `MEMBER_CREDENTIAL` | No scope active until DDD-011 and role grants are approved | HOLD for all four operational leadership roles. |
| `credentials.reissue` | Reissue a credential | `MEMBER_CREDENTIAL` | No scope active until DDD-011 and role grants are approved | HOLD for all four operational leadership roles. |
| `reports.read` | View a report | Authorised report projection; no new persistent entity implied | DISTRICT or ASSIGNED_CHURCH for the approved non-financial report grants | District Youth Leader: DISTRICT, non-financial reports. Local Church Youth Leader: ASSIGNED_CHURCH, non-financial reports. District Departmental Coordinator: HOLD, department reports. Local Church Youth Assistant: HOLD, limited reports. |
| `reports.export` | Export a report | Authorised report projection and export operation | Same proposed report scope as `reports.read`, only where export is separately approved | District Youth Leader: DISTRICT, non-financial reports. Local Church Youth Leader: ASSIGNED_CHURCH, non-financial reports. District Departmental Coordinator: HOLD, department reports. Local Church Youth Assistant: HOLD, limited reports. Export format, fields, and audit controls remain subject to DDD-012 and domain policies. |
| `audit.records.read` | View authorised historical audit records | `AUDIT_LOG` | AUDIT_SCOPE | Audit Viewer: APPROVED within explicitly authorised record scope. An operational role may exercise this permission only through a separate valid Audit Viewer assignment and separately authorised audit scope. Audit Administrator does not receive unrestricted Viewer access. |
| `audit.access_activity.read` | Review audit-access activity | Audit-access activity within the approved audit-administration boundary; exact record projection remains subject to DDD-012 | AUDIT_SCOPE limited to access administration/review activity | Audit Administrator: APPROVED only as needed to administer audit access and review access activity. Audit Viewer: NO GRANT unless separately authorised. |
| `audit.access_permissions.manage` | Manage audit-record access permissions | Audit-access authorization records; physical representation not approved | AUDIT_SCOPE and only the access-control scope assigned to the Audit Administrator | Audit Administrator: APPROVED. Audit Viewer: NO GRANT. System Administrator does not receive this permission by virtue of technical administration. |
| `system.configuration.manage` | Manage system configuration | System configuration boundary; exact persistence target remains a technical design item | SYSTEM | System Administrator: APPROVED within controlled bootstrap, least-privilege, and audited administration. All other roles: NO GRANT. |
| `system.access.manage` | Manage technical administrative access | User/access-administration boundary; exact persistence target remains a technical design item | SYSTEM | System Administrator: APPROVED within controlled bootstrap and audited administration. This does not grant finance, credential, business-data, or audit-record permissions. |
| `system.audit_administrators.assign_revoke` | Appoint or revoke an Audit Administrator | Audit Administrator role assignment and its approval history; physical representation not approved | SYSTEM, limited to this expressly approved administrative act | System Administrator: APPROVED as the sole appointing/revoking authority under DDD-012. Audit Administrators and Audit Viewers: NO GRANT. The System Administrator must not concurrently hold Audit Administrator under the approved role-conflict policy. |

## 4. Role-grant reconciliation

This section restates the approved matrix at identifier level. It is a normalization of existing grants and HOLD entries, not a new grant approval.

### 4.1 Operational leadership roles

| Permission | District Youth Leader | District Departmental Coordinator | Local Church Youth Leader | Local Church Youth Assistant |
|---|---|---|---|---|
| `members.read` | APPROVED, DISTRICT | HOLD, department-participant visibility only if later approved | APPROVED, ASSIGNED_CHURCH | APPROVED, ASSIGNED_CHURCH, limited view |
| `members.register` | HOLD | NO GRANT | HOLD | NO GRANT |
| `members.update` | HOLD | NO GRANT | HOLD | NO GRANT |
| `members.deactivate` | HOLD | NO GRANT | HOLD | NO GRANT |
| `churches.read` | APPROVED, DISTRICT | NO GRANT | APPROVED, ASSIGNED_CHURCH | APPROVED, ASSIGNED_CHURCH |
| `churches.create`, `churches.update` | HOLD | NO GRANT | NO GRANT | NO GRANT |
| `departments.read` | APPROVED, DISTRICT | APPROVED, ASSIGNED_DEPARTMENT | APPROVED, LINKED_CHURCH_DEPARTMENT | APPROVED, LINKED_CHURCH_DEPARTMENT |
| `departments.participation.manage` | HOLD | HOLD, ASSIGNED_DEPARTMENT | HOLD | NO GRANT |
| `leadership.appointments.read` | APPROVED, DISTRICT | APPROVED, ASSIGNED_DEPARTMENT | APPROVED, ASSIGNED_CHURCH | APPROVED, ASSIGNED_CHURCH |
| `leadership.nominate` | HOLD | HOLD | HOLD | NO GRANT |
| `leadership.approve` | HOLD, higher-authority only | HOLD | HOLD | NO GRANT |
| `leadership.renew` | HOLD, higher-authority only | HOLD | HOLD | NO GRANT |
| `leadership.end` | HOLD, authorised higher authority only | HOLD | HOLD | NO GRANT |
| `events.create`, `events.update`, `events.publish` | HOLD | HOLD | HOLD | NO GRANT |
| `events.registrations.manage` | HOLD | HOLD | HOLD | HOLD |
| `attendance.record`, `attendance.read`, `attendance.correct` | HOLD | HOLD | HOLD | HOLD |
| `finance.read`, `finance.submit`, `finance.review`, `finance.approve`, `finance.post`, `finance.reverse` | HOLD | HOLD | HOLD | HOLD |
| `credentials.read`, `credentials.issue`, `credentials.revoke`, `credentials.reissue` | HOLD | HOLD | HOLD | HOLD |
| `reports.read`, `reports.export` | APPROVED, DISTRICT, non-financial reports | HOLD, department reports | APPROVED, ASSIGNED_CHURCH, non-financial reports | HOLD, limited reports |

### 4.2 Administrative and audit roles

| Permission | System Administrator | Audit Administrator | Audit Viewer |
|---|---|---|---|
| `audit.records.read` | NO GRANT | NO GRANT to general Viewer scope | APPROVED, AUDIT_SCOPE |
| `audit.access_activity.read` | NO GRANT by virtue of system role | APPROVED, access-administration/review activity only | NO GRANT unless separately authorised |
| `audit.access_permissions.manage` | NO GRANT | APPROVED, explicitly assigned audit-access scope | NO GRANT |
| `system.configuration.manage` | APPROVED, SYSTEM | NO GRANT | NO GRANT |
| `system.access.manage` | APPROVED, SYSTEM | NO GRANT | NO GRANT |
| `system.audit_administrators.assign_revoke` | APPROVED, sole appointing/revoking authority under DDD-012 | NO GRANT | NO GRANT |

The approved role-combination classifications continue to apply. In particular, System Administrator cannot concurrently hold any leadership role or Audit Administrator; Audit Administrator + Audit Viewer is allowed only with separate explicit audit scopes; and operational leadership roles do not confer audit visibility without a separate Audit Viewer assignment.

## 5. Resource-scope evaluation contract

For every protected operation, the server-side authorization decision must evaluate, in order:

1. Authenticated actor identity and account status.
2. Valid role assignments for that actor.
3. Valid appointment state and effective period wherever the role requires an appointment.
4. The permission identifier required by the operation.
5. The grant status and scope of each applicable assignment.
6. The actual resource type and resource identifier resolved by the server.
7. The resource's district, church, department, or explicit audit-scope relationship.
8. Any permission-specific relationship filter, such as a member's participation in the assigned department.
9. Applicable explicit denies, with the approved deny taking precedence over all matching grants.
10. Business rules and separation-of-duties constraints.
11. Independent-review approval where the approved role-combination policy requires it.

A successful check requires at least one applicable APPROVED grant and no matching explicit deny or other blocking rule. HOLD, NO GRANT, missing grants, invalid appointments, ambiguous scope, and unresolved policy conditions never produce access. A matching explicit deny overrides an otherwise valid allow. If a deny's target or scope is ambiguous, fail closed for the affected operation.

The exact evaluation order between business rules and explicit denies is not intended to weaken any business rule. Deny is an additional restriction, never an alternate way to grant access.

## 6. Explicit non-grants and unresolved mapping constraints

1. No generic `admin.*`, `members.*`, `finance.*`, or `credentials.*` wildcard permission is proposed.
2. System Administrator is not automatically a business-data superuser, finance approver, credential issuer, Audit Viewer, or Audit Administrator.
3. District Youth Leader does not receive every church or department permission merely by holding a district appointment.
4. District Departmental Coordinator does not receive department leadership powers or unrestricted member visibility. The approved matrix's member-view entry remains HOLD and, if later approved, is limited to members participating in the assigned department.
5. Local Church Youth Assistant does not inherit the Local Church Youth Leader's permissions. Its approved member-view grant remains limited; the exact field-level visibility profile must be defined before implementation.
6. A department participation permission must not be implemented until DDD-006 resolves the lifecycle and authority for `DEPARTMENT_MEMBERSHIP` and `CHURCH_DEPARTMENT`.
7. Leadership nomination, approval, renewal, and ending permissions remain HOLD where shown. This proposal does not identify the higher-authority actor or settle DDD-004 mid-year/early-ending/replacement rules.
8. Event, attendance, finance, credential, report-export, and remaining audit access rules remain subject to their referenced DDD decisions.
9. The report target is a logical projection. This catalogue does not create a REPORT entity or decide report retention, export formats, masking, or field-level filters.
10. Audit-access and system-administration resource targets are policy boundaries, not approval for new entities or tables.
11. An explicit deny remains a separate restriction policy. It is not represented by a missing role grant, HOLD, NO GRANT, or the `ROLE_PERMISSION` junction by assumption.

## 7. Required verification before final approval

The completed permission catalogue must be tested against:

- Every concrete approved role grant and its exact organizational scope.
- Every HOLD entry, proving it produces no allow.
- Every NO GRANT entry, proving no implicit permission inheritance.
- Local Church Youth Assistant limited member visibility and the unresolved field projection.
- District Departmental Coordinator member visibility remaining withheld pending a domain decision.
- District-to-church and district-to-department resource checks only for permissions explicitly scoped to DISTRICT or DISTRICT_DESCENDANTS.
- LINKED_CHURCH_DEPARTMENT membership/participation relationship checks.
- Cross-church, cross-department, and cross-district IDOR attempts.
- Additive grants from separately valid assignments without scope merging.
- Expired, ended, revoked, or suspended appointments.
- Matching explicit deny overriding an otherwise valid grant.
- Sibling-resource isolation for a narrow deny and explicit descendant-scope behavior for an approved broad deny.
- Independent deny issuer/reviewer controls and immutable restriction history.
- Every approved role-pair classification, including review-required activation gates and prohibited concurrent combinations.
- Finance separation of duties and credential-issuer authority when DDD-009/DDD-010/DDD-011 are resolved.
- Audit Viewer/Audit Administrator separation and the sole System Administrator authority to appoint/revoke Audit Administrators.

These are required future tests. Their inclusion does not claim that the tests or implementation already exist.

## 8. Questions requiring project-owner confirmation

Please review the following points before this catalogue is approved:

1. **Identifier convention:** Approve the lowercase dot-separated `domain.action` convention and the identifiers in §3, or specify changes.
2. **Resource mapping:** Approve the logical resource targets in §3, especially the combined department participation target, leadership nomination workflow target, report projection target, audit-access target, and system-administration target. These do not add ERD entities.
3. **Scope vocabulary:** Approve DISTRICT, ASSIGNED_CHURCH, ASSIGNED_DEPARTMENT, DISTRICT_DESCENDANTS, LINKED_CHURCH_DEPARTMENT, AUDIT_SCOPE, and SYSTEM as authorization scope labels, subject to the explicit per-permission mapping.
4. **Role-grant reconciliation:** Confirm that §4 is an exact normalization of the already approved role matrix, with no new grants and all HOLD entries withheld.
5. **Limited visibility:** Confirm that the Local Church Youth Assistant member-view grant remains limited, while leaving the exact field-level visibility profile open for a separate explicit decision. The District Departmental Coordinator member-view grant remains HOLD.

## 9. Preservation and implementation boundary

This proposal preserves DFR-001 through DFR-005, the historical DFR-006 lift, DDD-004, DDD-005, DDD-012, and all previously approved role-grant and role-conflict decisions.

Approval of this catalogue would settle permission identifiers, their logical resource targets, scope vocabulary, and the role-grant mapping only to the extent expressly approved. It would not authorize a physical deny model, database schema, Prisma models, migrations, API implementation, or application code.

The corrected ERD still requires separate explicit project-owner approval before Prisma models or migrations are created.
