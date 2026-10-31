# DDD-013: Authentication Idempotency Specification

- Document status: DRAFT FOR CONSISTENCY REVIEW
- Prepared: 2026-10-30
- Domain: Authentication and session management
- Decision range incorporated: AUTH-IDEM-001 through AUTH-IDEM-041
- Implementation status: NOT IMPLEMENTED
- Schema/migration authorization: NOT GRANTED

## 1. Purpose

Define the idempotency contract for state-changing authentication operations. The contract prevents duplicate effects when clients retry requests, while preserving authentication secrecy, session integrity, and safe recovery after concurrency or process failure.

This document consolidates approved decisions AUTH-IDEM-001 through AUTH-IDEM-041. It does not claim that the contract has been implemented or verified. The ten policy recommendations previously listed as DDD13-O1 through DDD13-O10 have been explicitly approved and recorded as AUTH-IDEM-026 through AUTH-IDEM-035. DDD-013 now proceeds to consistency review and ERD-slice validation.

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

Login uses a separate safe pre-authentication scope. The server creates a cryptographically random pre-authentication identifier and delivers it in a Secure, HttpOnly, SameSite=Lax cookie with a 10-minute lifetime. Store only a hash or secure reference server-side. Bind login idempotency scope to this context. Non-browser clients require a separately approved binding mechanism before support.

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

Use an unambiguous, versioned, length-prefixed, domain-separated encoding. Identify the operation, field, HMAC key version, and sensitive value. Replace sensitive values with their HMAC representation and key version before calculating the final SHA-256 request fingerprint.

### 4.3 Non-JSON requests

Authentication mutation endpoints accept JSON request bodies only. Reject unsupported content types with HTTP 415. Identify endpoints by HTTP method and stable route template. Include only query parameters explicitly declared semantically relevant by the endpoint. Exclude all other query parameters.

## 5. Persisted operation lifecycle

The persisted operation states are:

- `IN_PROGRESS`: an operation has been claimed and is being processed.
- `COMPLETED`: the operation reached a successful terminal result.
- `FAILED`: the operation reached an unsuccessful terminal result.

A duplicate request using the same key and matching fingerprint while the original operation is `IN_PROGRESS` must not execute a second time. Return HTTP 409 with error code `IDEMPOTENCY_IN_PROGRESS`, the standard DYMS error envelope, and `Retry-After: 1`. Instruct the client to retry the same logical operation with the same key.

A retry against a terminal `FAILED` operation returns the recorded failure during the retention period. Client retries do not automatically re-execute a failed operation. A new logical attempt requires a new key. Server-side recovery is allowed only through the controlled process in Section 8.

## 6. Retention

Completed authentication idempotency records are retained for 24 hours after operation completion. Legal holds and active security investigations suspend deletion of relevant records.

Retention must not extend credential lifetimes, refresh-token validity, or session lifetime. Cleanup must be auditable, safely retryable, and preserve integrity.

Retain terminal `FAILED` records for 24 hours after the terminal failure transition. Retain compact idempotency-key tombstones for 30 days after the corresponding terminal record expires. A tombstoned key must not initiate a new operation. A new logical operation requires a newly generated UUID v4 key. Legal holds and active security investigations suspend deletion of relevant records. Records awaiting recovery must not be deleted while their outcome remains unresolved.

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

For retryable database lock contention, use exponential backoff with full jitter. The delay ceilings are 250 milliseconds, 500 milliseconds, 1 second, 2 seconds, and 4 seconds. Stop after five attempts and leave unresolved work for controlled recovery scheduling. This five-attempt policy applies only to server-side database lock-contention retries. It does not authorize automatic re-execution of terminal `FAILED` or uncertain operations. Client retries preserve the original key and logical request. Recovery workers use a separate bounded scheduling policy and validate persisted PostgreSQL state, lease, and fencing counter before acting.

Retry exhaustion is not proof that the original operation failed.

## 9. Lock ordering and transaction atomicity

Use a consistent lock-acquisition order:

1. Idempotency operation record.
2. Relevant user record, where required.
3. Relevant session record, where required.
4. Other dependent records in a documented deterministic order.

A workflow may skip records it does not need, but must not reverse the hierarchy. Exceptions require documented deadlock-risk review.

The following database work must be atomic for each authentication operation:

| Operation | Atomic database work |
|---|---|
| Login | Idempotency completion and session creation |
| Refresh | Idempotency completion, old refresh-token consumption, and replacement-token creation |
| Logout | Idempotency completion and session revocation |
| Logout all | Idempotency completion and applicable session revocations |
| Password-reset request | Idempotency completion, reset-token creation, and delivery-outbox record |
| Password-reset completion | Idempotency completion, password update, reset-token consumption, and session revocation |

External email delivery and other network calls execute outside the database transaction. Where delivery must follow a committed database change, persist a transactional outbox record in the same transaction. Outbox payloads must not contain raw credentials or reset secrets unless a separately approved secure delivery design explicitly requires a protected short-lived secret reference.

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

Endpoint-specific replay behavior is approved as follows: login never replays authentication cookies or tokens; if the original secret-bearing response is unavailable, require a new login attempt with a new key. Refresh never replays replacement tokens; if a committed rotation response is lost, require reauthentication rather than reuse of a consumed refresh token. Logout and logout-all return their recorded safe success response. Password-reset requests return a generic safe response. Password-reset completion returns a safe completion response without exposing the reset token.

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

## 12. Approved completion decisions

The ten outstanding policy recommendations have been explicitly approved and recorded separately:

| Decision | Approved subject | Formal record |
|---|---|---|
| AUTH-IDEM-026 | Login pre-authentication binding: server-issued context, Secure HttpOnly SameSite=Lax cookie, 10-minute lifetime, server-side hash/reference | `AUTHENTICATION-IDEMPOTENCY-PREAUTH-BINDING-DECISION.md` |
| AUTH-IDEM-027 | JSON-only mutation bodies, RFC 8785 canonicalization, stable route templates, explicit relevant query parameters, HTTP 415 for unsupported content types | `AUTHENTICATION-IDEMPOTENCY-REQUEST-CANONICALIZATION-DECISION.md` |
| AUTH-IDEM-028 | Versioned, domain-separated, length-prefixed HMAC input encoding | `AUTHENTICATION-IDEMPOTENCY-HMAC-INPUT-ENCODING-DECISION.md` |
| AUTH-IDEM-029 | FAILED record retention for 24 hours and compact key tombstones for 30 days | `AUTHENTICATION-IDEMPOTENCY-FAILED-RETENTION-AND-TOMBSTONES-DECISION.md` |
| AUTH-IDEM-030 | Endpoint-specific safe replay rules for login, refresh, logout, logout-all, and password reset | `AUTHENTICATION-IDEMPOTENCY-ENDPOINT-RESPONSE-REPLAY-DECISION.md` |
| AUTH-IDEM-031 | HTTP 409 contract, `IDEMPOTENCY_IN_PROGRESS`, standard error envelope, and `Retry-After: 1` | `AUTHENTICATION-IDEMPOTENCY-IN-PROGRESS-HTTP-409-CONTRACT-DECISION.md` |
| AUTH-IDEM-032 | Five-attempt lock-contention retry budget kept separate from client retries and recovery scheduling | `AUTHENTICATION-IDEMPOTENCY-RETRY-BUDGET-BOUNDARY-DECISION.md` |
| AUTH-IDEM-033 | Atomic per-endpoint transaction map and transactional outbox for post-commit delivery | `AUTHENTICATION-IDEMPOTENCY-ENDPOINT-TRANSACTION-MAP-DECISION.md` |
| AUTH-IDEM-034 | HMAC key rotation every 90 days, versioned identifiers, and compromise handling | `AUTHENTICATION-IDEMPOTENCY-HMAC-KEY-ROTATION-DECISION.md` |
| AUTH-IDEM-035 | Logical idempotency identity, separate fingerprint, uniqueness behavior, and required index families | `AUTHENTICATION-IDEMPOTENCY-DATABASE-IDENTITY-AND-CONSTRAINTS-DECISION.md` |

These decisions close the ten policy questions in the prior review batch. They do not by themselves approve physical database columns, exact index definitions, Prisma models, or migrations.

### 12.1 Remaining consistency and ERD validation

Before DDD-013 is finalized:

1. Validate the logical identity and uniqueness rule against the physical ERD, including how pre-authentication contexts, principals, and optional sessions are represented.
2. Define the exact deterministic byte-level serialization for the approved length-prefixed HMAC input and final fingerprint envelope in the implementation contract and tests.
3. Define the secure transactional-outbox secret-delivery mechanism for password-reset messages. Raw reset secrets must not be placed in ordinary queue payloads or logs.
4. Confirm tombstone identity, retention cleanup, legal-hold behavior, and interaction with unresolved recovery records in the ERD.
5. Verify that the endpoint-specific transaction map and replay rules are consistent with the approved refresh-token no-grace behavior.
6. Complete consistency review against DFR-001, DFR-004, AUTH-IDEM-001 through AUTH-IDEM-035, and the wider audit/security decisions.

These are validation and physical-design tasks. They do not reopen the approved policy decisions unless a concrete contradiction is found and raised through change control.

## 13. Dependencies and boundaries

- DFR-001 and DFR-004 provide the approved authentication architecture and session/token parameters.
- AUTH-IDEM-001 through AUTH-IDEM-035 provide the approved idempotency decisions.
- Authentication retention decisions apply only to authentication records; broader domain retention remains governed by DDD-014.
- Security-event access remains subject to the approved audit-access policy and its unresolved detailed authorization scope.
- External side-effect delivery and recovery beyond the authentication database boundary remain subject to DDD-015.
- MEM-02 now approves one-to-one User–Member cardinality. Authentication session ownership remains directly associated with User and must not depend on Member records.

## 14. Approval gate

DDD-013 may be marked complete only after:

1. The remaining consistency and ERD validation tasks in Section 12.1 are completed.
2. The endpoint transaction and replay matrix is reviewed.
3. The idempotency ERD slice and physical constraints are reviewed and approved.
4. The consolidated specification passes consistency review against the approved authentication and security decisions.
5. The user explicitly approves the final DDD-013 specification.

No Prisma models, migrations, or production implementation are authorized by this draft.


## 12.2 Approved consistency-gap resolutions: AUTH-IDEM-036 through AUTH-IDEM-041

The product owner explicitly approved all six recommendations from the consistency review on 2026-10-30. Each is recorded as a separate formal decision:

| Decision | Approved resolution | Formal record |
|---|---|---|
| AUTH-IDEM-036 | Host-only pre-auth cookie, no Domain, Path `/api/v1/auth`, Secure, HttpOnly, SameSite=Lax, Max-Age 600; hashed server-side context; bind login and password-reset mutations; rotate/invalidate context; non-browser clients require separate design | `AUTHENTICATION-IDEMPOTENCY-PREAUTH-COOKIE-LIFECYCLE-DECISION.md` |
| AUTH-IDEM-037 | New operations use active HMAC key version; retries use the version stored on the original operation; retain required versions; unavailable/compromised key means no execution and controlled review | `AUTHENTICATION-IDEMPOTENCY-HMAC-KEY-VERSION-SELECTION-DECISION.md` |
| AUTH-IDEM-038 | Explicit mutually exclusive authenticated and pre-auth scope modes; separate partial unique indexes or equivalent; do not rely on nullable composite UNIQUE semantics | `AUTHENTICATION-IDEMPOTENCY-POSTGRES-SCOPE-UNIQUENESS-DECISION.md` |
| AUTH-IDEM-039 | Reset delivery secret held separately in envelope-encrypted short-lived secret storage; outbox/queue contain opaque reference only; worker-only access; expire by reset-token lifetime and erase after delivery/expiry | `PASSWORD-RESET-DELIVERY-SECRET-PROTECTION-DECISION.md` |
| AUTH-IDEM-040 | Replay validates live context: authenticated principal/session for authenticated operations, pre-auth context for login/reset, reset-token state for completion; no sensitive disclosure when context is invalid | `AUTHENTICATION-IDEMPOTENCY-REPLAY-AUTHORIZATION-CONTEXT-DECISION.md` |
| AUTH-IDEM-041 | Same idempotency identity with different fingerprint returns HTTP 409, `IDEMPOTENCY_KEY_REUSED`, standard error envelope; no execution or sensitive disclosure; safe security event | `AUTHENTICATION-IDEMPOTENCY-KEY-FINGERPRINT-CONFLICT-DECISION.md` |

These six decisions resolve the policy questions raised as CR-01 through CR-06. Their exact physical representation, vendor-specific secret-store integration, index predicates, and endpoint-level tests remain subject to ERD and implementation-contract validation. In particular, AUTH-IDEM-039 approves the protection pattern, not a specific secret-store vendor or deployment product.

## 12.3 Updated validation gate

The six policy gaps CR-01 through CR-06 are approved and separately recorded. DDD-013 is not yet complete: the remaining work is to incorporate these decisions into the ERD slice, specify exact physical constraints and secret-store integration, validate endpoint transaction/replay behavior, complete consistency review, and obtain explicit approval of the final DDD-013 specification.

No Prisma models, migrations, or production implementation are authorized by this update.
