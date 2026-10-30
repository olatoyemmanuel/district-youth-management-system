# System Administrator Provisioning and Recovery Decision

- Decision ID: AUTH-SYS-001
- Related decisions: AUTH-AUD-001, AUTH-AUD-002, AUTH-AUD-003, AUTH-AUD-004
- Related governance area: DDD-012
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Initial provisioning and recovery of DYMS System Administrator authority

## Decision

The following policy is approved for the DYMS System Administrator account:

1. The initial System Administrator shall be provisioned through a controlled deployment or bootstrap process.
2. Public registration for the System Administrator role is prohibited.
3. If System Administrator access is lost, recovery shall require verified ownership and a documented administrative recovery procedure.
4. All System Administrator provisioning and recovery actions must be audited.

## Security requirements

- Bootstrap credentials or secrets must not be hard-coded, committed to source control, or exposed in application logs.
- Bootstrap access must be controlled and limited to the authorised deployment/recovery process.
- Recovery must verify the claimant's authority before granting or restoring System Administrator access.
- Provisioning and recovery records must identify the actor or process, affected account, action, timestamp, outcome, and relevant non-secret evidence.
- Recovery must not silently create an additional privileged account or bypass existing authentication and audit controls.

## Details requiring separate specification

This decision approves the policy direction. The following operational details remain open:
- Exact bootstrap mechanism and deployment operator authority.
- How initial credentials are generated, delivered, rotated, and invalidated.
- What evidence verifies ownership during recovery and who validates it.
- Whether recovery requires out-of-band approval or a documented incident procedure.
- How to recover if no System Administrator account remains accessible.
- Whether multiple System Administrator accounts are permitted.
- Emergency access controls, monitoring, and post-recovery review.

These details must be specified before implementation of the bootstrap and recovery workflow.

## Decision boundary

This decision does not authorise public registration, define a complete System Administrator lifecycle, or resolve all of DDD-012. It does not approve Prisma models, migrations, or implementation. Existing authentication and authorization decisions remain unchanged.

Changes require explicit change control.
