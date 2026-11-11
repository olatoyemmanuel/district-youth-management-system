# Phase 1 Requirement-to-ERD Traceability

**Status:** Working traceability crosswalk, verified against the current Phase 1 testable requirements file and conceptual ERD.  
**Branch:** `phase-1/requirements-consolidation`  
**Purpose:** Map each currently defined testable requirement group to its conceptual ERD coverage and identify coverage that remains policy-dependent.

## 1. Source documents checked

- `docs/product/PHASE-1-TESTABLE-REQUIREMENTS.md`
- `docs/product/PHASE-1-REQUIREMENTS-CONSOLIDATION.md`
- `docs/architecture/PHASE-1-DOMAIN-BOUNDARIES.md`
- `docs/architecture/PHASE-1-CONCEPTUAL-ERD.md`
- `docs/architecture/PHASE-1-ERD-INTEGRITY-REVIEW.md`

This crosswalk reflects the requirement IDs actually present in the current testable requirements document. It does not silently assume missing IDs from older range summaries.

## 2. Requirement group crosswalk

| Requirement IDs present in testable requirements | Count | Conceptual ERD coverage | Coverage status |
|---|---:|---|---|
| ID-001 to ID-004 | 4 | Sections 3, 11, 20.1 | Covered; individual account rule is explicit. |
| MEM-001 to MEM-006 | 6 | Section 3 | Covered; eligibility and evidence policy remain open. |
| ORG-001 to ORG-007 | 7 | Section 4 | Covered; cancellation/rejection/backdating policy remains open. |
| DEPT-001 to DEPT-006 | 6 | Section 5 | Covered; eligibility, renewal, and appeal policy remain open. |
| APP-001 to APP-007 | 7 | Section 6 | Covered; acting appointment and exception policy remain open. |
| AUTHZ-001 to AUTHZ-011 | 11 | Section 6 and Section 20.3 | Covered conceptually; complete permission catalogue and scope mapping remain prerequisites. |
| EVT-001 to EVT-007 | 7 | Section 7 | Covered; local approval and registration/refund exceptions remain open. |
| ATT-001 to ATT-007 | 7 | Section 7 and Section 20.5 | Covered; registration prerequisite, QR, self-check-in, and offline rules remain open. |
| FIN-001 to FIN-012 | 12 | Section 8 and Section 20.6 | Covered; accounting treatment, thresholds, budgets, and payment exceptions remain open. |
| CRED-001 to CRED-004 | 4 | Section 9 | Covered; official requirements and issuer authority evidence remain open. |
| AUD-001 to AUD-004 | 4 | Section 11 and Section 20.8 | Covered; audit access authority and emergency access policy remain open. |
| RET-001 to RET-004 | 4 | Section 11 and Section 20.9 | Covered; official periods and disposal authority remain open. |
| NOTIF-001 to NOTIF-006 | 6 | Section 10 and Section 20.10 | Covered; provider selection and operational retry/monitoring values remain open. |
| SEC-001 to SEC-012 | 12 | Sections 2, 11, 14, 15, 20 | Covered at conceptual/platform level; detailed technical verification follows implementation design. |

**Total currently enumerated testable requirement IDs: 97.**

## 3. Source decision mapping

| Source decision | Main requirement groups | ERD areas |
|---|---|---|
| DFR-001 | ID-004, SEC-001 to SEC-004 | Sections 3, 11 |
| DFR-002 | ID-003, AUTHZ-001 to AUTHZ-011, SEC-011 | Sections 3, 6, 11, 15 |
| DFR-003 | SEC-007 to SEC-009 | Sections 2, 8, 14, 15 |
| DFR-004 | ID-004, SEC-002 to SEC-004 | Sections 3, 6, 11 |
| DFR-005 | SEC-012 | Section 11 and operations requirements outside the ERD |
| DFR-006 | Governance gate | Sections 1, 17, 19 and repository governance reconciliation |
| DDD-001 | ID-003, ID-004 | Section 3 |
| DDD-002 | MEM-001 to MEM-006 | Section 3 |
| DDD-003 | ORG-001 to ORG-007 | Section 4 |
| DDD-004 | APP-001 to APP-007 | Section 6 |
| DDD-005 | AUTHZ-001 to AUTHZ-011 | Section 6 |
| DDD-006 | DEPT-001 to DEPT-006 | Section 5 |
| DDD-007 | EVT-001 to EVT-007 | Section 7 |
| DDD-008 | ATT-001 to ATT-007 | Section 7 |
| DDD-009 | FIN-001 to FIN-005 | Section 8 |
| DDD-010 | FIN-006 to FIN-012 | Section 8 |
| DDD-011 | CRED-001 to CRED-004 | Section 9 |
| DDD-012 | AUD-001 to AUD-004 | Section 11 |
| DDD-013 | SEC-005, SEC-006 and sensitive workflow requirements | Sections 11, 14, 20.7 |
| DDD-014 | RET-001 to RET-004 | Section 11 |
| DDD-015 | NOTIF-001 to NOTIF-006 | Section 10 |

## 4. Traceability discrepancies found

The earlier range summary in Section 10 of `PHASE-1-REQUIREMENTS-CONSOLIDATION.md` lists broader ranges than the IDs currently present in `PHASE-1-TESTABLE-REQUIREMENTS.md`. Examples:
- It lists MEM-001 to MEM-008, while the current testable file contains MEM-001 to MEM-006.
- It lists ORG-001 to ORG-009, while the current testable file contains ORG-001 to ORG-007.
- It lists AUTHZ-001 to AUTHZ-014, while the current testable file contains AUTHZ-001 to AUTHZ-011.
- It lists multiple other group ranges that do not match the current detailed file.

The earlier table also groups INTG requirements, while the current detailed acceptance criteria place idempotency primarily under SEC-005 and SEC-006 and notification/webhook requirements under NOTIF. The current crosswalk uses the IDs actually found in the testable requirements document. The parent consolidation table should be corrected or explicitly marked as a historical preliminary range summary before final requirements sign-off.

## 5. Coverage gaps and next actions

1. Expand the testable requirements where the current document combines several policy matters into one requirement. Do not create artificial IDs merely to make the counts match.
2. Add explicit requirement IDs for DDD-013 idempotency lifecycle and DDD-015 provider integration/payment controls if the project owner wants these independently testable rather than nested under SEC/NOTIF.
3. Ensure every requirement has one primary owning bounded context and identify cross-context dependencies.
4. Ensure every policy gap is labelled as a blocker or non-blocker for ERD approval.
5. Correct the preliminary range table in the parent requirements consolidation document so it matches the detailed testable requirements, or replace it with a reference to this crosswalk.
6. Add exact source references and acceptance criteria for any newly introduced requirement IDs.
7. Re-run the crosswalk after requirement changes and before final ERD approval.

## 6. Completion assessment

- **Conceptual domain coverage:** All currently enumerated requirement groups have corresponding conceptual entities or explicit platform controls in the ERD.
- **Requirement-level traceability:** Group-level crosswalk is complete for the 97 IDs currently enumerated. Individual line-by-line mapping still requires refinement if new IDs are introduced.
- **Policy completeness:** Not complete. Open policy and evidence matters remain listed in the ERD and integrity review.
- **ERD approval:** Not requested or granted by this document.
- **Implementation authorization:** Not granted. No physical schema, Prisma model, migration, or application code may be created before explicit final ERD approval.
