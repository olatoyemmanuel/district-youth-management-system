# Audit and Security Event Access Decision

- Decision ID: AUTH-AUD-001
- Related decision: DDD-012 (Audit actor representation and access)
- Status: APPROVED POLICY DIRECTION; detailed access matrix remains OPEN
- Approval date: 2026-10-30
- Scope: DYMS audit records and security events

## Approved policy direction

DYMS shall apply role-based access control to audit records and security events.

1. Access shall be restricted to authorised administrators with an explicit role-based permission.
2. Administrative status alone must not imply unrestricted access to every audit or security record.
3. Every access to sensitive audit records shall itself be recorded as an auditable event.
4. Access to audit records shall follow least-privilege principles and deny-by-default authorization.
5. Audit and security-event records remain protected records; ordinary application roles must not receive access by default.

## Audit-of-audit requirements

The system should record, at minimum, the actor (when known), the action performed, the target record or query scope where practical, the outcome, and the timestamp. Access attempts that are denied should also be recorded where technically feasible.

The access log must not copy secrets or unnecessarily duplicate sensitive record contents. The audit-of-audit mechanism must not permit an ordinary application user to alter or erase its history.

## Actor representation

Security events must still be recordable when the actor is unknown or no authenticated session exists. The data model must support system-generated and anonymous/pre-authentication events without inventing a user identity.

## Details still requiring a separate decision

This approval establishes the policy direction, not a complete permission matrix. The following remain open and must be specified before DDD-012 can be marked fully resolved:

- Which named roles or permission grants may view each class of audit and security record.
- Whether any role may export records, and under what restrictions.
- Whether sensitive fields require masking or field-level restrictions.
- Who may grant, review, and revoke audit-access permissions.
- Periodic access review frequency and accountable owner.
- Whether emergency or break-glass access is permitted, and its approval and review process.
- Exact actor taxonomy for human, system, service, anonymous, and unknown actors.
- How to log denied access and access to large result sets or exports.
- Retention period for audit-of-audit access records and how that relates to the approved security-event retention policy.

## Decision boundary

This decision does not approve a final ERD, Prisma models, migrations, or implementation. It does not resolve the remaining DDD-012 details or wider audit-retention policy. Existing approved authentication and authorization decisions remain unchanged.

Any change to this policy direction requires explicit change control.
