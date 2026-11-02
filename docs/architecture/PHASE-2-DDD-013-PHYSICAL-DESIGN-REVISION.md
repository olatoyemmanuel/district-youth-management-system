# DDD-013 Authentication Idempotency Physical Design Revision

- Revision: D13-PDR-01
- Date: 2026-11-02
- Status: **PROPOSED FOR INDEPENDENT REVIEW**
- Applies to: Authentication idempotency persistence only
- Governing policy: DDD-013 AUTH-IDEM-001–041; AUTH-IDEM-016 overflow clarification dated 2026-11-02
- Supersedes: The `idempotency_records` definition and four-index scope proposal in §5.8 of `PHASE-2-PHYSICAL-DATABASE-DESIGN.md`, and matching idempotency rows in the column/FK/index registers, only where they conflict with this revision.
- Approval: **NOT APPROVED**
- Implementation authorization: **NOT AUTHORIZED**

## 1. Design objective

This revision closes the six findings in `PHASE-2-DDD-013-ERD-SLICE-VALIDATION.md`. It defines one physical candidate for authentication idempotency, distinct authenticated and pre-authentication identity modes, scope-safe uniqueness, required lifecycle/security metadata, and the password-reset outbox boundary.

This is a review candidate, not a final schema. Exact naming, type limits, constraint expressions, FK target names, and operational behavior require independent review. No SQL, Prisma, migration, database object, or application code is included.

## 2. Proposed relational model

### 2.1 `idempotency_records`

| Column | Type | Nullability / proposed rule | Purpose |
|---|---|---|---|
| `id` | uuid | PK, NOT NULL | Internal record identity |
| `scope_mode` | varchar(20) | NOT NULL; AUTHENTICATED or PRE_AUTHENTICATION | Explicit identity mode |
| `actor_user_account_id` | uuid | NULL; FK user_accounts(id) | Authenticated principal only |
| `session_id` | uuid | NULL; FK auth_sessions(id), subject to actual canonical session table name | Optional authenticated session binding |
| `pre_auth_context_id` | uuid | NULL; FK pre_auth_contexts(id) | Pre-authentication context only |
| `operation_code` | varchar(100) | NOT NULL | Stable operation/endpoint identifier |
| `scope_fingerprint` | bytea | NOT NULL | Server-derived digest of canonical operation resource/organizational scope, including an explicit global-scope representation |
| `key_digest` | bytea | NOT NULL | Server-protected digest of the client UUID v4 key; raw key is not stored |
| `request_fingerprint` | bytea | NOT NULL | Server-calculated SHA-256/HMAC fingerprint under AUTH-IDEM canonicalization rules |
| `hmac_key_version` | varchar(40) | NULL only where operation has no sensitive HMAC inputs; otherwise NOT NULL | Key version required to reproduce the original fingerprint on retry |
| `status` | varchar(20) | NOT NULL; IN_PROGRESS, COMPLETED, FAILED | Persisted operation lifecycle |
| `created_at` | timestamptz | NOT NULL | Initial claim time |
| `lease_expires_at` | timestamptz | NULL | Fixed two-minute processing lease |
| `fencing_counter` | bigint | NOT NULL DEFAULT 0 CHECK >= 0 | Monotonic recovery fencing value |
| `completed_at` | timestamptz | NULL | Terminal completion time |
| `safe_http_status` | smallint | NULL | Safe replay status only |
| `safe_result_reference` | text | NULL | Reference to allowlisted safe result, never raw secret/body |
| `response_expires_at` | timestamptz | NULL | End of full safe-response retention |
| `tombstone_expires_at` | timestamptz | NULL | End of compact key-use protection |
| `recovery_state` | varchar(24) | NULL | Operational recovery classification, not an operation lifecycle state |
| `last_recovery_at` | timestamptz | NULL | Last recovery assessment time |
| `updated_at` | timestamptz | NOT NULL | Record update time |

The exact operation state remains IN_PROGRESS, COMPLETED, or FAILED. `recovery_state` is separate metadata and must not introduce RETRYABLE or MANUAL_REVIEW as persisted operation states. If recovery history is required beyond the latest summary, use the related `idempotency_recovery_attempts` table described below.

### 2.2 Scope-mode integrity

Exactly one identity mode is permitted:

- AUTHENTICATED: `actor_user_account_id` is NOT NULL, `pre_auth_context_id` is NULL. `session_id` is optional only for operations whose approved contract is principal-scoped; session-bound operations must supply it.
- PRE_AUTHENTICATION: `pre_auth_context_id` is NOT NULL, `actor_user_account_id` and `session_id` are NULL.

The row must reject every other combination. The CHECK must also reject a session reference without an authenticated principal. The FK to pre-auth context must use RESTRICT semantics while a record/tombstone depends on it. Auth-session ownership must be validated so the session belongs to the same authenticated user; use a composite candidate key/FK or a transaction-safe invariant backed by a database-enforceable constraint. Do not couple Session ownership to User–Member cardinality.

The `scope_fingerprint` is calculated by the server from the canonical resource/organizational scope for the operation. It has a deterministic explicit representation for global scope. Clients cannot supply or override it. This keeps authentication idempotency independent of unresolved business-domain idempotency policies.

### 2.3 Unique identity indexes

The request fingerprint is deliberately excluded from the identity key. A matching key with a different fingerprint must find the existing row and return AUTH-IDEM-041 (HTTP 409, `IDEMPOTENCY_KEY_REUSED`), never create a second row.

Proposed unique indexes:

| Name | Key | Predicate |
|---|---|---|
| `uq_idempotency_authenticated_identity` | `actor_user_account_id, operation_code, scope_fingerprint, COALESCE(session_id, '00000000-0000-0000-0000-000000000000'::uuid), key_digest` | `scope_mode = 'AUTHENTICATED'` |
| `uq_idempotency_pre_auth_identity` | `pre_auth_context_id, operation_code, scope_fingerprint, key_digest` | `scope_mode = 'PRE_AUTHENTICATION'` |

The authenticated expression index uses the zero UUID solely as the representation of an absent session. A CHECK must prohibit the zero UUID as an actual session ID. This is an expression-based NULL normalization strategy and does not depend on PostgreSQL NULL-distinct behavior. Reviewer must verify expression-index support and query planner compatibility on the project's PostgreSQL 15 baseline.

The previous four global/district/church/department unique indexes are superseded for this table. They must not coexist with the two proposed identity indexes. The old separate organizational-scope columns are not carried forward on this table; scope is represented by the server-derived `scope_fingerprint`. The canonical source for resolving that digest must be versioned and tested.

FK-support indexes are required for `actor_user_account_id`, `session_id`, and `pre_auth_context_id` where the unique expression indexes do not provide the required leftmost FK prefix. Do not retain old district/church/department FK indexes for columns removed from this table.

### 2.4 Fencing and recovery

- `fencing_counter` starts at 0.
- Each successful recovery claim increments it exactly once in the same atomic transaction that claims the row.
- The worker carries the claimed fencing value; every protected completion write verifies the current value still matches.
- A stale worker must not commit after a newer claim.
- BIGINT overflow is an integrity failure. Fail closed. Do not wrap, reset, truncate, or reuse a prior value. Do not grant a recovery claim or transition state when the increment is not representable. Raise a safe operational security/integrity event and route to controlled recovery/manual intervention.
- No automatic lease renewal. The approved fixed lease is two minutes.
- Use PostgreSQL as source of truth. BullMQ/Redis only schedules recovery work.

### 2.5 Recovery attempt history (proposed related entity)

Propose `idempotency_recovery_attempts` if reviewers confirm an immutable attempt ledger is needed:

| Column | Type | Rule |
|---|---|---|
| `id` | uuid | PK |
| `idempotency_record_id` | uuid | NOT NULL FK idempotency_records(id), ON DELETE RESTRICT |
| `claimed_fencing_counter` | bigint | NOT NULL, greater than 0 |
| `worker_reference` | text | NOT NULL, non-secret service identity |
| `claimed_at` | timestamptz | NOT NULL |
| `lease_expires_at` | timestamptz | NOT NULL |
| `outcome` | varchar(24) | NOT NULL; controlled recovery outcome vocabulary |
| `completed_at` | timestamptz | NULL |
| `safe_failure_code` | varchar(80) | NULL |

Unique `(idempotency_record_id, claimed_fencing_counter)`. Append one row per successful claim. Recovery outcome vocabulary is not a new persisted idempotency operation state. If this ledger is not adopted, the reviewer must specify how the audit trail for successive claims and stale-worker rejection is retained.

### 2.6 HMAC and request fingerprint

- Store only the server-calculated request fingerprint and HMAC key version, never sensitive input fields or raw idempotency key.
- On a new operation, use the active HMAC key version.
- On retry, load the existing record first and recompute using its stored key version.
- Retain old key material for the complete record/tombstone verification period. If a key is compromised or unavailable and safe verification is impossible, fail closed and use the approved reauthentication/manual-review path.
- Fingerprint canonicalization remains RFC 8785; SHA-256 is used for the canonical request digest, and HMAC-SHA-256 for sensitive fields as approved.
- `scope_fingerprint` must be domain-separated from `request_fingerprint` and key digest. Document byte encoding and versioning before physical approval.

## 3. Password-reset outbox boundary

### 3.1 Generic `outbox_messages` extension

Retain the generic outbox as the durable dispatcher, with these additional nullable workflow references:

| Column | Type | Rule |
|---|---|---|
| `idempotency_record_id` | uuid | NULL FK idempotency_records(id), RESTRICT |
| `password_reset_token_id` | uuid | NULL FK password_reset_tokens(id), RESTRICT; confirm canonical token table name |
| `protected_secret_reference` | text | NULL; opaque reference only, no secret bytes |
| `delivery_purpose` | varchar(40) | NULL; e.g. PASSWORD_RESET |

A CHECK or typed event contract must require the password-reset fields together for the password-reset delivery event and forbid them for unrelated event types. Keep existing `event_id` uniqueness and outbox lease fields. Do not duplicate raw reset token material in `payload`.

### 3.2 Transaction and external secret store

The password-reset request transaction must atomically persist:
1. The reset-token record.
2. The idempotency terminal result.
3. The outbox message containing the opaque protected-secret reference.

The raw delivery secret is stored only in an external envelope-encrypted short-lived secret store. Only the delivery worker identity can resolve it. Queue payloads, outbox JSON, logs, traces, audit events and idempotency result fields contain the opaque reference only. Expire no later than the reset-token lifetime (30 minutes under DFR-004) and erase after successful delivery or expiry. Vendor selection remains open.

If delivery fails, retry the same outbox event using the same opaque reference while it remains valid. After secret expiry, do not reconstruct or regenerate the original reset secret under the same idempotency result; route through the approved new request/recovery behavior without account-existence disclosure.

## 4. Domain boundary

This table design is for AUTH-IDEM authentication operations only. It does not approve applying AUTH-IDEM-001–041 to finance, attendance, events, credentials, or other business mutations. Those contexts require their own approved idempotency policy and may use separate persistence or a formally reviewed shared abstraction.

## 5. Retention and deletion

- Preserve the approved 24-hour completed/failed response-record retention and 30-day compact tombstone period as defined in the DDD-013 specification, subject to applicable holds and unresolved recovery.
- Cleanup must not delete an IN_PROGRESS operation, a record under recovery, a record whose fencing/recovery state is unresolved, or a record subject to an applicable hold.
- The compact tombstone must retain enough identity material to reject key reuse through its approved expiry.
- Raw reset secret expires no later than reset token lifetime and is erased after delivery or expiry.
- Do not infer general audit or non-authentication business-record retention from these authentication-specific durations.

## 6. Candidate constraints and indexes

Constraint names below are proposed names, not executable DDL:

- `ck_idempotency_scope_mode_identity`: enforce the mutually exclusive identity mode truth table.
- `ck_idempotency_status`: status in IN_PROGRESS, COMPLETED, FAILED.
- `ck_idempotency_fencing_nonnegative`: fencing_counter >= 0.
- `ck_idempotency_session_nonzero`: session_id is NULL or not the reserved zero UUID.
- `ck_idempotency_terminal_metadata`: terminal states have completed_at; IN_PROGRESS has no terminal completion timestamp; exact safe-result nullability to be validated against endpoint contract.
- `ck_outbox_password_reset_reference_set`: reset event references token, idempotency record and opaque secret reference together.
- `uq_idempotency_authenticated_identity`: proposed expression/partial unique index above.
- `uq_idempotency_pre_auth_identity`: proposed partial unique index above.
- `uq_idempotency_recovery_claim`: unique (idempotency_record_id, claimed_fencing_counter) if recovery attempt ledger is adopted.
- FK constraints for actor, session, pre-auth context, recovery attempt, outbox idempotency link and reset-token link, all with deletion restricted while dependent evidence is retained.

Exact CHECK expressions, status transitions, session ownership enforcement, scope fingerprint format, FK target names, and whether recovery attempts are a separate table require independent review before approval.

## 7. Remediation matrix

| Previous finding | Proposed resolution | Review state |
|---|---|---|
| PDB-D13-01 mandatory actor FK blocks pre-auth | Nullable actor/session plus pre-auth context FK and explicit scope-mode CHECK | Proposed |
| PDB-D13-02 old four indexes wrong | Two mode-specific unique indexes, fingerprint excluded from identity | Proposed |
| PDB-D13-03 missing contract metadata | HMAC version, BIGINT fencing, retention, tombstone, recovery and safe result fields | Proposed |
| PDB-D13-04 outbox boundary incomplete | Explicit idempotency/token links and opaque secret reference | Proposed |
| PDB-D13-05 domain boundary unclear | Authentication-only table contract | Proposed |
| PDB-D13-06 FK/lifecycle constraints absent | Named candidate FKs, CHECKs, and session-owner invariant | Proposed |

## 8. Required independent reviewer response

Reviewers should return a finding for each item: ACCEPT, REVISE, or BLOCK, with rationale and exact correction.

1. Is the authenticated/pre-authentication truth table complete and consistent with all AUTH-IDEM endpoints?
2. Does the expression-based authenticated unique index correctly handle nullable session scope on PostgreSQL 15? Is a different NULL-safe design preferable?
3. Is `scope_fingerprint` adequately specified, stable, domain-separated and collision-resistant for all applicable scopes?
4. Are the proposed HMAC, fencing, response retention, tombstone and recovery fields sufficient?
5. Should recovery attempts be a separate append-only table or can the approved evidence be preserved safely another way?
6. Are FK actions and session ownership enforceable without relying solely on application checks?
7. Does the outbox reference design meet the atomic password-reset transaction and secret-isolation requirements?
8. Are retention/cleanup rules consistent with tombstone, legal hold and recovery semantics?
9. Are any proposed fields, constraints or indexes redundant, unsafe, or incompatible with PostgreSQL 15?
10. Identify all missing negative, concurrency, stale-worker, key-rotation, replay and uncertain-commit tests.

## 9. Gate

This revision is submitted for independent review only. Reviewer acceptance does not itself approve the physical design. The project owner must explicitly approve the final reconciled physical design and DDD-013 package before implementation.

**Prisma schema, SQL DDL, migrations, database objects, seeds, API implementation and application code remain NOT AUTHORIZED.**
