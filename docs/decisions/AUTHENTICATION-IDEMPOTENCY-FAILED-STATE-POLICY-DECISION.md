# Authentication Idempotency FAILED-State Policy Decision

- Decision ID: AUTH-IDEM-012
- Related decisions: AUTH-IDEM-001 through AUTH-IDEM-011
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Retry behavior for failed state-changing authentication operations

## Decision

DYMS shall not automatically re-execute a failed logical authentication operation when a retry arrives with the same idempotency key.

During the applicable idempotency retention period, a retry of an operation in FAILED state shall receive the recorded failure outcome for that operation.

A new logical attempt must use a new idempotency key.

Only explicitly classified, safely recoverable failures may be returned to processing, and only through a controlled server-side recovery mechanism. Such recovery must not be triggered merely by a client retry and must not permit duplicate authentication side effects.

## Requirements

1. A client retry with the same key for a FAILED operation must not automatically execute the operation again.
2. The server shall return the recorded failure outcome during the applicable retention period, subject to the approved scope and request-fingerprint checks.
3. A new logical attempt must use a newly generated UUID v4 idempotency key.
4. Any server-side recovery path must classify the failure as safely recoverable and verify that no duplicate side effect can occur.
5. Recovery must be controlled, auditable, and consistent with the authentication operation's transaction and state-transition rules.
6. The design must distinguish a completed business/authentication failure from an infrastructure interruption that leaves the operation outcome uncertain.
7. An uncertain outcome must not be blindly retried if doing so risks repeating a committed side effect.

## Decision boundary

This decision approves the FAILED-state retry policy. It does not define the failure taxonomy, exact recorded failure response, which infrastructure failures qualify for recovery, operator controls, recovery transaction protocol, or handling of an operation whose external side effect cannot be conclusively determined. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
