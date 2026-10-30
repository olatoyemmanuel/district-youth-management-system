# DDD-013: Authentication Idempotency Specification

- Document status: DRAFT FOR CONSISTENCY REVIEW
- Prepared: 2026-10-30
- Domain: Authentication and session management
- Decision range incorporated: AUTH-IDEM-001 through AUTH-IDEM-025
- Implementation status: NOT IMPLEMENTED
- Schema/migration authorization: NOT GRANTED

## 1. Purpose

Define the idempotency contract for state-changing authentication operations. The contract prevents duplicate effects when clients retry requests, while preserving authentication secrecy, session integrity, and safe recovery after concurrency or process failure.

This document consolidates approved decisions. It does not claim that the contract has been implemented or verified. It remains a draft because the open items in Section 12 must be resolved before DDD-013 can be marked complete.

## 2. Scope

Idempotency is required for all state-changing authentication operations, including:

- Login.
- Refresh-token rotation.
- Logout of the current session.
- Logout from all sessions.
- Password-reset request.
- Password-reset completion.
- Future state-changing authentication operations.

Read-only requests do not require an idempotency key.

This specification concerns authentication idempotency. It does not define idempotency for non-authentication business domains or external provider workflows.

## 3. Client key contract

### 3.1 Header and format

- Header: `Idempotency-Key`.
- Format: canonical UUID version 4.
- The client must generate the UUID using a cryptographically secure random generator.
- Reject missing, malformed, or multiple conflicting header values.
- The client generates a new key for every new logical operation.
- The same key is reused only when retrying that exact logical operation.
- A key must never be reused for a different operation.

### 3.2 Client retry behavior

A retry must preserve the original key and the original logical request. If the user initiates a new operation, the client must generate a new key.

A retry must not alter the request payload while retaining the same key. The server detects request changes through the fingerprint contract.

## 4. Operation scope and request fingerprint

### 4.1 Scope

The server scopes an idempotency record by the operation/endpoint, authenticated user where available, active session where applicable, and request fingerprint.

Login uses a separate safe pre-authentication scope. It must prevent one unauthenticated client context from retrieving another client's stored result. The precise pre-authentication binding mechanism remains an open design item in Section 12.

### 4.2 Fingerprint algorithm

- The server calculates the fingerprint.
- Use SHA-256 over a canonical request representation.
- The representation includes the HTTP method, endpoint identity, relevant request payload, and applicable user/session identifiers.
- Exclude the idempotency key itself, cookies, authorization credentials, and volatile transport headers.
- JSON payload canonicalization uses RFC 8785 JSON Canonicalization Scheme (JCS).
- Sensitive request fields are represented using HMAC-SHA-256 rather than raw values.
- HMAC keys are 256 bits (32 bytes), generated cryptographically at random, stored outside the database and source repository in deployment secrets, and versioned.
- Retain an old HMAC key version while valid idempotency records still depend on it.
- Never store raw sensitive values or raw credentials in idempotency records, logs, audit events, traces, or error messages.

The exact unambiguous encoding of the HMAC input and the final fingerprint envelope must be specified before implementation.

### 4.3 Non-JSON requests

The approved canonicalization decision requires explicit rules for non-JSON inputs. Authentication endpoints are expected to use JSON, but the allowed content types and canonicalization/rejection behavior for other content types are not yet formally closed. See Section 12.

## 5. Persisted operation lifecycle

The persisted operation states are:

- `IN_PROGRESS`: an operation has been claimed and is being processed.
- `COMPLETED`: the operation reached a successful terminal result.
- `FAILED`: the operation reached an unsuccessful terminal result.

A duplicate request using the same key and matching fingerprint while the original operation is `IN_PROGRESS` must not execute a second time. Return HTTP 409 with a retry instruction.

A retry against a terminal `FAILED` operation returns the recorded failure during the retention period. Client retries do not automatically re-execute a failed operation. A new logical attempt requires a new key. Server-side recovery is allowed only through the controlled process in Section 8.

## 6. Retention

Completed authentication idempotency records are retained for 24 hours after operation completion. Legal holds and active security investigations suspend deletion of relevant records.

Retention must not extend credential lifetimes, refresh-token validity, or session lifetime. Cleanup must be auditable, safely retryable, and preserve integrity.

The approved retention decision explicitly names completed records. The retention treatment of terminal `FAILED` records, expired-key tombstones, and records awaiting recovery must be confirmed before implementation. See Section 12.

## 7. Processing lease and concurrency control

- `IN_PROGRESS` records use a fixed two-minute processing lease.
- The lease does not renew automatically.
- Lease expiry makes a record eligible for controlled recovery assessment only. It does not prove that the original operation failed and does not authorize blind re-execution.
- PostgreSQL row-level locking uses `SELECT ... FOR UPDATE`.
- A fencing/version counter prevents stale workers from committing after a newer recovery claim.
- The fencing counter is PostgreSQL `BIGINT`, initialized to 0 and incremented by 1 for each successful recovery claim.
- Fencing updates and state transitions must be atomic.
- Overflow is an integrity failure and must not wrap or silently reset the counter.
- Use PostgreSQL READ COMMITTED isolation with explicit row-level locking.
- Lock acquisition timeout: 5 seconds. On timeout, abort and roll back the transaction, make no operation-state modification, and classify the result as retryable contention.
- Database transactions have a maximum duration of 10 seconds.
- Do not perform long-running external work while holding database locks.

## 8. Recovery and failure handling

### 8.1 Failure classification

Classify unsuccessful outcomes as:

1. Permanent validation/business failure: terminal `FAILED`; return the recorded failure for same-key retries.
2. Recoverable infrastructure failure: terminal `FAILED` pending controlled assessment. Re-execution is permitted only if evidence establishes non-commit and the operation is explicitly safe to retry.
3. Uncertain commit outcome: do not re-execute until the original outcome is established. Unresolved cases go to controlled recovery or manual review.

The classification does not add new persisted lifecycle states beyond `IN_PROGRESS`, `COMPLETED`, and `FAILED`.

### 8.2 Recovery outcomes

A controlled recovery assessment resolves an operation to one of:

- `COMPLETED`: evidence establishes the original operation committed.
- `FAILED`: evidence establishes non-commit and the operation is not safe to retry.
- `RETRYABLE`: evidence establishes non-commit and an operation-specific rule explicitly permits controlled server-side re-execution.
- `MANUAL_REVIEW`: outcome remains uncertain or requires human intervention.

These are recovery outcomes/classifications, not additional persisted lifecycle states.

### 8.3 Recovery scheduling

- BullMQ schedules and delivers recovery work.
- PostgreSQL is the authoritative source of truth for operation state, lease, fencing version, and recovery outcome.
- Redis/BullMQ is a scheduling and delivery mechanism only.
- Recovery must tolerate duplicate queue delivery without duplicate operation execution.
- Queue messages do not independently authorize re-execution.
- A worker must reload and validate the PostgreSQL operation, lease, state, and fencing counter under the approved locking protocol before acting.
- Use bounded retries and a dead-letter/manual-review path.
- Reconcile persisted eligible operations with queued work.
- Queue payloads must not contain credentials or raw authentication secrets.

### 8.4 Retry backoff

For retryable database lock contention, use exponential backoff with full jitter. The delay ceilings are 250 milliseconds, 500 milliseconds, 1 second, 2 seconds, and 4 seconds. Stop after five attempts and leave unresolved work for controlled recovery scheduling.

Retry exhaustion is not proof that the original operation failed.

## 9. Lock ordering and transaction atomicity

Use a consistent lock-acquisition order:

1. Idempotency operation record.
2. Relevant user record, where required.
3. Relevant session record, where required.
4. Other dependent records in a documented deterministic order.

A workflow may skip records it does not need, but must not reverse the hierarchy. Exceptions require documented deadlock-risk review.

Where an authentication operation has database-side effects, the idempotency state transition and the corresponding authentication database effect must be committed atomically where required by that operation's contract. External calls, response delivery, and queue waits must remain outside the locked transaction.

A timeout or rollback must not be treated as proof of non-commit unless the database outcome is established.

## 10. Response replay and secrecy

For a repeated request with the same valid key and matching fingerprint, return the recorded HTTP status and a safe response representation instead of executing the operation again.

Never persist or replay:

- Passwords.
- Raw access or refresh tokens.
- Session cookies.
- Password-reset tokens or reset links.
- Other authentication secrets.

Before disclosing a stored result, revalidate the caller's current authorization and endpoint-specific conditions. Each endpoint must define which response fields are safe to retain and replay. Secret-bearing responses must not be reconstructed from stored raw credentials.

The endpoint-specific behavior when a completed login or refresh response is lost must be explicitly specified. In particular, this contract must remain consistent with the approved refresh-token no-grace rule: after a committed rotation whose response is lost, the client must reauthenticate rather than reuse a consumed refresh token.

## 11. Security, observability, and test requirements

Implementation must demonstrate:

- Missing, malformed, duplicate, and conflicting idempotency-key handling.
- Same key and same fingerprint does not duplicate an operation.
- Same key with a different fingerprint is rejected.
- Concurrent duplicate requests do not execute twice.
- An `IN_PROGRESS` duplicate receives HTTP 409 with a retry instruction.
- Terminal `FAILED` retries return the recorded failure and do not auto-reexecute.
- Stale recovery workers cannot commit after fencing changes.
- Lease expiry triggers assessment, not blind execution.
- Lock timeout rolls back without modifying operation state.
- Uncertain commit outcomes are not blindly retried.
- Queue redelivery does not duplicate effects.
- HMAC key rotation preserves verification for records still within retention.
- No raw authentication secrets appear in records, logs, audit events, traces, queue payloads, or error responses.
- Retention cleanup respects legal holds and active security investigations.
- Endpoint-specific replay behavior is tested.

Operational telemetry must avoid sensitive payloads and secrets. Recovery exhaustion and manual-review items must be visible to authorized operators.

## 12. Open items required to close DDD-013

The following details are not fully settled by AUTH-IDEM-001 through AUTH-IDEM-025. They remain blockers for a final, implementation-ready contract.

| ID | Open item | Recommended resolution |
|---|---|---|
| DDD13-O1 | Login pre-authentication binding | Issue a short-lived, server-created pre-authentication context bound to a Secure, HttpOnly, SameSite=Lax cookie; store only a hash/reference server-side. Bind login idempotency scope to that context. Define non-browser client handling separately before supporting it. |
| DDD13-O2 | Canonical endpoint identity and non-JSON inputs | Use HTTP method plus stable route template and explicitly defined relevant query parameters. Restrict authentication mutation bodies to JSON with JCS; reject unsupported content types rather than inventing implicit canonicalization. |
| DDD13-O3 | HMAC input encoding and final fingerprint envelope | Use an unambiguous, versioned, domain-separated encoding that includes operation identity and field identity; replace each sensitive value with its HMAC and key version before calculating the final SHA-256 fingerprint. |
| DDD13-O4 | Terminal FAILED retention and expired-key reuse | Retain terminal FAILED records for 24 hours after terminal transition. Define a compact key tombstone or explicit expiry behavior so an old key cannot silently initiate a new operation after its result record is deleted. |
| DDD13-O5 | Exact endpoint replay contract | Define safe status/body replay per endpoint. For login and refresh, never replay cookies or tokens; return a safe already-processed outcome and require a new authentication attempt where the original secret-bearing response cannot be recovered. |
| DDD13-O6 | In-progress HTTP 409 response contract | Standardize an error code such as `IDEMPOTENCY_IN_PROGRESS`, a stable response envelope, and a bounded retry instruction. Define the `Retry-After` value and client behavior. |
| DDD13-O7 | Retry-budget boundary | Confirm that the five-attempt full-jitter policy applies to lock-contention retry attempts and does not authorize client-side re-execution of a terminal or uncertain operation. Define separate worker scheduling limits if required. |
| DDD13-O8 | Transaction and side-effect atomicity by endpoint | Produce a per-endpoint transaction map for login, refresh, logout, logout-all, reset request, and reset completion, including commit point and recovery evidence. |
| DDD13-O9 | HMAC key rotation and compromise operations | Define key identifier format, normal rotation cadence, emergency compromise procedure, and the point at which old key versions may be destroyed after dependent records expire. |
| DDD13-O10 | Idempotency record identity and uniqueness constraints | Finalize the database uniqueness key and indexes for operation scope, key hash, fingerprint, state, lease, and retention. This must be reviewed in the ERD before Prisma schema authorization. |

These recommendations are proposed for decision. They are not approved merely by appearing in this draft.

## 13. Dependencies and boundaries

- DFR-001 and DFR-004 provide the approved authentication architecture and session/token parameters.
- AUTH-IDEM-001 through AUTH-IDEM-025 provide the approved idempotency decisions.
- Authentication retention decisions apply only to authentication records; broader domain retention remains governed by DDD-014.
- Security-event access remains subject to the approved audit-access policy and its unresolved detailed authorization scope.
- External side-effect delivery and recovery beyond the authentication database boundary remain subject to DDD-015.
- This specification does not resolve the User–Member cardinality blocker (MEM-02) and must not introduce a dependency on Member records for authentication session ownership.

## 14. Approval gate

DDD-013 may be marked complete only after:

1. Every open item in Section 12 is explicitly decided.
2. The endpoint transaction and replay matrix is reviewed.
3. The idempotency ERD slice and constraints are reviewed and approved.
4. The consolidated specification passes consistency review against the approved authentication and security decisions.
5. The user explicitly approves the final DDD-013 specification.

No Prisma models, migrations, or production implementation are authorized by this draft.
