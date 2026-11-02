# DDD-013 Approval Evidence Recovery

- Review date: 2026-11-02
- Domain decision: DDD-013, idempotency and safe mutation replay
- Scope: Authentication idempotency follow-up approvals and PostgreSQL fencing/version counter
- Review status: PARTIAL RECOVERY; POLICY DETAILS RECOVERED; SOURCE/VARIANT GAPS REMAIN
- Physical database design approval: NOT GRANTED
- Implementation authorization: NOT AUTHORIZED

## 1. Purpose

This record corrects the earlier statement that no DDD-013 follow-up approval evidence had been located in the reviewed branch. Repository pull-request history contains explicit product-owner approval records dated 2026-10-30. The records are not all merged into the default branch, and the fencing-counter record has two competing versions under the same decision ID. This document records what the evidence supports and does not silently resolve the conflict.

## 2. Recovered BIGINT fencing/version counter approval

### 2.1 Common approved core

Two pull requests record the same decision ID, AUTH-IDEM-016, and both state that the user explicitly approved the decision on 2026-10-30:

- [PR #25](https://github.com/olatoyemmanuel/district-youth-management-system/pull/25), created 2026-10-30 16:53:36 UTC.
- [PR #52](https://github.com/olatoyemmanuel/district-youth-management-system/pull/52), created 2026-10-30 18:40:10 UTC.

Both records explicitly support this common decision:

1. Use PostgreSQL BIGINT for the authentication idempotency recovery fencing/version counter.
2. Initialize the counter to 0.
3. Increment it by exactly 1 for every successful recovery claim.
4. Reject stale fencing/version values and prevent stale workers from committing state changes.
5. Coordinate claim, counter update, and fencing validation atomically/transactionally.
6. Do not authorize Prisma models, migrations, or implementation.

The decision authority is the product owner. The PR bodies explicitly state that the user's approval occurred on 2026-10-30. The formal decision file identifies AUTH-IDEM-016 and status APPROVED.

### 2.2 Material version conflict requiring owner confirmation

PR #25 and PR #52 add the same decision ID but do not have identical boundaries.

| Subject | PR #25, earlier version | PR #52, later version |
|---|---|---|
| Overflow | Explicitly treats overflow as an exceptional integrity failure and prohibits wrap/reset | Explicitly leaves overflow handling open |
| Exact column nullability/default constraints | Not specified in the decision boundary | Explicitly left open |
| Locking | Atomic claim/increment and current-version validation | Transactional coordination with approved row-level locking |
| Counter reuse | Stale worker must not commit | Counter must not be reset or reused during an operation's lifetime |

Both pull requests remain OPEN and UNMERGED in the repository at review time. PR #52 is a later revision but does not explicitly state that it supersedes PR #25. No supersession statement or owner clarification was found in the inspected PR bodies and patches.

**Safe conclusion:** PostgreSQL BIGINT, initial value 0, increment-by-one on successful recovery claim, atomic coordination, and stale-value rejection are recovered as approved. The precise approval status of overflow handling is not settled by the conflicting AUTH-IDEM-016 records. Do not silently select either version. Ask the product owner whether overflow must be treated as an integrity failure with no wrap/reset, or remains an implementation-level integrity rule to be specified separately.

The consolidated DDD-013 specification in PR #35 includes overflow-as-integrity-failure language, matching PR #25. Because PR #52 later leaves overflow open, that consolidated statement must be treated as requiring owner reconciliation before DDD-013 is marked complete.

## 3. Recovered AUTH-IDEM decision series

The repository contains a consolidated specification in [PR #35](https://github.com/olatoyemmanuel/district-youth-management-system/pull/35):

- File: `docs/database/DDD-013-AUTHENTICATION-IDEMPOTENCY-SPECIFICATION.md`
- Branch: `spec/ddd-013-auth-idempotency-20261030`
- File status: DRAFT FOR CONSISTENCY REVIEW
- Decision range stated: AUTH-IDEM-001 through AUTH-IDEM-041
- Implementation status: NOT IMPLEMENTED
- Schema/migration authorization: NOT GRANTED
- PR status at review: OPEN and UNMERGED.

The consolidated specification explicitly states that AUTH-IDEM-001 through AUTH-IDEM-041 are incorporated as approved decisions. It further states that ten earlier policy recommendations were approved and separately recorded as AUTH-IDEM-026 through AUTH-IDEM-035, and six consistency recommendations CR-01 through CR-06 were approved and recorded as AUTH-IDEM-036 through AUTH-IDEM-041.

### 3.1 Individually identified approval records recovered

All of the following individual pull requests state that the product owner/user explicitly approved the corresponding decision on 2026-10-30. The records are documentation/governance only and do not authorize implementation.

| Decision | Subject | Pull request |
|---|---|---|
| AUTH-IDEM-026 | Login pre-authentication binding | [PR #36](https://github.com/olatoyemmanuel/district-youth-management-system/pull/36) |
| AUTH-IDEM-027 | Authentication request canonicalization | [PR #37](https://github.com/olatoyemmanuel/district-youth-management-system/pull/37) |
| AUTH-IDEM-028 | HMAC input encoding | [PR #38](https://github.com/olatoyemmanuel/district-youth-management-system/pull/38) |
| AUTH-IDEM-029 | Failed-record retention and key tombstones | [PR #39](https://github.com/olatoyemmanuel/district-youth-management-system/pull/39) |
| AUTH-IDEM-030 | Endpoint-specific authentication response replay | [PR #40](https://github.com/olatoyemmanuel/district-youth-management-system/pull/40) |
| AUTH-IDEM-031 | In-progress idempotency HTTP 409 contract | [PR #41](https://github.com/olatoyemmanuel/district-youth-management-system/pull/41) |
| AUTH-IDEM-032 | Authentication idempotency retry-budget boundary | [PR #42](https://github.com/olatoyemmanuel/district-youth-management-system/pull/42) |
| AUTH-IDEM-033 | Authentication endpoint transaction map | [PR #43](https://github.com/olatoyemmanuel/district-youth-management-system/pull/43) |
| AUTH-IDEM-034 | Authentication idempotency HMAC key rotation | [PR #44](https://github.com/olatoyemmanuel/district-youth-management-system/pull/44) |
| AUTH-IDEM-035 | Authentication idempotency database identity and constraints | [PR #45](https://github.com/olatoyemmanuel/district-youth-management-system/pull/45) |
| AUTH-IDEM-036 | Pre-authentication cookie lifecycle | [PR #46](https://github.com/olatoyemmanuel/district-youth-management-system/pull/46) |
| AUTH-IDEM-037 | HMAC key-version selection on retries | [PR #47](https://github.com/olatoyemmanuel/district-youth-management-system/pull/47) |
| AUTH-IDEM-038 | PostgreSQL idempotency scope uniqueness | [PR #48](https://github.com/olatoyemmanuel/district-youth-management-system/pull/48) |
| AUTH-IDEM-039 | Password-reset delivery secret protection | [PR #49](https://github.com/olatoyemmanuel/district-youth-management-system/pull/49) |
| AUTH-IDEM-040 | Idempotency replay authorization context | [PR #50](https://github.com/olatoyemmanuel/district-youth-management-system/pull/50) |
| AUTH-IDEM-041 | Idempotency key fingerprint conflict response | [PR #51](https://github.com/olatoyemmanuel/district-youth-management-system/pull/51) |

PR #35's consolidated specification also identifies AUTH-IDEM-001 through AUTH-IDEM-025 as approved and incorporates their requirements. However, this recovery pass did not independently recover the exact original approval wording and provenance for every one of those 25 individual decisions. The consolidated specification is evidence of the recorded project baseline, but the missing individual source records should remain linked or recovered where available.

### 3.2 CR-01 through CR-06 approvals

The consistency review file in PR #35 states that all six recommendations were explicitly approved by the product owner on 2026-10-30 and records them as follows:

| Gap | Decision | Approved subject | Pull request |
|---|---|---|---|
| CR-01 | AUTH-IDEM-036 | Host-only pre-auth cookie, Path `/api/v1/auth`, Secure, HttpOnly, SameSite=Lax, 600-second lifetime, hashed context and lifecycle rules | #46 |
| CR-02 | AUTH-IDEM-037 | Retries use the HMAC key version stored on the original operation; unavailable/compromised key prevents execution | #47 |
| CR-03 | AUTH-IDEM-038 | Mutually exclusive authenticated/pre-auth scope modes with separate partial unique indexes or equivalent | #48 |
| CR-04 | AUTH-IDEM-039 | Envelope-encrypted short-lived reset-delivery secret store; outbox/queue carry opaque references only | #49 |
| CR-05 | AUTH-IDEM-040 | Replay validates current authenticated/pre-auth context and reset-token state | #50 |
| CR-06 | AUTH-IDEM-041 | HTTP 409 with `IDEMPOTENCY_KEY_REUSED`; no execution or sensitive disclosure | #51 |

The consolidated specification and consistency review agree that these are policy/contract approvals, while exact physical constraints, index predicates, secret-store integration, and endpoint-level tests remain ERD/technical validation tasks.

## 4. Consolidated specification review findings

The PR #35 DDD-013 specification records these approved authentication idempotency behaviors:

- UUID v4 client-generated idempotency keys.
- Server-generated SHA-256 request fingerprints and RFC 8785 JSON canonicalization.
- HMAC-SHA-256 treatment of sensitive request fields with versioned keys.
- Persisted states IN_PROGRESS, COMPLETED, and FAILED.
- Two-minute processing lease.
- PostgreSQL row-level locking and fencing/version counter.
- READ COMMITTED isolation, five-second lock acquisition timeout, and ten-second transaction ceiling.
- No blind re-execution after uncertain commit outcomes.
- BullMQ/Redis as scheduling/delivery only; PostgreSQL remains authoritative.
- Endpoint-specific response replay that does not persist or replay raw authentication secrets.
- 24-hour completed/failed operation retention, 30-day compact tombstones, subject to holds.
- Atomic endpoint transaction boundaries and transactional outbox for password-reset delivery.
- Current authorization/context validation before replay.

These are the terms recorded by the consolidated specification. Their approval status is bounded by the individual decision records and the unresolved AUTH-IDEM-016 overflow discrepancy above.

## 5. Remaining gaps and required actions

1. **AUTH-IDEM-016 variant reconciliation:** Owner must confirm whether overflow handling is part of the approved decision or remains open. Preserve both PR references; do not silently overwrite.
2. **AUTH-IDEM-001–025 provenance:** PR #35 says the range is approved and incorporated, but exact individual source records were not independently recovered in this pass. Link/recover them before claiming complete per-decision provenance.
3. **PR merge state:** PR #25, #35, and #36–#52 were found open and unmerged during this review. The decision text is evidence of recorded owner approval, but the files are not all present on the default branch. Do not claim the records are merged/canonical on main.
4. **DDD-013 completion:** The consolidated spec and consistency review still say the authentication idempotency ERD slice is NOT READY. Physical uniqueness, exact columns/index predicates, secret-store integration, retention enforcement, transaction/lock behavior, and endpoint test evidence remain to be validated.
5. **Formal DDD-013 final approval:** The specification itself says final explicit project-owner approval is still required after ERD validation.

## 6. Governance boundary

This recovery changes the evidence assessment, not the implementation gate.

- DFR-001 through DFR-006 remain preserved.
- The approved conceptual ERD remains approved only for progression to physical-design review.
- Physical database design approval remains NOT GRANTED.
- No SQL DDL, Prisma schema, migrations, database objects, seeds, generated clients, APIs, or application code are authorized.
- DDD-013 remains APPROVED PRINCIPLE / TECHNICAL FOLLOW-UP IN PROGRESS, not complete.

## 7. Source index

- [PR #25 — AUTH-IDEM-016 fencing counter, earlier record](https://github.com/olatoyemmanuel/district-youth-management-system/pull/25)
- [PR #35 — consolidated DDD-013 specification and consistency review](https://github.com/olatoyemmanuel/district-youth-management-system/pull/35)
- [PR #36–#51 — AUTH-IDEM-026 through AUTH-IDEM-041](https://github.com/olatoyemmanuel/district-youth-management-system/pulls?q=is%3Apr+AUTH-IDEM)
- [PR #52 — AUTH-IDEM-016 fencing counter, later record](https://github.com/olatoyemmanuel/district-youth-management-system/pull/52)
