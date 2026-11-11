# DYMS CPERD-05 — Canonical Index Inventory Correction and Verification

- Deliverable: CPERD-05
- Source inventory revision: IDX-PR-01
- Corrected inventory Git blob SHA: 84b3a5de0afd8176e39f27bd20f9563abe75d43f
- Branch: phase-1/requirements-consolidation
- Status: CORRECTIONS APPLIED; STATIC DOCUMENTATION VERIFICATION PASSED
- Implementation: NOT AUTHORIZED

## 1. Owner decision

The project owner approved the CPERD-05 reconciliation findings with corrections required. This report records completion of those corrections and static documentation verification. It does not grant implementation authorization or replace the separate final implementation gate.

## 2. Corrections applied

1. Corrected all 30 malformed partial-index predicate descriptions containing duplicated `WHERE WHERE` to a single `WHERE`, preserving the intended predicate expression.
2. Relocated all eight appointment-scope candidate indexes from below the approval boundary into Section 3, the canonical inventory:
   - `uq_positions_id_district_scope_type`
   - `uq_positions_id_church`
   - `uq_positions_id_department`
   - `ix_positions_church_district`
   - `ix_positions_department_district`
   - `ix_appointments_position_district_scope_type`
   - `ix_appointments_position_church_scope`
   - `ix_appointments_position_department_scope`
3. Preserved the two DDD-013 identity indexes as PROPOSED FOR INDEPENDENT REVIEW:
   - `uq_idempotency_authenticated_identity`
   - `uq_idempotency_pre_auth_identity`
4. Preserved all six policy-blocked entries as POLICY BLOCKED. No unresolved lifecycle predicate or email-normalization rule was invented.

## 3. Static verification results

| Check | Result |
|---|---:|
| Canonical inventory entries | 228 |
| Unique index names | 228 |
| Duplicate index names | 0 |
| Malformed duplicated WHERE expressions | 0 |
| Appointment-scope indexes in canonical inventory | 8 |
| Index rows below approval boundary | 0 |
| Policy-blocked entries retained | 6 |
| DDD-013 independent-review entries retained | 2 |
| Names exceeding PostgreSQL 63-byte identifier limit | 0 |
| Named FK rows checked | 166 |
| FK supporting indexes missing | 0 |
| FK source/target columns missing from canonical column register | 0 |

The 166 FK rows were cross-checked against the corrected index inventory and the canonical column register. Each named FK supporting source index exists. All referenced FK source and target columns exist in the column register.

## 4. Source artifacts

- Corrected index inventory: [PHASE-3-CANONICAL-INDEX-INVENTORY.md](./PHASE-3-CANONICAL-INDEX-INVENTORY.md)
  - Git blob SHA: `84b3a5de0afd8176e39f27bd20f9563abe75d43f`
- Canonical column register:
  - Git blob SHA: `282419018c64967ff577ffcd806aefd4f8766187`
- Canonical FK register:
  - Git blob SHA: `116e61cfe06d43badf543cc7bbb32bbc32fa1ae0`

## 5. Validation boundary and remaining gates

These are static documentation checks. They do not establish PostgreSQL execution, query-plan quality, index selectivity, write amplification, concurrent index maintenance behavior or production workload performance. Those checks remain deferred until the physical design and implementation gates are satisfied.

The two DDD-013 identity indexes still require independent technical assurance. The six policy-blocked indexes remain excluded from implementation until their source policy decisions are approved. No DDL, Prisma schema, migration, database object or application code is authorized by this report.

## 6. Disposition

- CPERD-05 correction actions: COMPLETE
- Static documentation verification: PASS
- DDD-013 independent technical assurance: OPEN
- Policy decisions affecting blocked indexes: OPEN
- Runtime/workload validation: DEFERRED
- Implementation authorization: NOT GRANTED
