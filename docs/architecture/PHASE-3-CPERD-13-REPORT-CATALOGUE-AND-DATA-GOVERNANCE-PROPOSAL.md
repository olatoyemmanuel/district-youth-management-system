# DYMS CPERD-13 — Reporting Catalogue and Data-Governance Proposal

- Deliverable: CPERD-13
- Date: 2026-11-11
- Repository: olatoyemmanuel/district-youth-management-system
- Branch: phase-1/requirements-consolidation
- Status: **PROPOSAL ONLY; REPORT DEFINITIONS, OWNERS, CLASSIFICATIONS AND DISCLOSURE RULES NOT APPROVED**
- Implementation: **NOT AUTHORIZED**

## 1. Purpose

This document prepares the report catalogue proposal required by Phase 4 GDC-01 §8. It identifies candidate first-release reports, their purpose, accountable data owner, permitted scope, source fields, candidate classification, redaction, export permission and retention dependency.

The project owner has approved ODR-013 product defaults:
- district, church and department scope only;
- versioned and classified report definitions;
- authorization at request, execution and export retrieval;
- protected/private CSV and PDF exports;
- report parameters cannot widen the actor's authorized scope.

This proposal does not approve a report for publication, select the final classification taxonomy, create report definitions/seeds, authorize cross-domain disclosure, or implement report queries.

## 2. Existing reporting model and constraints

The current CPERD-01 physical model contains:

- `report_data_owners`: code, display_name, owning_context, authority_reference, status, approved_by_user_account_id, approved_at and created_at.
- `report_definitions`: code, version, name, description, classification, definition_payload, status, created_by_user_account_id, approved_by_user_account_id, created_at, effective_from, effective_to, and data_owner_id.
- `report_runs`: report definition/version, requester, mandatory district scope, optional same-district church/department scope, scope_kind, parameters, status, timing, output metadata and expires_at.
- `report_export_audits`: report_run_id, actor, export object key, format, destination classification, exported_at, download_expires_at, purpose and correlation_id.

The API proposal includes report-definition listing/detail, report-run request/list/detail/cancel, export request/retrieval, and fresh authorization at export retrieval.

### 2.1 Scope constraints

- Every run is bound to one district.
- Optional church and department scope must belong to that same district.
- GLOBAL and cross-district scope are excluded.
- Scope is derived from the authenticated actor and server-side resource ownership, not trusted from client parameters.
- The v1 district/church/department scope does not create federation-wide report access.
- A user who can view a source record does not automatically receive export permission.

### 2.2 Data-owner model gap

The current proposal gives each report definition one `data_owner_id`. Some candidate reports combine sources from more than one bounded context. The schema does not yet define:
- multiple source data-owner approvals for one report;
- a primary accountable owner plus secondary source-owner sign-off;
- scope-specific data-owner assignments;
- owner delegation/replacement history.

This is a design gap for cross-domain reports. Do not assume one data owner has authority to disclose every source domain. For a multi-domain report, use a primary accountable owner plus documented source-owner review as a process proposal, or return to the owner for a data-owner relationship amendment. No new table or FK is proposed here.

## 3. Candidate classification framework

The following labels are proposed for discussion only. They are not approved enum values, database CHECK values or production seeds.

| Candidate class | Typical content | Default handling proposal |
|---|---|---|
| INTERNAL | Aggregated counts, event summaries, operational totals without direct personal identifiers | Scope-limited view; aggregation by default; export only where explicitly permitted |
| CONFIDENTIAL | Member identity, church/department membership, appointment, attendance and credential status | Actor/scope authorization; field minimization; mask identifiers not needed for purpose; export requires separate permission |
| SENSITIVE | Financial transactions, payment details, credential evidence, audit/security events, retention investigations and privileged-access records | Need-to-know access; explicit purpose; separate export permission; stronger redaction; no bulk export by default |

Classification must be assigned per report definition and reviewed against every source field. A report's classification is the highest applicable classification among the fields it exposes. A report cannot lower source sensitivity through aggregation metadata alone.

## 4. Candidate report catalogue

All entries below are proposals. Candidate IDs are working labels only and must not be seeded as final report codes without approval.

| Candidate | Purpose | Accountable data owner proposal | Scope | Candidate classification | Export permission |
|---|---|---|---|---|---|
| RC-01 Member Register | Provide an authorized member roster and current membership overview | Membership, with Organization source-owner review for church names/scope | District / church | CONFIDENTIAL | Separate scoped export permission; default view-only |
| RC-02 Category Assignment and Eligibility | Show current primary category, assignment history and configured eligibility result | Membership | District / church | CONFIDENTIAL | Separate scoped export permission; no sensitive evidence attachments |
| RC-03 Church Transfer Register | Monitor transfer requests, receiving-church acceptance, district decision, dates and reasons | Membership, with Organization source-owner review | District / church | CONFIDENTIAL | Restricted to authorized membership/leadership workflow users; separate export permission |
| RC-04 Department Membership Register | Show department membership, approval, withdrawal and termination history | Department Membership, with Organization source-owner review | District / department | CONFIDENTIAL | Separate scoped export permission |
| RC-05 Leadership Appointment Register | Show positions, current/previous appointments, terms, approving actors and appointment history | Leadership | District / church / department | CONFIDENTIAL | Separate scoped export permission; no permission-grant secrets |
| RC-06 Event Calendar and Registration Summary | Show approved events, owner, schedule, capacity and confirmed registration counts | Events | District / church / department | INTERNAL for aggregate; CONFIDENTIAL for participant-level detail | Aggregate export may be separately permitted; participant export requires explicit permission |
| RC-07 Attendance Register and Participation Summary | Show attendance totals, subject mode, session attendance and authorized correction history | Attendance, with Events source-owner review | District / church / department | CONFIDENTIAL | Separate scoped export permission; correction provenance visible only to authorized roles |
| RC-08 Finance Account and Transaction Summary | Show account balances/summary, transaction status, approvals, payments and linked reversals | Finance | District / church | SENSITIVE | Explicit finance export permission; purpose required; no unrestricted bulk export |
| RC-09 Budget Performance | Show approved budgets, budget lines, expenditure and variance | Finance | District / church | SENSITIVE | Explicit finance export permission; scope and period required |
| RC-10 Credential Register | Show credential definition/version, issuance status, issuer, issue/expiry/revocation and renewal lineage | Credentials | District / church | CONFIDENTIAL; SENSITIVE if evidence fields are included | Status-only export proposal; evidence documents excluded by default |
| RC-11 Audit and Privileged-Access Report | Support authorized audit investigation and review of audit access | Audit & Retention / Security | District | SENSITIVE | Audit Officer and independently approved investigation access only; export itself audited |
| RC-12 Retention Holds and Actions | Show record classes, active holds, approved policy references and completed retention actions | Audit & Retention / Records | District | SENSITIVE | Designated records/audit permission; export purpose and access audited |
| RC-13 Notification and Integration Delivery | Show logical notifications, delivery attempts, provider outcome and unresolved failures | Notifications & Integrations | District / church / department | INTERNAL for aggregate; CONFIDENTIAL for recipient-level | Separate export permission; exclude provider secrets and message content not needed for purpose |
| RC-14 Report Export Activity | Show report run/export requests, requester, purpose, format, retrieval/denial and expiry events | Reporting, with Audit source-owner review | District | SENSITIVE | Audit/report governance permission; report export audit itself must be audited |

## 5. Minimum definition payload contract proposal

Each report definition should document, at minimum:

1. Stable report code and version.
2. Business purpose and intended user decision.
3. Primary accountable data owner and any required secondary source-owner reviews.
4. Allowed scope kinds: district, church or department.
5. Source contexts and source tables.
6. Selected fields and their source classification.
7. Allowed filters and sort keys, with server-side validation.
8. Aggregation and redaction rules.
9. Whether row-level detail is allowed or aggregation is mandatory.
10. Output formats: CSV/PDF only under the current owner-approved default.
11. Required view permission and separate export permission.
12. Required purpose/reason for sensitive report/export.
13. Maximum row count, runtime, concurrency and export size, once operational limits are selected.
14. Retention dependency and export expiry behavior.
15. Definition approval actor, effective interval and supersession rules.
16. Audit events required at request, execution, denial, export creation, retrieval and expiry.

The payload is a candidate logical contract. Its JSON schema, validation version, compatibility and migration strategy remain technical design work.

## 6. Field minimization and redaction rules

Proposed minimum controls:

- Do not include passwords, password hashes, reset secrets, session tokens, refresh tokens, HMAC keys, provider credentials, cookies or raw authentication material.
- Do not export credential evidence documents by default. A credential status report should expose only the minimum status, issuer and validity metadata permitted by the report definition.
- Member reports should omit personal contact fields unless the report purpose explicitly requires them and the actor has permission.
- Attendance reports should expose participant identity only where necessary; otherwise aggregate counts by event/session and authorized scope.
- Finance reports should exclude bank/provider secrets and expose only transaction/payment fields required by the authorized finance purpose.
- Audit reports must not expose raw secrets, tokens, cookies, passwords or HMAC material. Sensitive event payloads require field-level filtering.
- Notification reports should omit full message content unless a separately approved operational investigation requires it.
- Report parameters must not accept arbitrary SQL, table names, field names, joins, raw sort expressions or unbounded date ranges.
- Every field must be allowlisted by report definition and reauthorized at execution and retrieval.

## 7. Data-owner assignment proposal

The following are accountable bounded-context owners, not named people or approved database seed values:

| Source context | Candidate owner code/name | Reports primarily owned |
|---|---|---|
| Membership | Membership data owner | RC-01, RC-02, RC-03 |
| Department Membership | Department membership data owner | RC-04 |
| Leadership | Leadership data owner | RC-05 |
| Events | Events data owner | RC-06 |
| Attendance | Attendance data owner | RC-07 |
| Finance | Finance data owner | RC-08, RC-09 |
| Credentials | Credentials data owner | RC-10 |
| Audit & Retention | Audit/records data owner | RC-11, RC-12 |
| Notifications & Integrations | Integration/notification data owner | RC-13 |
| Reporting | Reporting data owner | RC-14 |

Organization is a source owner for districts, churches and departments. Cross-domain reports require the primary owner and documented source-owner review. The current single `data_owner_id` relationship does not yet represent that secondary review as a persisted relation.

## 8. Export and retention dependency

- CSV/PDF exports are private artifacts, never public URLs.
- Every export request records the actor, report run, purpose, format and destination classification.
- Retrieval performs fresh authorization and checks expiry.
- Export retrieval/denial/expiry and authorized disposal are recorded in `report_export_audits`.
- `report_runs.expires_at` and `report_export_audits.download_expires_at` exist in the candidate physical model, but no duration or automatic cleanup policy is selected here.
- Report outputs require a retention subject/source-link design under CPERD-12 before automated disposal.
- Until ODR-011 schedule/source enrollment is configured, do not automatically delete report runs or exports merely because a business event is complete.
- Report-export audit evidence remains subject to append-only audit and retention controls.
- DFR-005 backup retention remains separate.

## 9. Required approval and technical review

Before a candidate report becomes an approved report definition:

1. Project owner accepts the catalogue entry and intended v1 scope.
2. Primary data owner and any source-domain owners approve the selected fields and disclosure.
3. Classification and redaction are reviewed against source sensitivity.
4. View and export permissions are defined separately.
5. Scope behavior is checked against the user's district/church/department authorization.
6. Filters, date ranges, row limits and resource limits are defined.
7. Retention and expiry behavior is aligned with approved schedules; no destructive action is enabled without one.
8. The report definition is versioned and approved before publication.
9. API request/execution/retrieval authorization and audit behavior are mapped to requirements REPORT-001–REPORT-010.
10. Query plans, load limits, export storage security and authorization tests are performed only after separate implementation authorization.

## 10. Open design questions

1. Is one accountable primary data owner plus documented source-owner review sufficient, or does a report need multiple persisted data-owner links?
2. Should `report_data_owners` be scoped to a district, or remain a bounded-context catalogue with scope enforced by report runs?
3. Which exact classification labels and definitions will the project owner adopt?
4. Which of the 14 candidate reports are in v1, and which are deferred?
5. Which fields require masking, aggregation or complete exclusion for each report?
6. Which roles/permissions may view and export each report at district, church and department scope?
7. What purpose/reason is mandatory for sensitive report execution and export?
8. What are the row-count, date-range, runtime, concurrency and file-size limits?
9. What export expiry/retention schedule applies to each report class?
10. Which reports require independent approval before publication or export?

## 11. Disposition

- Candidate reports proposed: **14**.
- Approved report definitions: **0**.
- Approved classification taxonomy: **0**.
- Approved report-owner seed entries: **0**.
- New physical tables/columns/FKs: **0**.
- Global or cross-district reports: **NOT PROPOSED**.
- CPERD-13 status: **PROPOSAL PREPARED; PROJECT-OWNER REVIEW REQUIRED**.
- Implementation authorization: **NOT GRANTED**.

This proposal does not amend the approved CPERD-01 master ERD and does not authorize report seeds, SQL, Prisma, API implementation, export jobs, storage configuration, tests or deployment.


## 12. CPERD-03 owner-scope reconciliation addendum (2026-11-12)

This section supersedes conflicting wording in §§2.1 and 4 for the DYMS 1.0 Federation oversight boundary.

### 12.1 Federation oversight is read-only and federation-bounded

The project-owner-approved Federation rule permits federation-authorized users to view cross-district reports and monitor activity within their own federation. It does not grant operational administration.

- Federation oversight is limited to the districts linked to the authenticated user's federation.
- The oversight surface is aggregate-only by default and excludes member-level personal records, individual attendance rows, credential evidence, audit event detail and sensitive investigation content.
- It is a read-only query surface. Federation users cannot create report runs, request exports, edit report definitions or mutate source records.
- This surface is separate from the persisted `report_runs` model. Standard report runs remain district-, church- or department-scoped. No GLOBAL scope is introduced.
- A federation oversight query must derive its district set server-side from Organization ownership. Client-supplied district lists are never trusted.
- Federation oversight does not grant Audit Officer permission or access to source-domain records.

### 12.2 Candidate Federation oversight view

| Candidate | Purpose | Accountable owner proposal | Scope | Candidate classification | Export permission |
|---|---|---|---|---|---|
| RC-15 Federation Activity Oversight | Display aggregate district activity, event/program counts, attendance participation summaries and operational status across the authorized federation | Organization as primary owner, with source-context review by Membership, Events, Attendance and Department Membership | One federation and its linked districts | INTERNAL; aggregate-only; no direct member identifiers | No export in v1 proposal; GET-only dashboard/query |

RC-15 is a read-only aggregate query, not a stored report definition/run or a downloadable export. Its exact measures, freshness, source-owner approvals, redaction and permission mapping remain open for review. Do not seed or publish it as an approved report without owner approval.

### 12.3 Excluded/deferred report candidates

- RC-03 Church Transfer Register: EXCLUDED with Church Transfer.
- RC-08 Finance Account and Transaction Summary: DEFERRED with finance/payment management.
- RC-09 Budget Performance: DEFERRED with finance/budget management.
- RC-10 Credential Register: DEFERRED with credential issuance/evidence management.

All other candidate reports remain proposals and require report-specific data-owner, classification, scope, field-minimization, redaction, export and retention review.

### 12.4 Physical-design boundary

No new report table, report-run scope column, federation report-run FK or export workflow is introduced by this addendum. The existing district/church/department `report_runs` scope remains unchanged. Federation oversight is implemented as a separately authorized read-only aggregate query contract, subject to final API and physical-design reconciliation.

**Status: PROPOSAL ONLY — NOT APPROVED.**
