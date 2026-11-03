# Audit Administrator Appointment Authority Decision

- Decision ID: AUTH-AUD-003
- Related decisions: AUTH-AUD-001 and AUTH-AUD-002
- Related domain decision: DDD-012
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Appointment and revocation of DYMS Audit Administrator permissions

## Decision

Only the System Administrator may appoint or revoke Audit Administrators.

The following restrictions apply:

1. An Audit Administrator must not appoint themselves.
2. An Audit Administrator must not appoint another Audit Administrator.
3. An Audit Administrator must not revoke their own appointment or another Audit Administrator's appointment.
4. Appointment and revocation actions must be attributable to the acting System Administrator.
5. Appointment and revocation actions must be recorded in the protected audit trail, including actor, target, action, timestamp, and outcome.
6. The System Administrator's authority to manage Audit Administrator appointments does not grant permission to edit or delete historical audit records.

## Relationship to existing roles

- Audit Viewer: may view audit records within explicitly assigned scope; has no appointment-management authority.
- Audit Administrator: may manage audit-access permissions and review access activity within approved scope, but cannot appoint or revoke Audit Administrators and cannot alter historical audit evidence.
- System Administrator: the sole role authorised by this decision to appoint and revoke Audit Administrators.

## Remaining details

This decision does not yet define:
- Who appoints or revokes Audit Viewers.
- Whether the System Administrator may delegate any other audit-access administration.
- The exact approval and evidence required before an appointment or revocation.
- Emergency access and recovery if the System Administrator is unavailable or compromised.
- Periodic review and expiry requirements for Audit Administrator appointments.

These matters remain open and must not be inferred from this decision.

## Decision boundary

This decision approves the authority rule only. It does not complete DDD-012, approve the full audit access matrix, or authorise Prisma models, migrations, or implementation.

Any change requires explicit change control.
