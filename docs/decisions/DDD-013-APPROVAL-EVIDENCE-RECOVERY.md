# DDD-013 Approval Evidence Recovery

- Review date: 2026-11-02
- Domain decision: DDD-013, idempotency and safe mutation replay
- Scope: Authentication idempotency follow-up approvals and PostgreSQL fencing/version counter
- Review status: INDIVIDUAL AUTH-IDEM-001–025 PR RECORDS RECOVERED; POLICY DETAILS RECOVERED; AUTH-IDEM-016 OVERFLOW CONFLICT RESOLVED
- Physical database design approval: NOT GRANTED
- Implementation authorization: NOT AUTHORIZED

## 1. Purpose

This record corrects the earlier statement that no DDD-013 follow-up approval evidence had been located in the reviewed branch. Repository pull-request history contains explicit product-owner approval records dated 2026-10-30. The records are not all merged into the default branch. The fencing-counter record has two historical versions under the same decision ID; the project owner resolved their overflow wording conflict on 2026-11-02. This document preserves the historical difference and records the clarification.

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

### 2.2 Historical version difference and owner resolution

PR #25 and PR #52 use AUTH-IDEM-016 but differ on overflow treatment. PR #25 treats overflow as an integrity failure and prohibits wrap/reset; PR #52 leaves overflow handling open. PR #52 does not explicitly supersede PR #25.

The project owner resolved this difference on **2026-11-02**, explicitly approving the PR #25 treatment. The formal clarification is [AUTH-IDEM-016-OVERFLOW-CLARIFICATION.md](AUTH-IDEM-016-OVERFLOW-CLARIFICATION.md).

The binding clarified rule is:
1. Counter overflow is an integrity failure.
2. The counter must never wrap, reset, or silently reuse a prior value.
3. If the next increment would exceed the supported BIGINT range, fail closed. The recovery claim/state transition must not proceed.
4. Route the affected operation to controlled recovery or manual intervention.
5. Record and surface the integrity event to authorized operators without exposing secrets.

The common approved core remains PostgreSQL BIGINT, initial value 0, increment-by-one per successful recovery claim, atomic claim/counter coordination, and stale fencing-value rejection. The historical PR wording is preserved; the 2026-11-02 owner clarification resolves the overflow question without rewriting either PR.

PR #52 also leaves exact column nullability/default constraints open. Those remain physical-design questions, not policy approvals.

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

### 3.1 Individually identified approval records recovered: AUTH-IDEM-001–025

The review recovered a separate formal decision document for every decision AUTH-IDEM-001 through AUTH-IDEM-025. The corresponding pull-request descriptions explicitly state that the product owner/user approved the decision on 2026-10-30. Each changed-file patch identifies the matching AUTH-IDEM decision ID, labels the decision APPROVED (AUTH-IDEM-001 is APPROVED REQUIREMENT; detailed contract remains open), and records the same approval date.

| Decision | Subject | Formal decision file | Pull request |
|---|---|---|---|
| AUTH-IDEM-001 | Idempotency keys required for all state-changing authentication operations | `AUTHENTICATION-IDEMPOTENCY-REQUIREMENT-DECISION.md` | [#10](https://github.com/olatoyemmanuel/district-youth-management-system/pull/10) |
| AUTH-IDEM-002 | New random key per logical operation; reuse only for exact retries | `IDEMPOTENCY-KEY-GENERATION-AND-REUSE-DECISION.md` | [#11](https://github.com/olatoyemmanuel/district-youth-management-system/pull/11) |
| AUTH-IDEM-003 | UUID v4 format and Idempotency-Key header | `IDEMPOTENCY-KEY-FORMAT-DECISION.md` | [#12](https://github.com/olatoyemmanuel/district-youth-management-system/pull/12) |
| AUTH-IDEM-004 | Operation, principal, session and fingerprint scope; separate login pre-auth scope | `AUTHENTICATION-IDEMPOTENCY-SCOPE-DECISION.md` | [#13](https://github.com/olatoyemmanuel/district-youth-management-system/pull/13) |
| AUTH-IDEM-005 | SHA-256 request fingerprint over canonical request representation | `AUTHENTICATION-IDEMPOTENCY-FINGERPRINT-DECISION.md` | [#14](https://github.com/olatoyemmanuel/district-youth-management-system/pull/14) |
| AUTH-IDEM-006 | RFC 8785 JSON Canonicalization Scheme | `AUTHENTICATION-IDEMPOTENCY-JSON-CANONICALIZATION-DECISION.md` | [#15](https://github.com/olatoyemmanuel/district-youth-management-system/pull/15) |
| AUTH-IDEM-007 | HMAC-SHA-256 representation for sensitive request fields | `AUTHENTICATION-IDEMPOTENCY-SENSITIVE-FIELD-FINGERPRINTING-DECISION.md` | [#16](https://github.com/olatoyemmanuel/district-youth-management-system/pull/16) |
| AUTH-IDEM-008 | Versioned HMAC keys and retention of old keys while records depend on them | `AUTHENTICATION-IDEMPOTENCY-HMAC-KEY-VERSIONING-AND-ROTATION-DECISION.md` | [#17](https://github.com/olatoyemmanuel/district-youth-management-system/pull/17) |
| AUTH-IDEM-009 | 256-bit cryptographically random HMAC keys | `AUTHENTICATION-IDEMPOTENCY-HMAC-KEY-SIZE-DECISION.md` | [#18](https://github.com/olatoyemmanuel/district-youth-management-system/pull/18) |
| AUTH-IDEM-010 | 24-hour retention for completed idempotency records | `AUTHENTICATION-IDEMPOTENCY-RECORD-RETENTION-DECISION.md` | [#19](https://github.com/olatoyemmanuel/district-youth-management-system/pull/19) |
| AUTH-IDEM-011 | IN_PROGRESS, COMPLETED and FAILED operation states | `AUTHENTICATION-IDEMPOTENCY-OPERATION-STATES-DECISION.md` | [#20](https://github.com/olatoyemmanuel/district-youth-management-system/pull/20) |
| AUTH-IDEM-012 | No automatic client retry re-execution of FAILED operations | `AUTHENTICATION-IDEMPOTENCY-FAILED-STATE-POLICY-DECISION.md` | [#21](https://github.com/olatoyemmanuel/district-youth-management-system/pull/21) |
| AUTH-IDEM-013 | Two-minute processing lease and controlled recovery assessment | `AUTHENTICATION-IDEMPOTENCY-PROCESSING-LEASE-AND-RECOVERY-DECISION.md` | [#22](https://github.com/olatoyemmanuel/district-youth-management-system/pull/22) |
| AUTH-IDEM-014 | Fixed two-minute lease; no automatic renewal | `AUTHENTICATION-IDEMPOTENCY-FIXED-PROCESSING-LEASE-DECISION.md` | [#23](https://github.com/olatoyemmanuel/district-youth-management-system/pull/23) |
| AUTH-IDEM-015 | PostgreSQL row locking and fencing for recovery-worker coordination | `AUTHENTICATION-IDEMPOTENCY-RECOVERY-WORKER-COORDINATION-DECISION.md` | [#24](https://github.com/olatoyemmanuel/district-youth-management-system/pull/24) |
| AUTH-IDEM-016 | PostgreSQL BIGINT fencing counter, initial 0, increment by 1 | `AUTHENTICATION-IDEMPOTENCY-FENCING-COUNTER-DECISION.md` | [#25](https://github.com/olatoyemmanuel/district-youth-management-system/pull/25) |
| AUTH-IDEM-017 | READ COMMITTED isolation with explicit row-level locking | `AUTHENTICATION-IDEMPOTENCY-RECOVERY-ISOLATION-LEVEL-DECISION.md` | [#26](https://github.com/olatoyemmanuel/district-youth-management-system/pull/26) |
| AUTH-IDEM-018 | Five-second PostgreSQL recovery row-lock timeout | `AUTHENTICATION-IDEMPOTENCY-RECOVERY-LOCK-TIMEOUT-DECISION.md` | [#27](https://github.com/olatoyemmanuel/district-youth-management-system/pull/27) |
| AUTH-IDEM-019 | Exponential backoff with full jitter and five delay ceilings | `AUTHENTICATION-IDEMPOTENCY-RETRY-BACKOFF-DECISION.md` | [#28](https://github.com/olatoyemmanuel/district-youth-management-system/pull/28) |
| AUTH-IDEM-020 | Maximum ten-second database transaction duration | `AUTHENTICATION-IDEMPOTENCY-TRANSACTION-DURATION-DECISION.md` | [#29](https://github.com/olatoyemmanuel/district-youth-management-system/pull/29) |
| AUTH-IDEM-021 | Deterministic lock-acquisition order | `AUTHENTICATION-IDEMPOTENCY-LOCK-ORDERING-DECISION.md` | [#30](https://github.com/olatoyemmanuel/district-youth-management-system/pull/30) |
| AUTH-IDEM-022 | Replay safe stored HTTP status/response without re-executing | `AUTHENTICATION-IDEMPOTENCY-RESPONSE-REPLAY-DECISION.md` | [#31](https://github.com/olatoyemmanuel/district-youth-management-system/pull/31) |
| AUTH-IDEM-023 | Permanent, recoverable and uncertain failure classification | `AUTHENTICATION-IDEMPOTENCY-FAILURE-CLASSIFICATION-DECISION.md` | [#32](https://github.com/olatoyemmanuel/district-youth-management-system/pull/32) |
| AUTH-IDEM-024 | Controlled recovery outcomes: COMPLETED, FAILED, RETRYABLE, MANUAL_REVIEW | `AUTHENTICATION-IDEMPOTENCY-RECOVERY-OUTCOMES-DECISION.md` | [#33](https://github.com/olatoyemmanuel/district-youth-management-system/pull/33) |
| AUTH-IDEM-025 | BullMQ recovery scheduling; PostgreSQL remains authoritative | `AUTHENTICATION-IDEMPOTENCY-RECOVERY-SCHEDULING-DECISION.md` | [#34](https://github.com/olatoyemmanuel/district-youth-management-system/pull/34) |

All 25 PRs (#10–#34) were checked individually. At review time, each was OPEN and UNMERGED. Their PR descriptions state the owner approval date, and their changed-file patches contain the matching formal decision ID, APPROVED status and 2026-10-30 date. This is decision-specific repository provenance, stronger than the consolidated PR #35 summary alone. It is not a cryptographically signed approval transcript; the evidence is the owner-authored GitHub PR record and its formal decision file. The documents remain unmerged and must not be described as present on the default branch.

### 3.2 Individually identified approval records recovered: AUTH-IDEM-026–041

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

### 3.3 CR-01 through CR-06 approvals

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

These are the terms recorded by the consolidated specification. The AUTH-IDEM-016 overflow treatment is clarified by the explicit owner decision dated 2026-11-02.

## 5. Remaining gaps and required actions

1. **AUTH-IDEM-016 overflow:** RESOLVED on 2026-11-02. Overflow is an integrity failure; wrapping/reset/reuse is prohibited; fail closed and route to controlled recovery/manual intervention. See AUTH-IDEM-016-OVERFLOW-CLARIFICATION.md.
2. **AUTH-IDEM-001–025 provenance:** RECOVERED. Separate owner-authored PRs #10–#34 and their matching formal decision files identify every decision, APPROVED status, and 2026-10-30 approval date. PRs remain open/unmerged; provenance is recorded in this file.
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

- [AUTH-IDEM-016 overflow clarification — project-owner approval, 2026-11-02](AUTH-IDEM-016-OVERFLOW-CLARIFICATION.md)
