# DYMS Phase 2 Reporting Requirements Proposal

- Revision: RPT-PR-01
- Date: 2026-11-02
- Scope: DYMS v1.0, Sango District
- Status: **PROPOSED; NOT YET ADDED TO THE APPROVED 97-REQUIREMENT BASELINE**
- Authority: DDD-005, DDD-012, ODR-004, ODR-013, approved conceptual ERD
- Implementation: NOT AUTHORIZED

## 1. Purpose

The requirements consolidation contains reporting entities and report export controls, but no dedicated REPORT requirement group. This proposal supplies testable candidate requirements so the report-definition, report-run and export-audit model has traceability.

These IDs are reserved proposal identifiers. They do not change the approved 97-row requirement count until the project owner approves this package and the requirements catalogue and crosswalk are updated together.

## 2. Candidate requirements

### REPORT-001 — Versioned report definitions

DYMS shall store each report definition as a versioned record with a stable code, title, description, owner, data classification, approved version, effective date and lifecycle decision history. A version used by a report run shall be immutable. A changed query, parameter contract, scope rule or output classification shall create a new version.

Acceptance:
- A report run identifies one exact report definition version.
- A used version cannot be edited in place.
- Approval actor, decision, reason and timestamp are retained.
- A new version does not rewrite historical runs.

### REPORT-002 — Explicit report scope

DYMS shall bind every report request to an authorized district, church or department scope supported by the requester's current permissions. A request shall not accept an arbitrary scope identifier or widen scope through report parameters.

Acceptance:
- The scope is resolved and validated server-side.
- The report run persists the effective scope and its typed owner relationship.
- A scope outside the requester's authorization is rejected.
- Sango District v1.0 does not provide cross-district/global reporting.

### REPORT-003 — Authorization revalidation

DYMS shall revalidate the requester's authorization at report request, execution and export retrieval. A permission, appointment, role, deny rule or scope change after request creation shall be reflected before data is generated or released.

Acceptance:
- Request-time authorization is recorded.
- Execution-time authorization is re-evaluated.
- Export retrieval performs a fresh authorization check.
- Revoked or expired authority prevents access to the output.
- Each denied access is auditable without exposing report contents.

### REPORT-004 — Data classification

Every report definition shall declare an approved data classification and identify its data owner. A report shall not include fields above the requester's permitted classification or scope.

Acceptance:
- Report definitions have a classification reference.
- Classification changes require a new approved definition version.
- Unclassified reports are not publishable.
- Classification does not itself grant permission.

### REPORT-005 — Aggregation and redaction

DYMS shall apply report-specific aggregation and redaction rules before returning or exporting records where required by the approved data classification and disclosure policy.

Acceptance:
- Redaction/aggregation rules are versioned with the report definition.
- Raw personal or financial fields are excluded unless explicitly permitted.
- Redaction is applied consistently to interactive and exported output.
- The report run records the definition version and policy version used.

### REPORT-006 — Reproducible report runs

Each report run shall record the requester, definition version, effective scope, normalized parameters or a protected parameter reference, request time, execution time, result status, row count where safe, and output reference. The run shall not contain secrets or unnecessary personal data.

Acceptance:
- A run is traceable to one immutable definition version.
- Parameters cannot widen the authorized scope.
- Failed, cancelled and completed runs have distinct controlled outcomes.
- Historical run metadata remains auditable.

### REPORT-007 — Protected exports

DYMS shall authorize each export format and protect generated files using private object storage and short-lived, access-controlled retrieval. Publicly guessable or permanent export URLs are prohibited.

Acceptance:
- Export formats are allowlisted per report definition.
- Object storage is private by default.
- Retrieval requires a fresh authorization check.
- Export references are opaque and not sufficient on their own to authorize access.
- Expiry and deletion follow approved ODR-011/ODR-013 schedules.

### REPORT-008 — Export audit

DYMS shall create an append-only audit record for each export request, generation, retrieval, denial, expiry and authorized disposal. The record shall identify actor, report run, definition version, scope, purpose where required, format, outcome and timestamps.

Acceptance:
- Export audit rows are linked to the report run and actor.
- Audit evidence cannot be modified or deleted by runtime application roles.
- Export access is itself auditable.
- Audit details do not store exported content or secrets.

### REPORT-009 — Retention and disposal

DYMS shall retain report runs and exported files only under approved record-class schedules. Export expiry, legal holds and disposal shall follow the approved retention schedule and must not be inferred from a generic technical TTL.

Acceptance:
- Each retained report/export class maps to an approved schedule version.
- No automated permanent deletion occurs where the schedule is absent.
- Holds suspend disposal.
- Disposal actions record authority, actor, time and evidence.

### REPORT-010 — Resource and execution controls

DYMS shall enforce server-side limits for report execution time, result size, export size and concurrent report jobs. Large reports shall use asynchronous execution and a durable job/result reference.

Acceptance:
- Each report definition declares permitted parameters and bounded execution profile.
- Resource limits are enforced independently of client input.
- Long-running jobs are cancellable by authorized actors.
- Retry does not duplicate export audit or produce conflicting result references.
- Rate limiting applies to report request and export endpoints under the approved security baseline.

## 3. Proposed physical implications

The existing proposed physical entities remain:
- `report_definitions`;
- `report_runs`;
- `report_export_audits`.

The final physical design must ensure:
- candidate key `UNIQUE (id, version)` on report definitions;
- report runs reference the exact definition/version tuple;
- report runs carry a typed and enforceable scope reference;
- export audits reference the report run and actor;
- classification and approval references are governed records, not free-form client strings;
- output files live in private object storage, not inline database blobs;
- export expiry and retention are separate concepts, with permanent disposal disabled until ODR-011 is approved.

No additional scope owner type is authorized by this proposal. District and church event/report ownership defaults remain subject to ODR-004 and ODR-013.

## 4. Owner decisions still required

ODR-013 remains open. The competent reporting, data-owner, security/privacy and project authorities must approve:
- first-release report catalogue;
- classification and disclosure matrix;
- role/scope access matrix;
- permitted export formats;
- export purpose and approval requirements;
- expiry and retention schedule;
- aggregation/redaction requirements.

This proposal does not invent a default report catalogue or retention duration.

## 5. Traceability and approval gate

After approval:
1. Add REPORT-001–REPORT-010 to the canonical requirements source.
2. Update the requirements-to-ERD and requirements-to-test crosswalks.
3. Recalculate the requirement count.
4. Update ODR-013 status and record the authority/approval metadata.
5. Reconcile the report physical table, column, FK and index registers.

Until then, REPORT-001–REPORT-010 remain proposed IDs outside the approved 97-row baseline.

**No SQL, Prisma, migration, seed, report API or application implementation is authorized.**
