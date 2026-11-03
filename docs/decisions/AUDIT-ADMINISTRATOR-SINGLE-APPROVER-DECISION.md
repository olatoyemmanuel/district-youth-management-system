# Audit Administrator Single-Approver Decision

- Decision ID: AUTH-AUD-004
- Related decisions: AUTH-AUD-001, AUTH-AUD-002, AUTH-AUD-003
- Related governance area: DDD-012
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Approval requirement for appointment and revocation of the DYMS Audit Administrator permission

## Decision

One System Administrator is sufficient to approve and execute an Audit Administrator appointment or revocation.

A second System Administrator's approval is not required.

The System Administrator remains the sole authority permitted to appoint or revoke the Audit Administrator permission, as established by AUTH-AUD-003.

## Required controls

- The action must be performed through an authenticated System Administrator account.
- The system must verify the actor's current authority at the time of the action.
- The appointment or revocation must generate an auditable record identifying the acting System Administrator, affected account, action, timestamp, and outcome.
- Audit Administrators must not appoint themselves, appoint other Audit Administrators, or revoke their own or another Audit Administrator's permission.
- The acting System Administrator must not be able to alter or delete the historical evidence of the action through ordinary application workflows.

## Decision boundary

This decision removes the proposed second-person approval requirement only. It does not resolve System Administrator provisioning or recovery, the number of System Administrators, periodic access reviews, or the full DDD-012 access matrix. It does not authorise Prisma models, migrations, or implementation.

Changes require explicit change control.
