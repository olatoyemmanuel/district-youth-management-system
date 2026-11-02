# DYMS Phase 3 — DDD-013 Physical Slice Engineering Review

- Revision: D13-ER-01
- Date: 2026-11-02
- Scope: Authentication idempotency and password-reset delivery
- Governing decisions: AUTH-IDEM-001–041; CR-01–CR-06; AUTH-IDEM-016 overflow clarification
- Design inputs: D13-PDR-01 and TBR-01
- Review type: **Internal engineering consistency review**
- External independent review: **PENDING**
- Physical approval: **NOT GRANTED**
- Implementation: **NOT AUTHORIZED**

## 1. Review result

The D13-PDR-01 design has been reconciled into the Phase 3 column, FK, index and integrity registers. The six original document-level findings are technically addressed by the current candidate. The ten review questions below have an internal engineering disposition.

This is not an external independent reviewer response and does not convert D13-PDR-01 into an approved physical schema. The external review gate remains open.

## 2. Findings against the six original blockers

| Finding | Reconciliation | Disposition |
|---|---|---|
| PDB-D13-01 mandatory actor FK blocked pre-authentication | Nullable actor/session plus required pre-auth context in PRE_AUTHENTICATION mode; mutually exclusive CHECK | Addressed in candidate |
| PDB-D13-02 four old scope indexes did not enforce the two identity modes | Two partial unique indexes, authenticated and pre-authentication; request fingerprint excluded | Addressed in candidate |
| PDB-D13-03 HMAC, fencing, response retention, tombstone and recovery metadata incomplete | 23-column idempotency record plus append-only recovery event ledger | Addressed in candidate |
| PDB-D13-04 password-reset outbox/token/idempotency boundary incomplete | Outbox references idempotency record, reset token and opaque protected-secret reference | Addressed in candidate |
| PDB-D13-05 authentication and business idempotency boundary unclear | DDD-013 persistence applies to authentication operations only | Addressed in candidate |
| PDB-D13-06 FK and lifecycle enforcement incomplete | Session-owner composite FK, pre-auth FK, named CHECKs, unique indexes and cleanup ordering | Addressed in candidate |

## 3. Ten-point technical review

### 3.1 Authenticated/pre-authentication truth table

**Disposition: ACCEPT, with endpoint-contract dependency.**

| scope_mode | actor_user_account_id | session_id | pre_auth_context_id | Result |
|---|---|---|---|---|
| AUTHENTICATED | NOT NULL | NOT NULL | NULL | Valid session-bound operation |
| AUTHENTICATED | NOT NULL | NULL | NULL | Valid only for an explicitly principal-scoped endpoint |
| AUTHENTICATED | NULL | any | NULL | Invalid |
| AUTHENTICATED | NOT NULL | any | NOT NULL | Invalid |
| PRE_AUTHENTICATION | NULL | NULL | NOT NULL | Valid pre-auth operation |
| PRE_AUTHENTICATION | any non-NULL | any non-NULL | any | Invalid |
| PRE_AUTHENTICATION | NULL | NULL | NULL | Invalid |
| unknown value | any | any | any | Invalid |

The CHECK enforces the row-level truth table. The endpoint registry decides whether a specific authenticated operation requires a session. Pre-authentication is not an authenticated session and grants no application permission.

The pre-auth context is established by a cryptographically random browser cookie, host-only, Secure, HttpOnly, SameSite=Lax, Path `/api/v1/auth`, Max-Age 600 seconds. The server-side context expires no later than 10 minutes. Non-browser clients remain unsupported until a separate binding contract is approved.

### 3.2 PostgreSQL 15 identity indexes and NULL-safe session scope

**Disposition: ACCEPT, pending PostgreSQL 15 DDL and concurrency validation.**

- `uq_idempotency_authenticated_identity`: actor, operation, scope fingerprint, COALESCE(session_id, reserved-zero-UUID), key digest; partial where AUTHENTICATED.
- `uq_idempotency_pre_auth_identity`: pre-auth context, operation, scope fingerprint, key digest; partial where PRE_AUTHENTICATION.
- The reserved zero UUID is not a real session identifier. A CHECK prohibits it in session_id.
- The two indexes are mutually exclusive because the scope-mode CHECK is mandatory.
- Request fingerprint is not included in either identity key. This is required for AUTH-IDEM-041 to find the existing identity and return 409 rather than insert a second row.

PostgreSQL 15 supports expression and partial unique indexes. Actual DDL, predicate implication, planner behavior and concurrent insert behavior have not been executed or verified in a PostgreSQL environment.

### 3.3 Scope fingerprint stability and domain separation

**Disposition: ACCEPT after encoding normalization.**

A wording conflict existed between the earlier `/v1\0` textual prefix and the later exact byte sequence in TBR-01 §12.1. The later byte-level specification is normative and the earlier prose has been corrected.

Version 1 input bytes are:
1. ASCII `DYMS/AUTH-IDEM/SCOPE`.
2. One zero byte.
3. Version byte `0x01`.
4. Scope-kind byte: GLOBAL `0x00`, DISTRICT `0x01`, CHURCH `0x02`, DEPARTMENT `0x03`.
5. Component-count byte.
6. For each component in canonical order: one component-tag byte, one length byte `0x10`, then 16 UUID bytes in network/big-endian order.

SHA-256 over this byte sequence produces exactly 32 bytes. Church and department scope include the parent district UUID where required by the approved authorization scope. GLOBAL is explicit, not represented by NULL columns. The server resolves and calculates the fingerprint; clients cannot supply it.

The exact component tags and canonical component ordering must be frozen in the implementation contract and covered by cross-language test vectors before implementation.

### 3.4 HMAC, fencing, response retention and tombstone metadata

**Disposition: ACCEPT.**

The 23-column `idempotency_records` candidate carries:
- binary 32-byte key digest and request fingerprint;
- HMAC key version for retries;
- status limited to IN_PROGRESS, COMPLETED and FAILED;
- fixed two-minute processing lease;
- BIGINT fencing counter, starting at zero;
- safe replay HTTP status and safe result reference;
- 24-hour replay-response expiry and 30-day compact tombstone expiry;
- recovery summary metadata and database-maintained updated_at.

The HMAC key version on the original record is used when recomputing a retry fingerprint. Old HMAC key material must remain available for the full record/tombstone protection period. If the key is unavailable or compromised and verification cannot be performed safely, the operation fails closed.

### 3.5 Recovery history

**Disposition: ACCEPT.**

Use `idempotency_recovery_events`, not the superseded mutable recovery-attempt table.

- CLAIMED is inserted atomically with the successful fencing increment.
- COMPLETED, FAILED, STALE_WORKER_REJECTED and OVERFLOW_BLOCKED are new immutable event rows.
- A partial unique index allows one CLAIMED event for each record/fencing-counter pair.
- Recovery event rows are append-only to runtime roles.
- Redis/BullMQ schedules work; PostgreSQL remains authoritative.

### 3.6 FK and session ownership enforcement

**Disposition: ACCEPT.**

- `auth_sessions` exposes UNIQUE `(id,user_account_id)`.
- `idempotency_records(session_id,actor_user_account_id)` references that exact tuple.
- `actor_user_account_id` references user_accounts and is nullable only in PRE_AUTHENTICATION mode.
- `pre_auth_context_id` references pre_auth_contexts and is mandatory only in PRE_AUTHENTICATION mode.
- RESTRICT/RESTRICT prevents deletion while retained idempotency/recovery evidence depends on the referenced identity.

The FK does not replace endpoint authorization. It proves referential ownership only.

### 3.7 Password-reset outbox and external secret isolation

**Disposition: ACCEPT, with deployment secret-store selection pending.**

The outbox row contains:
- idempotency_record_id;
- password_reset_token_id;
- protected_secret_reference;
- delivery_purpose = PASSWORD_RESET.

A structural CHECK requires all reset-only references together. Partial unique indexes prevent duplicate reset-delivery rows per token or idempotency operation.

The raw reset secret exists only in an envelope-encrypted external secret store. Sequence:
1. Generate the secret and store it with <=30-minute TTL.
2. In one PostgreSQL transaction, persist the reset-token hash, terminal idempotency result and outbox row with opaque reference only.
3. On definitive rollback, delete the secret. On uncertain commit, query idempotency identity before cleanup.
4. The dedicated delivery worker resolves and sends the secret, then erases it on success; TTL is the final cleanup boundary.
5. No raw secret enters PostgreSQL, queue payloads, logs, traces, metrics, audit details or errors.

The secret-store vendor and managed key service remain deployment decisions. PostgreSQL and the external store do not form one ACID transaction; the choreography is designed for uncertain commit safety.

### 3.8 Retention, tombstones and context cleanup

**Disposition: ACCEPT, with cleanup ordering required.**

- At 24 hours after terminal completion, clear replayable safe-result fields.
- Preserve identity fields and compact tombstone through day 30.
- Do not delete an IN_PROGRESS row, active recovery, unresolved outcome, held row or row with dependent recovery/outbox evidence.
- A pre-auth context's secret digest is erased after expiry/consumption/revocation, no later than its 10-minute lifetime.
- Its non-secret context identity row remains while an idempotency tombstone references it.
- Delete the context stub only after dependent idempotency rows/tombstones and recovery/outbox evidence are no longer retained.

No general business-record retention period is inferred from these DDD-013-specific durations.

### 3.9 Redundancy and PostgreSQL compatibility

**Disposition: ACCEPT WITH EXPLICIT REMOVALS.**

The Phase 3 registers remove:
- old district/church/department scope columns from idempotency_records;
- old four global/district/church/department unique indexes;
- old three organizational-scope FK indexes;
- old mandatory actor FK nullability;
- old department-owned event FK and church-owned department FK, as a separate ODR-004 reconciliation.

The revised identity indexes and separate workload/FK indexes are retained where needed. Composite FK source indexes use exact ordered tuples. PostgreSQL 15 is the minimum target; no extension is required. No execution or planner verification is claimed.

### 3.10 Required negative, concurrency and recovery tests

**Disposition: ACCEPT; test execution pending implementation authorization.**

1. Reject all invalid scope-mode combinations.
2. Reject a session belonging to a different actor.
3. Reject a real session ID equal to the reserved zero UUID.
4. Reject a pre-auth context with actor/session references.
5. Reject expired, consumed or revoked pre-auth cookies.
6. Expire pre-auth context no later than 600 seconds.
7. Verify exact scope fingerprint test vectors across supported runtimes.
8. Verify RFC 8785 request canonicalization and sensitive-field HMAC encoding.
9. Verify retry recomputes with the original HMAC key version after key rotation.
10. Fail closed if the historical HMAC key is unavailable/compromised.
11. Concurrent identical claims produce one identity and one side effect.
12. Same identity with a different request fingerprint returns HTTP 409 `IDEMPOTENCY_KEY_REUSED` and performs no operation.
13. In-progress duplicate returns HTTP 409 with the approved retry metadata.
14. Replay revalidates current principal/session/pre-auth context and reset-token state.
15. Login replay never replays authentication cookies or credentials.
16. Password-reset replay never discloses account existence or reset-token state.
17. Stale worker completion is rejected after a newer fencing claim.
18. BIGINT overflow performs no increment, claim, operation-state transition or reuse.
19. Uncertain password-reset transaction commit does not delete a secret referenced by a committed outbox row.
20. Duplicate delivery retries reuse the same protected secret reference and do not extend token expiry.
21. Successful delivery and expiry erase the protected secret.
22. Tombstone cleanup does not delete referenced context/recovery/outbox evidence.
23. Runtime database roles cannot update/delete recovery events.
24. Queue loss does not lose the durable outbox operation.

## 4. Remaining external review and approval gates

| Gate | State |
|---|---|
| Internal DDD-013 design consistency | ADDRESSED IN PHASE 3 CANDIDATE |
| Exact byte encoding normalized | COMPLETE IN DOCUMENTATION |
| Canonical column/FK/index registers include D13 fields | COMPLETE IN PHASE 3 CANDIDATE |
| Independent technical reviewer response | PENDING |
| Project-owner physical DDD-013 approval | NOT GRANTED |
| Final physical ERD approval | NOT GRANTED |
| Implementation authorization | NOT AUTHORIZED |

## 5. Approval boundary

This is an internal engineering review record. It is not represented as an external independent review. It does not approve DDL, Prisma, migrations, database objects, seeds, API or application code.
