# DYMS CPERD-12 — Retention Source-Enrollment Candidate Inventory

- Deliverable: CPERD-12
- Date: 2026-11-11
- Repository: olatoyemmanuel/district-youth-management-system
- Branch: phase-1/requirements-consolidation
- Status: **CANDIDATE SOURCE INVENTORY PREPARED; NO SCHEDULES OR SOURCE LINKS APPROVED**
- Implementation: **NOT AUTHORIZED**

## 1. Purpose and scope

This inventory prepares the source-enrollment candidate list required by Phase 4 GDC-01 §8. It identifies DYMS records that may need a retention subject, their bounded-context owner, candidate lifecycle trigger, hold relevance and open evidence.

It does not:
- approve a retention period, legal basis, source authority or disposal trigger;
- activate a retention schedule;
- enroll a source record in a retention subject;
- add a retention FK, source_type/source_id field, join table or polymorphic reference;
- select archive, anonymization or deletion behavior;
- modify the CPERD-01 ERD or canonical physical registers;
- authorize SQL, Prisma, migrations, application code, tests or deployment.

## 2. Governing decisions

The operative owner-approved DDD-014 / ODR-011 product defaults are:

1. No automated permanent deletion without an approved schedule.
2. An applicable active hold suspends disposal.
3. A retention schedule must identify the record class, approved basis, duration, triggering event, responsible authority and permitted action.
4. Unknown or unapproved periods remain unset and cannot trigger permanent deletion.
5. Business-record retention is separate from DFR-005 backup retention.
6. A terminal business status does not by itself authorize deletion.

The project owner approved these DYMS defaults under Phase 4 GDC-01 §5. External records, finance, privacy or institutional requirements are separate source/configuration inputs. They are not assumed or invented here.

## 3. Current physical retention model

The approved CPERD-01 master identifies four retention entities:

| Entity | Current physical role | Relevant fields in the canonical column register |
|---|---|---|
| `retention_policies` | Versioned schedule catalogue | record_category, duration, trigger_code, required_action, legal_basis, approving_authority, version, effective_from, effective_to, status |
| `retention_subjects` | Typed retention anchor | record_class, lifecycle_state, created_at, disposal_eligible_at, created_by_user_account_id |
| `retention_holds` | Hold/release record for one retention subject | retention_subject_id, reason, issued_by_user_account_id, approved_by_user_account_id, created_at, released_at, release_reason, status |
| `retention_actions` | Controlled action against one retention subject | retention_policy_id, retention_subject_id, initiated_by_user_account_id, approved_by_user_account_id, action, reason, executed_at, outcome, verification_reference |

### 3.1 Important source-link gap

The current `retention_subjects` register has no source-table FK, source-row identifier, source owner, or typed source-link table. The ERD describes a typed retention anchor and does not authorize polymorphic business ownership FKs.

Therefore:
- the inventory below is a candidate mapping only;
- no table is considered enrolled merely because it appears in this list;
- no `source_type + source_id` polymorphic reference is assumed;
- the successor design must select an explicit source-link strategy for each enrolled class and preserve referential integrity;
- possible designs such as dedicated source-specific association tables or another explicitly typed registry are options for review, not selected decisions.

Do not add source columns or FKs until the source-link strategy is reconciled with the owner-approved ERD and submitted for review.

## 4. Candidate source-enrollment matrix

All class names below are descriptive labels, not approved persisted `record_class` codes. Every duration, legal basis, trigger and action remains **UNSET** unless an existing separate decision explicitly governs it.

| Candidate record class | Candidate source tables | Bounded-context owner | Candidate lifecycle trigger to evaluate | Hold relevance | Current status |
|---|---|---|---|---|---|
| Identity and account lifecycle | `user_accounts`, `auth_sessions`, `auth_session_tokens`, `password_reset_tokens`, `pre_auth_contexts` | Identity & Access | Account closure/suspension; session revocation/expiry; reset-token use/expiry; pre-authentication context completion/expiry | Potentially, where an investigation or legal hold applies | Not enrolled; authentication expiry rules remain distinct from business-record retention |
| Authorization and access history | `roles`, `permissions`, `role_permissions`, `user_role_assignments`, `access_denies`, `role_conflict_rules`, `role_conflict_reviews` | Identity & Access / Security | Grant expiry/revocation; deny expiry/revocation; role-conflict review completion or supersession | Yes, where needed to preserve an investigation or explain historic authorization | Not enrolled; preserve authorization provenance; no history deletion assumed |
| Idempotency and safe replay | `idempotency_records`, `idempotency_recovery_events` | Identity & Access | Terminal response expiry and tombstone expiry | Potentially; security/investigation hold must override cleanup | Separate approved DDD-013 technical retention applies; do not substitute ODR-011 schedule |
| Organization and reference catalogues | `districts`, `churches`, `departments`, `member_categories`, `member_category_eligibility_rules`, `department_eligibility_rules`, `currencies` | Organization / Membership / Finance | Closure, merger, supersession or catalogue-version retirement | Potentially, where historic ownership or rule provenance is disputed | Not enrolled; preserve historical references; no schedule or deletion behavior selected |
| Member and membership history | `members`, `member_category_assignments`, `church_memberships`, `church_transfer_requests`, `department_memberships` | Membership / Department Membership | Membership/category end; transfer completion/cancellation/rejection; department withdrawal/termination | Yes, where safeguarding, membership dispute, appeal or investigation applies | Not enrolled; category/transfer/department history must remain explainable |
| Leadership and appointment history | `positions`, `appointments`, `appointment_role_links` | Leadership / Identity & Access | Appointment end/termination; position retirement; derived grant termination | Yes, where appointment or authority is under investigation | Not enrolled; retain evidence needed to reconstruct historic authority |
| Event and registration records | `events`, `event_approvals`, `event_change_records`, `event_registrations`, `event_sessions`, `event_organizing_departments` | Events | Event completion/cancellation; registration cancellation; final event reconciliation | Yes, where incident, safeguarding, complaint or financial dispute applies | Not enrolled; completed events are retained; terminal state alone does not authorize deletion |
| Attendance and correction evidence | `event_attendance_subjects`, `attendance_records`, `attendance_corrections` | Attendance | Event/session completion; correction approval/rejection; credential/report use where authorized | Yes, especially for disputes, safeguarding or verification investigations | Not enrolled; original attendance and correction provenance must remain linked |
| Finance and budget records | `financial_accounts`, `financial_transactions`, `transaction_revisions`, `transaction_approvals`, `payments`, `transaction_reversals`, `budgets`, `budget_lines` | Finance | Account closure; transaction posting/reversal; budget-period close; payment reconciliation completion | Yes; holds must block disposal of the relevant financial subject/evidence | Not enrolled; posted transactions remain immutable and are corrected by linked reversal; official financial schedules are not invented |
| Credential definitions and evidence | `credential_definitions`, `credential_definition_versions`, `credential_issuances`, `credential_evidence` | Credentials | Definition supersession; credential expiry/revocation; renewal/reissue completion | Yes, where issuance, issuer authority or evidence is disputed | Not enrolled; preserve issuer, evidence and lineage; unknown validity remains unset |
| Audit and privileged-access evidence | `audit_events`, `audit_access_events` | Audit & Retention / Security | Audit event creation; investigation closure; authorized export/review completion | Yes; audit evidence may itself be the subject of a hold | Not enrolled; append-only behavior remains; no automatic deletion without an approved schedule |
| Reporting and export records | `report_data_owners`, `report_definitions`, `report_runs`, `report_export_audits` | Reporting / source-domain data owners | Report definition retirement; report-run completion; export expiry/retrieval/disposal event | Yes, where report output is evidence in an investigation or dispute | Not enrolled; private export and authorization rules apply; report-specific expiry/retention values remain unset |
| Notifications and delivery evidence | `notification_templates`, `notification_preferences`, `notifications`, `notification_recipients`, `notification_deliveries` | Notifications & Integrations | Delivery exhaustion/completion; preference supersession; template retirement | Potentially, where notification proof is relevant to a dispute or investigation | Not enrolled; provider acceptance is not delivery; consent/preferences must remain attributable |
| Provider integration and operational records | `service_principals`, `integration_providers`, `outbox_messages`, `webhook_events`, `integration_failures` | Identity & Access / Notifications & Integrations | Provider event reconciliation; outbox completion/exhaustion; integration failure resolution; principal deactivation | Potentially, where a provider event is linked to a financial/security incident | Not enrolled; operational retry/lease cleanup is separate from business-record retention |
| Retention control evidence | `retention_policies`, `retention_subjects`, `retention_holds`, `retention_actions` | Audit & Retention | Policy supersession; hold release; action completion and verification | The hold/action records are themselves evidence and may require preservation | Not enrolled as source classes; their own retention must not be assumed recursively |

## 5. Separate technical lifetimes that are not ODR-011 schedules

These existing decisions must remain distinct from general business-record retention:

| Record/control | Existing rule | Boundary |
|---|---|---|
| Password-reset token | DFR-004: 30-minute expiry, single use | Token expiry/replay control; raw reset secret is not stored in the outbox or audit log |
| Authentication session | DFR-004: 7-day inactivity timeout and 30-day absolute lifetime | Session validity/revocation is not the same as deletion of account/security history |
| DDD-013 response retention | 24-hour terminal response retention | Approved idempotency protocol; exact cleanup validation is post-authorization |
| DDD-013 tombstone | 30-day compact identity/tombstone retention | Approved idempotency protocol; not a general business retention schedule |
| Backup copies | DFR-005 daily encrypted backups, RPO no greater than 24 hours, RTO within 8 hours, restore tests and alerting | Backup retention and restore controls are separate from business-record retention |
| Report export | `report_runs.expires_at` exists as a field | No expiry duration or automatic object deletion is selected by this inventory |
| Outbox/webhook processing | Durable processing, bounded retries and deduplication | Operational cleanup/retention values require a separate worker/operations contract |

## 6. Minimum evidence required before a source class is enrolled

For each class, record:

1. Stable human-readable class description and proposed persisted class code.
2. Exact source table(s) and source-row identity strategy.
3. Domain/data owner responsible for the source.
4. Legal, organizational or administrative basis, with source authority, document/version and effective date where applicable.
5. Retention duration and its start/trigger event.
6. Permitted action: preserve, restrict access, archive, anonymize or delete; specify which actions are prohibited.
7. Hold applicability, hold issuer/approver, release conditions and precedence over disposal.
8. Required approvals and separation of duties for disposal.
9. Verification evidence and audit event required after execution.
10. Backup/restore implications and any independent legal/financial retention obligations.
11. Tests for schedule selection, unknown duration, active hold, race between hold and disposal, duplicate action, failed action and recovery.

No class is enrolled until these fields are complete and the exact source-link design is approved.

## 7. Candidate source-link and concurrency constraints

- A retention action must reference exactly one retention subject and one policy version.
- Holds and actions must reference the same subject; the subject row remains the proposed serialization anchor.
- Hold creation and disposal must serialize on the same subject row.
- The disposal transaction must recheck source enrollment, approved policy/version, due trigger and active holds in one transaction.
- No direct runtime/worker DELETE is granted on business source tables.
- No generic polymorphic FK is introduced.
- Source enrollment must not weaken existing RESTRICT relationships, append-only audit evidence, immutable posted finance records or attendance correction history.
- A retention subject with no approved schedule, no source enrollment, unknown duration or unresolved hold state is not eligible for automated permanent deletion.

## 8. Explicit exclusions and unresolved design questions

1. No retention duration is assigned to any candidate class.
2. No official finance, privacy, church, ministry or records schedule is asserted.
3. No candidate `record_class` string is approved as a database enum or seed.
4. No source-to-subject FK, polymorphic pointer or association table is selected.
5. No archive, anonymization or deletion action is enabled.
6. No automatic deletion of audit, posted finance, membership, attendance, credential or report evidence is enabled.
7. No schedule is inferred from terminal lifecycle states.
8. The retention-control tables' own retention requirements are not recursively assumed.
9. ODR-011 source enrollment and schedule values remain unconfigured; this follows the owner-approved no-deletion-without-schedule default and is not an external approval blocker.

## 9. Disposition

- Candidate source classes inventoried: **15**.
- Physical tables represented in the inventory: **70 of 70**.
- Source classes formally enrolled: **0**.
- Approved ODR-011 business retention durations added: **0**.
- New retention FKs/columns/tables: **0**.
- Destructive retention actions enabled: **0**.
- CPERD-12 status: **CANDIDATE INVENTORY COMPLETE; SOURCE-LINK STRATEGY AND RECORD-CLASS ENROLLMENT REMAIN DESIGN WORK**.
- Implementation authorization: **NOT GRANTED**.

This inventory is a design proposal under Phase 4 GDC-01 §8. It does not amend the owner-approved CPERD-01 master ERD or authorize physical schema changes.
