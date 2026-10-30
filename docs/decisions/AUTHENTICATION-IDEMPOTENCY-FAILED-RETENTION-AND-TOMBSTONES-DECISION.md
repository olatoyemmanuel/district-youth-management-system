# AUTH-IDEM-029: Authentication Idempotency Failed-Record Retention and Key Tombstones

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Retention of terminal failed idempotency records and expired-key protection

## Decision

Retain terminal FAILED idempotency records for 24 hours after the terminal failure transition. Retain compact idempotency-key tombstones for 30 days after the corresponding terminal record expires. A tombstoned key must not initiate a new operation. A new logical operation requires a newly generated UUID v4 idempotency key.

## Rationale

This prevents a previously used key from silently becoming a new operation after its response record has been deleted.

## Constraints

- Tombstones must not contain raw credentials, raw idempotency secrets, or sensitive request payloads.
- Tombstones must retain sufficient scoped key-hash identity to reject reuse.
- Legal holds and active security investigations suspend deletion of relevant records, consistent with the approved retention policy.
- Retention must not extend session or credential lifetimes.
- Cleanup must be auditable, safely retryable, and integrity-preserving.

## Consequences

The persistence design must distinguish terminal response-record retention from compact key-tombstone retention. ERD constraints and cleanup behavior require review before implementation.
