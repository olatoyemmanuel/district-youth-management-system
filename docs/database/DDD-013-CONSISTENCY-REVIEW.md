# DDD-013 Consistency Review

- Review date: 2026-10-30
- Specification: `DDD-013-AUTHENTICATION-IDEMPOTENCY-SPECIFICATION.md`
- Review status: POLICY CONSISTENCY PASSED WITH IMPLEMENTATION-CONTRACT GAPS
- ERD readiness: NOT READY
- Prisma/schema authorization: NOT GRANTED

## 1. Review scope

Reviewed the consolidated DDD-013 specification against:

- DFR-001 authentication architecture.
- DFR-004 authentication and session parameters.
- AUTH-IDEM-026 through AUTH-IDEM-041, each explicitly approved by the product owner.
- The previously approved idempotency decisions AUTH-IDEM-001 through AUTH-IDEM-025 as represented in the consolidated specification and project decision history.

This is a design consistency review. It does not establish that software has been implemented or tested.

## 2. Findings that pass

The following policy areas are mutually consistent at the current level of detail:

1. UUID v4 client-generated idempotency keys and reuse only for retries of the same logical operation.
2. Server-calculated SHA-256 fingerprints with RFC 8785 JSON canonicalization.
3. HMAC-SHA-256 treatment of sensitive request fields, 256-bit keys, and key versioning.
4. The IN_PROGRESS, COMPLETED, and FAILED persisted operation states.
5. Two-minute fixed processing lease, PostgreSQL row-level locking, fencing counter, and READ COMMITTED isolation.
6. Five-second lock acquisition timeout, 10-second maximum transaction duration, and bounded lock-contention retry policy.
7. No blind re-execution after uncertain commit outcomes and no automatic client re-execution of terminal FAILED operations.
8. PostgreSQL as source of truth and BullMQ/Redis as recovery scheduling and delivery only.
9. Endpoint-specific response replay prohibiting storage or replay of raw authentication secrets.
10. Completed and failed response-record retention, tombstones, legal holds, and investigation holds.
11. The six-operation transaction map and the requirement to keep external network calls outside database transactions.
12. Authentication session ownership remains independent of the unresolved User–Member cardinality decision.

No direct contradiction was found between these approved policy decisions in the reviewed DDD-013 draft.

## 3. Blocking implementation-contract gaps

These items need explicit resolution or documented technical specification before the authentication idempotency ERD can be approved.

### CR-01: Pre-authentication cookie attributes and lifecycle

AUTH-IDEM-026 specifies Secure, HttpOnly, SameSite=Lax and a 10-minute lifetime. It does not explicitly state the cookie path, host-only behavior, rotation/invalidation rules, or how the context is provisioned for unauthenticated password-reset endpoints.

Recommendation:
- Host-only cookie; omit Domain.
- Path `/api/v1/auth`.
- Max-Age 600 seconds.
- Secure, HttpOnly, SameSite=Lax.
- Store only a cryptographic hash/reference server-side.
- Bind all unauthenticated authentication mutations that require idempotency, including password-reset request and completion, to an appropriate pre-authentication context, while retaining the reset token as a separate HMAC-protected sensitive input.
- Rotate or invalidate the context after expiry and according to the login completion policy.
- Preserve CSRF and Origin validation.

### CR-02: HMAC key version selection during retries

AUTH-IDEM-028 and AUTH-IDEM-034 establish versioned HMAC input and 90-day key rotation, but the retry algorithm must state how the server selects the HMAC key version when a record already exists.

Recommendation:
- New operations use the active HMAC key version.
- For a retry, load the existing record's HMAC key version and recompute the fingerprint using that exact version.
- Retain old key material for the full period in which valid records/tombstones require verification.
- If a key is disabled after compromise and a record cannot safely be verified, do not execute the request; route it to a defined reauthentication or manual-review outcome.

### CR-03: Physical uniqueness for optional identity dimensions

AUTH-IDEM-035 defines principal or pre-authentication context and optional session dimensions. In PostgreSQL, ordinary unique constraints treat NULL values as distinct by default, so a single composite unique constraint with nullable session/principal columns may not enforce the intended uniqueness.

Recommendation:
- Model authenticated and pre-authenticated scopes explicitly.
- Use separate partial unique indexes or another reviewed constraint strategy for each scope.
- Ensure exactly one scope mode applies to each record.
- Review all nullable identity dimensions and foreign keys in the ERD before selecting the final physical constraint.

### CR-04: Transactional outbox and password-reset secret delivery

AUTH-IDEM-033 requires a reset-token creation and outbox record in one transaction, while prohibiting raw reset secrets in ordinary queue payloads. The secure mechanism by which the delivery worker obtains the reset secret is not yet defined.

Recommendation:
- Store the reset secret only in a separate protected short-lived delivery-secret store, encrypted with envelope encryption backed by a managed deployment key.
- Store only an opaque secret reference in the outbox and BullMQ payload.
- Restrict decryption to the delivery worker.
- Expire the protected secret no later than the reset-token lifetime (30 minutes), and erase it after successful delivery or expiry.
- Never expose the secret in logs, traces, audit events, queue payloads, or ordinary database fields.
- Define retry and deletion behavior for delivery failures.

This recommendation requires explicit approval before implementation.

### CR-05: Replay authorization for unauthenticated requests

AUTH-IDEM-022 requires current authorization checks before replay. Login and password-reset operations are unauthenticated, so the replay check must not assume an authenticated user or session exists.

Recommendation:
- For login, validate the live pre-authentication context and its scope.
- For password-reset request/completion, validate the applicable pre-authentication context and reset-token state without revealing whether an account exists.
- For authenticated operations, validate the current user and session state.
- Do not disclose a stored result if its required context has expired or been revoked.

### CR-06: Same key with a different fingerprint

The specification says a key reused with a different fingerprint is rejected, but does not define its exact HTTP status and stable error code.

Recommendation:
- Return HTTP 409.
- Error code: `IDEMPOTENCY_KEY_REUSED`.
- Use the standard DYMS error envelope.
- Do not execute the operation and do not reveal the original request payload or stored response.
- Record a safe security event without logging sensitive fields.

## 4. Additional transaction review notes

The approved transaction map is directionally consistent. Before ERD approval, document the exact transaction boundary and lock sequence for each endpoint.

In particular:
- Login should verify the password without holding a database transaction open, then recheck account eligibility under the appropriate lock before creating the session and completing the idempotency record.
- Refresh must atomically consume the prior refresh-token record, create its replacement, update session activity as required, and complete the idempotency operation.
- Password-reset completion must atomically consume the reset token, update the password, revoke applicable sessions, and complete the idempotency operation.
- Password-reset request must atomically persist the reset-token state, idempotency completion, and outbox reference; secret delivery occurs after commit.
- All workflows must follow the approved lock ordering and the 10-second transaction ceiling.

## 5. ERD readiness checklist

The authentication idempotency ERD slice must show:

- Idempotency operation record and its logical scope.
- Distinct authenticated and pre-authenticated identity representation.
- Request fingerprint and HMAC key version metadata.
- Persisted operation state and processing lease.
- BIGINT fencing counter.
- Terminal result metadata and retention timestamps.
- Compact tombstone identity and expiry.
- Recovery scheduling/outcome metadata or a clearly defined related record.
- Password-reset delivery outbox and protected secret reference boundary.
- Unique constraints, partial indexes, foreign keys, and lifecycle checks.
- Security-event relationships without making session ownership depend on Member cardinality.

## 6. Decision status

The policy decisions AUTH-IDEM-001 through AUTH-IDEM-035 remain approved. This review does not revoke or silently amend them.

CR-01, CR-02, CR-03, CR-04, CR-05, and CR-06 are implementation-contract/ERD gaps. The recommendations above are not approved decisions unless separately accepted by the product owner.

## 7. Gate

DDD-013 remains DRAFT FOR CONSISTENCY REVIEW. The authentication idempotency ERD slice is NOT READY for final approval until the blocking gaps are resolved and reflected in the specification.

No Prisma models, migrations, or production implementation are authorized by this review.


## 8. Product-owner approval of CR-01 through CR-06

On 2026-10-30, the product owner explicitly approved all six recommendations. Each was recorded in a separate formal decision and submitted as an individual pull request:

| Review gap | Decision | Approved resolution | Pull request |
|---|---|---|---|
| CR-01 | AUTH-IDEM-036 | Pre-auth cookie host-only, Path `/api/v1/auth`, Secure, HttpOnly, SameSite=Lax, 600-second lifetime, hashed server-side context, lifecycle and endpoint binding rules | #46 |
| CR-02 | AUTH-IDEM-037 | Existing operation retries use the original record's HMAC key version; unavailable or compromised verification key prevents execution | #47 |
| CR-03 | AUTH-IDEM-038 | Explicit mutually exclusive authenticated/pre-auth identity modes with separate partial unique indexes or equivalent PostgreSQL enforcement | #48 |
| CR-04 | AUTH-IDEM-039 | Protected envelope-encrypted short-lived reset-delivery secret store; outbox and queue carry opaque references only; worker-restricted access and expiry/erasure rules | #49 |
| CR-05 | AUTH-IDEM-040 | Replay validates current authenticated or pre-auth context and reset-token state as applicable; invalid context does not receive stored result | #50 |
| CR-06 | AUTH-IDEM-041 | HTTP 409 with `IDEMPOTENCY_KEY_REUSED`; no execution or sensitive disclosure; safe security event | #51 |

The six decisions are approved by the product owner but their pull requests are open and unmerged. Their records are therefore not yet part of the default branch. The consolidated DDD-013 specification branch has been updated to incorporate the decisions.

## 9. Revised consistency assessment

**Policy consistency:** PASS, subject to the scope of the decisions reviewed. CR-01 through CR-06 are now approved policy and contract decisions.

**ERD readiness:** NOT READY. The approved policies still require physical modeling and verification, including:
- Exact authenticated/pre-auth scope columns, predicates, and partial unique indexes.
- Pre-auth context relationships, lifecycle, and cleanup.
- Protected reset-delivery secret reference and its integration boundary.
- HMAC key-version metadata and retry lookup behavior.
- Tombstone and recovery-record relationships and retention enforcement.
- Endpoint-specific transaction, lock ordering, and replay test coverage.

**Schema/migration authorization:** NOT GRANTED.

The six approved decisions resolve the prior policy questions. They do not constitute approval of the ERD, Prisma models, migrations, or implementation.
