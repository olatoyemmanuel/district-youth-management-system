# DYMS Phase 2 Physical Database Design Review

**Status:** Review completed; revisions required before physical-design approval  
**Reviewed artifact:** docs/architecture/PHASE-2-PHYSICAL-DATABASE-DESIGN.md  
**Reviewed revision:** dfa76d1e80c7c2c39135b6fec733ae5ba3dab164  
**Logical authority:** Approved conceptual ERD revision 25f2813e0256d9472daded45657dfb7ac9f70a43  
**Scope:** DYMS v1.0, Sango District  
**Implementation authorization:** NOT GRANTED

## 1. Executive assessment

The physical design proposal covers the principal bounded contexts and provides a sound starting point for PostgreSQL mapping. It correctly keeps implementation separate from design approval and preserves unresolved church-policy and accounting matters.

The proposal is not yet ready for physical-design approval. Several relationships and integrity rules need more precise treatment. The highest-risk areas are appointment scope consistency, attendance uniqueness across event/session modes, finance currency and reversal integrity, retention target binding, and audit actor semantics.

This review does not change the approved conceptual ERD. It identifies how the physical mapping must enforce it.

## 2. Findings and required revisions

### PDB-R01 — Appointment scope and position consistency
**Severity:** High  
**Finding:** An appointment carries one of district, church, or department scope, while a position may itself be department-specific. The proposal does not yet define how a department-specific position is prevented from being appointed at an unrelated church or district scope, or how the department's owning district/church is validated.

**Required revision:**
- Define allowed scope types per position.
- Add composite keys/FKs or an equivalent enforceable mechanism to ensure the appointment scope matches the position's declared scope and the department's owning organization.
- Enforce non-overlapping effective appointment periods for the same position and exact scope, including concurrent requests.
- Do not rely only on an application pre-check.

**Acceptance test:** A position restricted to Department A cannot be appointed under Department B or an unrelated church. Two overlapping active appointments for the same position and scope cannot both commit.

### PDB-R02 — Attendance event/session cross-mode uniqueness
**Severity:** High  
**Finding:** Two partial unique indexes prevent duplicates within event-level mode and within session-level mode, but do not prevent the same member/event from having both an event-level record and one or more session-level records.

**Required revision:**
- Prefer a normalized attendance subject/participation key that represents one member's attendance mode for an event, with session attendance as children where applicable; or
- Specify a serialized transaction protocol with a stable lock key for (event_id, member_id) and prove it with concurrent integration tests.
- Keep the event-level versus session-level choice mutually exclusive for the member/event.
- Keep registration prerequisite as an explicit policy gap.

**Acceptance test:** Concurrent event-level and session-level attendance attempts for the same member/event cannot both commit.

### PDB-R03 — Financial currency composite-key correction
**Severity:** High  
**Finding:** The proposal correctly intends to enforce account/transaction/payment currency equality, but the composite-key wording must be exact and consistently applied. The unique key belongs on financial_accounts(id, currency_code), and financial_transactions(financial_account_id, currency_code) must reference it. A second unique key belongs on financial_transactions(id, currency_code) for payment currency references.

**Required revision:**
- State both composite unique keys explicitly.
- Define matching composite foreign keys for transactions-to-account and payments-to-transaction.
- Add a composite relationship for any reversal transaction to ensure original and reversal currencies match.
- Keep amount sign, partial settlement, refund, and accounting-line rules blocked pending approved accounting policy.

**Acceptance test:** A transaction or payment in a currency different from its owning account/transaction is rejected by PostgreSQL constraints.

### PDB-R04 — Retention hold target binding
**Severity:** High  
**Finding:** retention_holds currently has no enforceable link to the exact records under hold. The document recognizes this limitation, but retention_actions.target_binding_id cannot be implemented until the target model is chosen.

**Required revision:**
- Choose a shared retention_subjects anchor with real foreign keys from each supported retained record type, or target-specific link tables.
- A hold and action must reference the exact retention subject, not only a category or free-form target identifier.
- Enforce that a destructive action and hold check serialize against the same target.
- Keep automated deletion disabled for categories without an approved retention schedule.

**Acceptance test:** A valid hold on a specific record blocks a concurrent retention action for that record; releasing the hold does not affect unrelated records.

### PDB-R05 — Audit actor and delegated-action semantics
**Severity:** High  
**Finding:** The actor model needs a fully testable set of CHECK rules. The current wording leaves ambiguity about whether a SYSTEM or SERVICE event may also have an initiating human actor.

**Required revision:**
- Define actor_type = USER as requiring actor_user_account_id.
- Define SYSTEM, SERVICE, and ANONYMOUS events as having no human value in actor_user_account_id.
- Permit initiating_user_account_id only when a human initiated or authorized the delegated process; document its meaning for each actor type.
- Keep service identity distinct from the initiating user identity.
- Add a controlled service-principal identity reference if service attribution needs a stable identity beyond the actor_type label.
- Keep audit rows append-only through database privileges and a controlled writer; do not rely only on application conventions.

**Acceptance test:** A system-generated event is not falsely attributed to a human actor, while a user-triggered background job retains both the service actor and initiating user.

### PDB-R06 — Scope integrity must be defined per table
**Severity:** High  
**Finding:** The design describes explicit scope FKs and exactly-one CHECK constraints, but several table entries use shorthand such as explicit scope FKs without listing the actual FK targets, permitted scope shapes, or parent-scope consistency.

**Required revision:**
- Add a scope matrix listing each scoped table, allowed owner type(s), required FK(s), and parent consistency rule.
- For each table, list named FK relationships and the exactly-one CHECK predicate.
- Use composite foreign keys for parent/scope pairs wherever possible.
- Identify any rule that requires a trigger or serialized domain transaction and provide its test.
- Audit metadata may use a historical target reference, but business ownership must not use unchecked polymorphic IDs.

**Acceptance test:** A church-owned event, appointment, role grant, or financial account cannot reference a church from another district or an unrelated department.

### PDB-R07 — Event registration capacity and status transitions
**Severity:** Medium  
**Finding:** The design identifies the need for an atomic capacity reservation, but it does not specify the concurrency-safe counter/locking strategy or the status set used by the partial unique index.

**Required revision:**
- Define the authoritative capacity count source and reservation transaction.
- Specify which registration statuses consume capacity.
- Define how cancellation releases capacity and how race conditions are handled.
- Keep late registration and capacity exceptions disabled until approved policy exists.

**Acceptance test:** When the last available slot is requested concurrently by multiple members, no more than the event capacity is confirmed.

### PDB-R08 — Authentication session/token integrity
**Severity:** Medium  
**Finding:** The session/token split is appropriate, but the design needs a complete state invariant for token rotation and session revocation.

**Required revision:**
- Enforce at most one current unconsumed, unrevoked refresh-token hash per session.
- Specify atomic consumption and replacement in one transaction while locking the session row.
- A consumed token replay must trigger the DFR-001/004 reuse response and session revocation policy.
- Expiry and inactivity calculations must not extend the 30-day absolute session limit.
- Define cleanup/retention only under an approved security retention schedule.

**Acceptance test:** Two concurrent refresh attempts cannot both rotate the same token successfully; replay of the consumed token triggers the approved reuse response.

### PDB-R09 — Financial reversal integrity
**Severity:** Medium  
**Finding:** The proposal says to prevent duplicate full reversals and not exceed the original amount, but does not fully define the database relationship between original and reversal transactions.

**Required revision:**
- Require original and reversal transactions to belong to the same financial account and currency unless an approved accounting policy explicitly permits otherwise.
- Enforce the reversal transaction type and posted-state relationship.
- Serialize reversal attempts by locking the original transaction.
- Keep partial reversal disabled until policy defines it.

**Acceptance test:** A second full reversal cannot post, and a reversal against a different account/currency is rejected.

### PDB-R10 — Missing event-change and transaction-revision history
**Severity:** Medium  
**Finding:** The physical catalogue must explicitly preserve significant event change requests and transaction revision/resubmission history. These are necessary to support approved workflow rules and must not be represented only by overwritten columns.

**Required revision:**
- Include event_change_records with allowlisted previous/proposed values, actor, reason, decision and timestamps.
- Include transaction_revisions for pre-posting revision/resubmission, linked to the transaction with a unique revision sequence.
- Posted transactions remain corrected only by reversal.
- Ensure snapshots do not contain credentials, secrets, or unrelated personal data.

**Acceptance test:** A submitted event or transaction revision leaves the previous proposal and decision history retrievable.

### PDB-R11 — Durable outbox ownership
**Severity:** Medium  
**Finding:** The design describes an outbox pattern, but the relational catalogue must contain the outbox record and its claim/delivery lifecycle if it is part of the approved implementation architecture.

**Required revision:**
- Define an outbox_messages table with stable event identity, aggregate reference, event type/version, allowlisted payload, status, attempts, next-available time, lease/lock metadata, and published timestamp.
- Insert the outbox row in the same transaction as the source business mutation.
- Use at-least-once publishing and consumer deduplication.
- Do not store provider secrets or unnecessary personal data in the payload.

**Acceptance test:** A committed business mutation always has its corresponding outbox event, and retrying publication does not duplicate the downstream business effect.

### PDB-R12 — Explicit defaults, nullability, and lifecycle state catalogue
**Severity:** Medium  
**Finding:** Several fields are described as created_at, updated_at, status, or nullable without a complete column-level contract. The document is a useful design proposal but is not yet sufficient as a direct DDL specification.

**Required revision:**
- For every table, specify required/optional fields, defaults, allowed status values, and lifecycle transitions.
- Avoid defaulting security-sensitive or approval fields to permissive values.
- Define unique normalization strategy for login identifiers, email, phone, and codes.
- Define whether timestamps are assigned by the database or application and ensure one consistent policy.
- Add CHECK constraints for valid intervals and non-negative counters where appropriate.

**Acceptance test:** Invalid status values, invalid effective intervals, and missing required actor/ownership fields are rejected at the database boundary.

## 3. Review disposition

| Area | Result |
|---|---|
| Conceptual ERD alignment | Pass with physical refinements |
| Individual member account rule | Pass |
| UUID and foreign-key baseline | Pass in principle; table-by-table completion required |
| Organizational scope integrity | Revision required |
| Appointment concurrency | Revision required |
| Attendance uniqueness | Revision required |
| Finance currency/reversal | Revision required; accounting policy still blocks final finance rules |
| Authentication session rotation | Revision required |
| Audit actor integrity | Revision required |
| Retention hold integrity | Revision required |
| Notification/webhook deduplication | Pass in principle; implementation tests required |
| Outbox durability | Revision required |
| Index strategy | Pass as a preliminary strategy; query-plan validation deferred |
| Prisma mapping | Not reviewed; deliberately deferred |
| SQL DDL/migrations | Not authorized and not created |

## 4. Required next revisions

The physical design document should be updated to incorporate PDB-R01 through PDB-R12. The scope matrix, attendance model, retention target model, and appointment scope strategy must be explicit before approval.

After these revisions, perform a second review against:
1. The 97 enumerated testable requirements.
2. The approved conceptual ERD and eight diagrams.
3. DFR-001 through DFR-006.
4. DDD-001 through DDD-015.
5. PostgreSQL's actual supported constraints and extension version.

## 5. Implementation boundary

This review authorizes no implementation. Do not:
- edit backend/prisma/schema.prisma;
- generate Prisma Client;
- create or run migrations;
- write or execute SQL DDL;
- create or alter database objects;
- begin application feature implementation.

The project owner must approve the revised physical database design and separately authorize implementation.

## 6. Conclusion

The physical design is a strong working draft, not an implementation-ready specification yet. Resolve the twelve findings, then return the revised design for a second verification pass and project-owner approval.
