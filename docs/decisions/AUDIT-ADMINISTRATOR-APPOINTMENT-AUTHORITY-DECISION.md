# Audit Administrator Appointment Authority Decision

- Decision ID: AUTH-AUD-003
- Related decisions: AUTH-AUD-001 and AUTH-AUD-002
- Related governance area: DDD-012
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Appointment and revocation of the DYMS Audit Administrator permission

## Decision

Only the System Administrator may appoint or revoke the Audit Administrator permission.

An Audit Administrator:
- Must not appoint themselves.
- Must not appoint another Audit Administrator.
- Must not revoke their own Audit Administrator permission.
- Must not revoke another Audit Administrator's permission.

The System Administrator is the sole authority for granting and revoking this permission.

## Control requirements

- Appointment and revocation actions must be authenticated and authorised.
- Each action must record the acting System Administrator, affected account, action, timestamp, and outcome.
- The affected account must not be able to alter or delete the historical appointment/revocation evidence.
- The permission must not be self-assigned or inherited merely from holding another administrative role.

## Remaining details

This decision does not yet define:
- Whether more than one System Administrator may exist.
- How System Administrator permissions are initially provisioned or recovered.
- Whether a second-person approval is required for appointment or revocation.
- The review frequency for Audit Administrator assignments.
- The detailed organisational scope of each Audit Administrator.

These matters remain subject to separate decisions.

## Decision boundary

This decision approves the authority for assigning and revoking the Audit Administrator permission only. It does not grant Audit Administrators unrestricted access to all audit records, resolve all of DDD-012, or authorise Prisma models, migrations, or implementation.

Changes require explicit change control.
