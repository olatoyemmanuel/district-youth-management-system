# DYMS Phase 2 Owner Decision Recommendations

- Revision: ODR-REC-01
- Date: 2026-11-02
- Scope: DYMS v1.0, Sango District
- Status: **RECOMMENDATIONS FOR PROJECT-OWNER AND COMPETENT-AUTHORITY APPROVAL**
- Governing records: DFR-001–DFR-006, DDD-001–DDD-015, ODR-001–ODR-013
- Implementation: NOT AUTHORIZED

## 1. Purpose

TBR-01 resolves engineering questions that do not require a policy vote. This document proposes conservative v1 defaults for the remaining product and operational decisions so that the owner and competent authorities can approve or reject exact wording rather than answer broad questions from scratch.

Nothing in this document is approved merely because it is written here. Official ministry, finance, safeguarding, privacy and records authorities retain their decision rights. Existing approved rules are not reopened.

## 2. Recommended v1 decisions

### ODR-004 — Organizational ownership and scope

**Recommendation:**
1. Department instances are district-owned only in v1.0.
2. Local church youth leadership remains a separate local-church structure. A church does not create a duplicate department instance.
3. Events have exactly one owner: Sango District or one local church.
4. A department may organize or participate in an event but is not a third event-owner type in v1.0.
5. District events require district approval before publication. Local church events require approval from the designated local church authority.
6. No cross-church or cross-department authority is implied by role accumulation. Every additional scope requires an explicit assignment.

**Rationale:** This matches the documented district departmental-coordinator and local church youth-leadership hierarchy, keeps the v1 system within Sango District, and avoids introducing an unapproved church-owned department hierarchy.

**Approval required:** Project owner and district governance authority.

### ODR-005 — Finance approval, payment and budget policy

**Recommendation:**
1. Permit multiple district/church accounts only where each account has a unique account code within its owner scope and one immutable currency.
2. Do not create independent department-owned accounts in v1. Department spending uses approved district/church allocations or sub-ledger references.
3. Keep the approved submitter/approver separation. The same user cannot submit and approve a transaction.
4. A transaction must be approved before payment execution. Payment confirmation and accounting posting remain separate events.
5. Disable partial payments in the first implementation unless finance authorities approve them explicitly.
6. Model failed/returned provider attempts separately from posted financial transactions. A failed attempt never posts money.
7. Retain the approved full-reversal-only correction model. A reversal is linked to the original transaction, shares its account and currency, and cannot exceed or duplicate the original reversal amount.
8. Refunds are separate, linked, authorized financial transactions. They are not edits to the original payment.
9. A budget overrun requires an approved budget amendment or explicit exception before posting.
10. Keep NGN as the default. Preserve foreign-currency amount, currency and approved conversion evidence when foreign currency is enabled. Do not invent FX sources or rates.

**Rationale:** This keeps the first release auditable and avoids building partial-payment, multi-approval or FX policy without finance authority.

**Approval required:** District and church finance authorities.

### ODR-006 — Attendance registration and correction

**Recommendation:**
1. Preserve the current physical ERD shape: each event-member attendance subject selects one mode, EVENT or SESSION, and cannot mix modes after its first attendance record.
2. EVENT mode records one attendance result for that member/event subject.
3. SESSION mode records one attendance result per member per session. Overall event attendance is derived from session records, not stored as a duplicate attendance row.
4. Confirmed registration is the normal check-in prerequisite.
5. A walk-in/registration exception requires an authorized coordinator, reason, actor and timestamp.
6. Self-check-in and offline synchronization are disabled in v1 until identity, anti-replay and conflict-resolution controls are approved.
7. QR check-in tokens are short-lived and single-use. Expiry and replay controls are enforced server-side.
8. Corrections after event completion require an authorized correction request, reason, approver and immutable before/after history.
9. If the district authority intends one mode for the entire event rather than per member/event subject, approve that change explicitly before the ERD is frozen.

**Rationale:** One mode per member/event subject prevents mixed event-level and session-level double-counting. The registration exception preserves the documented exception path without making NULL registration an unrestricted bypass.

**Approval required:** District event/attendance authority and project owner.

### ODR-008 — Event registration, capacity and schedule exceptions

**Recommendation:**
1. Only confirmed registrations consume event capacity.
2. Waitlists are disabled in v1.
3. Late registration and reopening after deadline require an explicit event-authority approval and recorded reason.
4. Capacity override requires an authorized decision and reason; capacity must never be exceeded by concurrent registration transactions.
5. A material change to date, venue, owner, capacity or cost requires renewed approval and a change record.
6. Postponement is represented as an approved event change with preserved previous and new schedule, not by erasing the original dates.
7. Completed events are not reopened through ordinary editing. Corrections use their dedicated audited workflow.

**Rationale:** This provides deterministic capacity behavior and avoids unapproved waitlist and late-registration states.

**Approval required:** District and local event authorities; finance authority for fee/refund effects.

### ODR-010 — Audit access and investigation authority

**Recommendation:**
1. Create a distinct Audit Officer role, separate from System Administrator and ministry leadership roles.
2. System Administrators do not receive unrestricted audit-read permission by virtue of technical administration.
3. Ordinary audit reads are scope-limited and separately permissioned.
4. Exceptional investigation access requires a recorded purpose, scope, start/expiry and independent approval.
5. Emergency break-glass access may be allowed only under a separately approved procedure, with immediate alerting and mandatory retrospective independent review.
6. Every audit read, export, exceptional grant and break-glass action is itself audited.

**Rationale:** This preserves separation between platform administration and independent accountability.

**Approval required:** District governance/security/audit authority and project owner.

### ODR-011 — Retention and disposal

**Recommendation:**
1. Do not enable automated permanent deletion for any business record class until an approved schedule exists.
2. Maintain the retention subject, schedule, hold and disposal evidence model.
3. Use a schedule-specific source enrollment list. Do not attach retention subjects indiscriminately to all technical tables.
4. Holds suspend disposal immediately.
5. Posted financial transactions, required audit history and historical membership/appointment/credential evidence are not deleted through ordinary administration.
6. Backups follow DFR-005 and are not a substitute for business-record retention schedules.

**Rationale:** This is the only safe default while the legal/institutional basis and retention durations are unknown.

**Approval required:** Records/administrative authority, district/church governance, finance authority and qualified legal/privacy advice where applicable.

### ODR-012 — Notifications and provider operations

**Recommendation:**
1. Enable in-app notifications as the baseline channel.
2. Enable email only after address verification and approved message templates.
3. Treat SMS and WhatsApp as optional channels requiring recorded consent where applicable.
4. Use provider-independent adapters. Provider choice is a deployment decision and must not affect domain transactions.
5. A notification failure does not roll back the business action.
6. Retries use bounded exponential backoff with jitter, a maximum attempt count, dead-letter review and alerting.
7. Manual replay requires an authorized operator, recorded reason and audit event.
8. Provider credentials remain in managed secrets, never in source code, database payloads or frontend configuration.

**Rationale:** This enables core communication without locking the domain model to a provider or assuming consent.

**Approval required:** Project owner, communications/content authority, privacy/consent authority and integration administrator.

### ODR-013 — Reporting scope and export governance

**Recommendation:**
1. First-release reports are limited to district, church and department scopes within Sango District.
2. No cross-district or public/global reports in v1.
3. Every report definition is versioned, approved and classified before publication.
4. Authorization is rechecked at request, execution and export retrieval.
5. Sensitive personal and financial reports are restricted to explicitly authorized roles and scopes.
6. CSV and PDF are the initial export formats. Other formats require a separate approval.
7. Exports use private storage, opaque references and short-lived authorized retrieval.
8. Report runs and exports are audited. Expiry and permanent disposal follow ODR-011, not an invented generic retention period.
9. Adopt candidate REPORT-001–REPORT-010 in RPT-PR-01 after owner approval and update the requirements catalogue and crosswalk together.

**Rationale:** This provides a controlled first release and closes the missing reporting traceability group without granting broad export access.

**Approval required:** District reporting owner, data owners, security/privacy authority and project owner.

## 3. Decisions that require official evidence, not a software default

The following remain explicitly authority-dependent:
- ODR-001: applicable official Adventurer, Pathfinder, Senior Youth/Ambassador and Master Guide standards, versions, local adaptations, eligibility and evidence.
- ODR-002: transfer rejection, cancellation, appeal, backdating and one-open-request cardinality.
- ODR-003: exact appointment lifecycle, early termination authority, future/retroactive effective dates and any acting/overlap exception. Acting appointments and overlap exceptions remain disabled.
- ODR-007: department-specific eligibility, renewal, appeal, transfer effects and exception authority.
- ODR-009: official credential catalogue, issuer authority, validity, evidence, revocation and disclosure.
- ODR-ENV-007: production deployment provider/topology and evidence that DFR-005 backup/restore targets are met.

No engineering decision can substitute for these authorities.

## 4. Required owner response

For each ODR item above, the project owner should record one of:
- APPROVE AS PROPOSED;
- APPROVE WITH AMENDMENTS; or
- DEFER TO NAMED AUTHORITY.

Any authority decision must include the authority, evidence/source, effective date and exact approved rule. The canonical ODR register and affected requirements/physical registers must then be updated.

**This recommendation package does not change DFR-001–DFR-006, approve the physical design, or authorize implementation.**
