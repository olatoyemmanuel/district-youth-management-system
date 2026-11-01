# DYMS Phase 2 Physical Database Design: Second Review

**Status:** Design-level review completed; project-owner approval still required  
**Reviewed physical-design blob:** 04675d3d7c2f327640a7f0354203f8d491bc24b3  
**Approved conceptual ERD:** 25f2813e0256d9472daded45657dfb7ac9f70a43  
**Requirements source:** docs/product/PHASE-1-TESTABLE-REQUIREMENTS.md, blob ecea9abfd733581f31dd6b81abe9b590c5100feb  
**Scope:** DYMS v1.0, Sango District  
**Implementation authorization:** NOT GRANTED

## 1. Executive result

The revised physical-design proposal now contains explicit design treatments for all twelve findings from the first review. Eleven findings are addressed at the design-specification level. PDB-R12 is partially addressed: the common nullability/default/timestamp contract and the complete list of state-bearing tables are documented, but the table-specific state values, transitions, and authorities are not yet enumerated.

This review is a document-level consistency check. It is not proof that PostgreSQL constraints, triggers, indexes, privileges, or concurrency protocols compile or behave correctly. No SQL was generated or executed, and no database was changed.

## 2. Review of the twelve findings

| Finding | Second-review result | Evidence in revised design | Remaining proof or blocker |
|---|---|---|---|
| PDB-R01 Appointment scope | Addressed in design | §14.1 declares position scope type, exact scope matching, composite binding, and non-overlap enforcement | Prototype PostgreSQL exclusion/trigger strategy and test concurrent approvals |
| PDB-R02 Attendance mode | Addressed in design | §14.2 adds one event/member attendance subject and mutually exclusive EVENT/SESSION mode | Decide deferred trigger versus subtype tables; prove concurrent cross-mode exclusion |
| PDB-R03 Finance currency | Addressed in design | §14.3 explicitly declares account, transaction, payment composite keys/FKs | Finance accounting policy still blocks final finance DDL |
| PDB-R04 Retention binding | Addressed in design | §14.4 defines retention_subjects, exact target links, and same-subject locking | Inventory every retained table and prove one-to-one subject binding; retention periods remain unknown |
| PDB-R05 Audit actors | Addressed in design | §14.5 defines service principals, actor CHECK semantics, and append-only writer privileges | DDL privilege test and final audit access governance |
| PDB-R06 Scope integrity | Addressed in design | §14.6 lists scoped tables, owner types, parent consistency and composite-FK strategy | Convert every row into exact named FK/CHECK definitions in the final DDL review |
| PDB-R07 Capacity | Addressed in design | §14.7 defines reserved_count, event-row lock, increment/decrement and reconciliation | Registration capacity-consuming states need approved lifecycle catalogue; concurrency test |
| PDB-R08 Authentication | Addressed in design | §14.8 fixes absolute expiry, single current token, atomic rotation and replay revocation | Concurrency and expiry tests; retention schedule for consumed token hashes |
| PDB-R09 Reversal | Addressed in design | §14.3 defines same-account/currency full reversal and serialization | Accounting policy and DDL proof |
| PDB-R10 Revision history | Addressed in design | §14.9 makes event_change_records and transaction_revisions mandatory immutable history | Confirm every effective update is atomic with its decision record |
| PDB-R11 Outbox | Addressed in design | §14.10 defines event identity, lease, at-least-once publishing and consumer deduplication | Final stable domain event key and worker/consumer integration tests |
| PDB-R12 Defaults and lifecycle | Partially addressed | §14.11 defines common column contract and enumerates state-bearing tables | Complete one table-specific lifecycle row for every listed table before DDL approval |

## 3. Requirements and conceptual ERD consistency

The detailed testable requirements document contains 97 unique requirement rows. The revised physical-design document was checked for the principal structural controls relevant to those requirements:

- Individual account/member relationship remains one-to-one. No guardian relationship, shared login, or guardian delegation model is introduced.
- Category, church membership, department membership, appointment, role assignment, credential and member identity remain separate concepts.
- Scope remains explicit and typed. The design does not introduce unchecked polymorphic business ownership.
- Event registration and attendance preserve event/member relationships and attendance history.
- Finance account ownership and currency are enforced through composite-key proposals; accounting semantics remain policy-gated.
- Audit actor attribution, idempotency, notification delivery, webhook processing, outbox and retention remain distinct concerns.
- No DFR-001 through DFR-006 or DDD-001 through DDD-015 decision is intentionally replaced by this physical mapping.

The 97 requirement rows are counted from the table rows in the current testable requirements file. This is a count and structural consistency check, not a claim that all 97 have been individually proven by executable tests. The existing requirement-to-ERD traceability document remains the source for the requirements crosswalk.

## 4. Additional consistency observations

1. The revised proposal introduces three additional physical structures in the normative addendum: event_attendance_subjects, retention_subjects and service_principals. They must be incorporated into the final table catalogue and ERD-to-table mapping before physical-design approval.
2. Appointment scope enforcement depends on an explicit position scope classification. This is a physical representation of the position's declared organizational level, not authority to invent which church positions exist.
3. The attendance subject model deliberately makes registration prerequisite unresolved. Do not interpret a nullable registration reference as policy approval for unregistered attendance.
4. Event capacity reservation requires an approved definition of which registration states consume capacity. The counter protocol is defined, but the state catalogue remains a blocker.
5. The retention anchor is technically specified, but the complete set of retained record classes and their approved retention schedules remain governance decisions.
6. Finance composite relationships are specified, but sign convention, multi-line accounting, partial payments, refunds, reversals beyond full reversal, thresholds, and FX remain blocked pending approved accounting policy.
7. The service-principal model supports attribution. It does not itself approve which staff or service roles are authorized to inspect security audit records.
8. The common timestamp/default contract is clear at policy level, but a final column-by-column nullability/default matrix is still required before DDL generation.
9. PostgreSQL version and extension availability remain unverified. In particular, exclusion constraints, generated range expressions and trigger behavior need to be checked against the selected deployed major version.
10. The original repository discrepancy concerning DFR-006 remains governed by the current explicit project-owner instruction. This review makes no repository-wide governance change.

## 5. Required work before physical-design approval

The following items remain:
- Complete table-specific lifecycle catalogues for every state-bearing table listed in §14.11.
- Add explicit full definitions for event_attendance_subjects, retention_subjects and service_principals to the table catalogue, including all columns, keys, FKs, nullability and indexes.
- Produce a final table-by-table scope/FK/CHECK matrix with named constraints.
- Confirm PostgreSQL major version and extension policy.
- Prepare a column-level nullability/default/index matrix.
- Complete the finance accounting policy with the authorized finance officers.
- Obtain approved retention schedules and retention authority.
- Obtain the safeguarding/onboarding policy for younger members using individual accounts.
- Verify official credential issuers, requirements and evidence retention.
- Complete query/index workload review and privacy/security review.
- Obtain explicit project-owner approval of the exact physical-design revision.

These are design completion and policy-evidence requirements. They do not authorize implementation.

## 6. Implementation boundary

The following remain unauthorized:
- Editing backend/prisma/schema.prisma.
- Generating Prisma models/client.
- Creating or running migrations.
- Writing or executing SQL DDL.
- Creating or altering database objects.
- Beginning application feature implementation.

The conceptual ERD is approved. The physical database design remains a working proposal pending the outstanding work and explicit project-owner approval.

## 7. Conclusion

The first review's twelve findings have been addressed or explicitly retained as partial in the revised proposal. The design is materially more precise and ready for the next design-completion pass, but it is not implementation-ready and is not approved for implementation. PDB-R12 remains partially open, and the policy/evidence blockers above must remain visible.


---

## 8. Follow-up completion review: lifecycle catalogue and table definitions

**Follow-up reviewed physical-design blob:** `3e7bbdef7172949a0532dfece39640462cf50a04`  
**Lifecycle catalogue blob:** `a4b01f329f3932439e521975c6c3ea417eca4a3d`

The follow-up design pass completed the two documentation gaps identified in the first second-review:

1. The physical-design catalogue now contains full column, key, index and integrity proposals for `event_attendance_subjects`, `retention_subjects` and `service_principals` in Section 18.
2. The linked lifecycle catalogue contains 52 unique table rows. It records initial conditions, candidate states/outcomes, transition authority, terminal states and a classification for each row.

PDB-R12 is therefore **addressed as a design-documentation deliverable**, but **not approved for DDL**. The catalogue intentionally marks several state sets POLICY BLOCKED or PROPOSED because the applicable authority has not yet confirmed them. The project owner and relevant ministry, finance, security, integration and records authorities must approve or amend those entries before restrictive database CHECK constraints or production seed values are generated.

### Follow-up acceptance

| Check | Result |
|---|---|
| Three additional physical structures have dedicated table definitions | Pass |
| Lifecycle catalogue has 52 table rows | Pass |
| Lifecycle table names are unique | Pass |
| Proposed, derived, policy-blocked and immutable-history entries are distinguished | Pass |
| Guardian relationship/delegation model introduced | No |
| Prisma, migration, SQL DDL or database objects changed | No |
| Project-owner physical-design approval obtained | No |

### Remaining technical and policy gates

- Validate all composite FKs, exact scope checks, attendance-mode triggers/subtypes, appointment exclusion constraints and audit privileges against the selected PostgreSQL major version.
- Complete the final named constraint/index/nullability matrix.
- Obtain accounting policy, retention schedules, younger-member onboarding/safeguarding policy, and credential authority/evidence rules.
- Confirm every PROPOSED lifecycle value and resolve every POLICY BLOCKED entry with its responsible authority.
- Obtain explicit project-owner approval of the exact physical-design revision before any implementation.

The physical design remains a working proposal. This follow-up does not authorize Prisma, migrations, SQL, database changes or application implementation.
