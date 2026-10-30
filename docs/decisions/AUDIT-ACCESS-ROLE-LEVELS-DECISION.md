# Audit Access Role Levels Decision

- Decision ID: AUTH-AUD-002
- Related decision: AUTH-AUD-001 and DDD-012
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: DYMS audit and security-event access control

## Decision

DYMS shall define two distinct audit-access permission levels as the starting point for its audit access matrix.

### 1. Audit Viewer

May:
- View audit and security records within the scope explicitly authorised to the role.

Must not:
- Edit historical audit records.
- Delete historical audit records.
- Change audit-access permissions.

### 2. Audit Administrator

May:
- Manage audit-access permissions.
- Review audit-access activity.

Must not:
- Edit historical audit records.
- Delete historical audit records.
- Alter or erase historical audit evidence.

## Shared requirements

- Both roles are subject to least-privilege and deny-by-default authorization.
- Every access to sensitive audit records must itself be logged.
- The role name alone does not grant access outside the assigned scope.
- Audit-access activity must be protected against alteration by ordinary application workflows.
- System-generated and anonymous/pre-authentication security events remain supported.

## Remaining details

This decision approves the two-level permission structure, not the complete access matrix. The following remain open:
- Exact record classes and scopes visible to each role.
- Which organisational authority may assign or revoke each role.
- Export permissions and controls.
- Field masking and sensitive-data restrictions.
- Access review cadence and accountable owner.
- Emergency/break-glass access policy.
- Actor taxonomy and treatment of unknown actors.
- Retention period for audit-of-audit access records.

## Decision boundary

This decision does not authorise Prisma models, migrations, or implementation. It does not resolve DDD-012 in full. It does not change existing authentication, session, or organisational authorization decisions.

Changes require explicit change control.
