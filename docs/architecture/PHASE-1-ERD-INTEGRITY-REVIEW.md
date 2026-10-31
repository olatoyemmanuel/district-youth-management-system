# Phase 1 ERD Integrity and Security Review

**Status:** Review report for the working conceptual ERD. Not an approval to implement.  
**Reviewed artifact:** `docs/architecture/PHASE-1-CONCEPTUAL-ERD.md`  
**Branch:** `phase-1/requirements-consolidation`

## 1. Review outcome

The conceptual ERD covers the principal approved DYMS domains and preserves the current implementation gate. It is suitable as a structured review draft, but it is **not yet ready for final owner approval**. Several relationship and constraint details need to be made explicit in the next revision. Some business-policy questions remain open and should not be disguised as technical decisions.

No application code, Prisma models, migrations, or physical database schema were created or changed.

## 2. Critical design findings to resolve in the next ERD revision

### ERD-REV-01: Make the account/member cardinality unambiguous
The current wording says USER_ACCOUNT to MEMBER is 1 : 0..1 and separately says every member must have exactly one account. This is logically compatible but easy to misread. State both directions explicitly:
- Every MEMBER has exactly one USER_ACCOUNT.
- A USER_ACCOUNT has zero or one MEMBER.
- A member profile cannot become active without its individual account.
- A standalone USER_ACCOUNT may exist before member onboarding is complete.
Retain the unique one-to-one constraint. No guardian account or delegation relationship is introduced.

### ERD-REV-02: Define a consistent organizational-scope reference model
Several candidate entities use `scope_type + scope_id` or `owner_scope_type + owner_scope_id`. A polymorphic reference cannot, by itself, provide ordinary foreign-key integrity. The conceptual model should name the allowed scope targets and require the physical design to enforce them. For v1.0, distinguish at least DISTRICT, CHURCH, and DEPARTMENT scope where applicable. Do not assume every entity supports every scope type.

### ERD-REV-03: Separate appointment office, authority, and permission grant
POSITION identifies an office; APPOINTMENT records who holds it; ROLE and PERMISSION define application access. Keep these distinct. The final model must make it possible to identify:
- the authority that appoints,
- the person approving the appointment,
- the organizational scope of the office,
- the effective appointment period,
- the role grants derived from the appointment,
- the independent user roles not derived from an appointment.
An appointment must not implicitly grant permissions without an explicit, versioned appointment-to-role mapping.

### ERD-REV-04: Model approval separation and lifecycle history consistently
Approval is represented as a separate record for events and finance, but not consistently for all workflows. The final ERD should use explicit decision/history records where multiple decisions, reviewers, or approval stages are possible. Do not add approval stages where policy has not defined them. At minimum, preserve actor, decision, reason, timestamp, and target record for appointment, church transfer, category change where approval is required, department membership, credential issuance, access-deny governance, and retention actions.

### ERD-REV-05: Clarify attendance uniqueness when session is optional
The current rule prevents duplicate attendance per member/event/session, but permits event-level attendance where no session exists. The physical design must enforce one valid record per member/event when event-level attendance is used, and one per member/session when session-level attendance is used. It must also prevent mixing event-level and session-level records in a way that double-counts the same attendance. Whether attendance requires registration remains a policy gap.

### ERD-REV-06: Clarify financial transaction amount and posting semantics
The ERD correctly leaves accounting sign conventions open. Before physical design, define whether amount is positive with a transaction type determining direction, or whether signed amounts are permitted. Define the posting model and whether a transaction can be posted in parts. The current PAYMENT 0..* model is a candidate that must not be treated as approval of partial payments. Reversal constraints must prevent reversal totals from exceeding the original posted amount, subject to an approved partial-reversal policy.

### ERD-REV-07: Make idempotency ownership and retention explicit
The idempotency record must be scoped to authenticated actor, operation, and organizational/resource scope, with a normalized request fingerprint. The same key and different payload must conflict. Same key and same payload must not execute twice. Define later how anonymous public endpoints, service actors, and external provider event identifiers fit the key space. Retention and in-progress lease values remain implementation decisions.

### ERD-REV-08: Protect audit integrity and avoid overlogging
Audit events should reference a stable actor identity where one exists and preserve actor type for system, service, and anonymous actions. Delegation must distinguish initiating actor from represented subject. Audit records must not store secrets or unnecessary copies of sensitive payloads. Access to audit search/export must itself be auditable. The conceptual ERD should not imply indefinite retention.

### ERD-REV-09: Resolve generic target references in retention and evidence
RETENTION_HOLD, RETENTION_ACTION, CREDENTIAL_EVIDENCE, and audit target references use conceptual target references. These need an explicit supported-target catalogue and enforceable ownership model in physical design. Holds must apply to the exact record set/scope and prevent destructive action until formally released. Evidence files must use secure object references and follow the approved retention/access policy.

### ERD-REV-10: Separate provider event deduplication from application idempotency
Webhook provider event IDs should be unique per provider. Webhook processing must be idempotent even when callbacks repeat or arrive out of order. The provider event record and business mutation should be linked through a processing outcome/correlation reference. A provider callback is evidence, not an authorization grant.

## 3. Cross-domain integrity review

| Review area | Result | Required treatment |
|---|---|---|
| Identity and member account | Pass with clarification | Make mandatory member-to-account direction explicit. |
| Member category history | Pass, policy gap | Preserve history; do not invent age/qualification rules. |
| Church transfer | Pass, policy gap | Atomic close/open; cancellation/rejection/backdating authority unresolved. |
| Department membership | Pass, policy gap | Multiple memberships and history supported; eligibility/renewal/appeal unresolved. |
| Appointment lifecycle | Partial | Fresh approval and no same-position/scope overlap; acting/exception rules unresolved. |
| Authorization and deny | Partial | Deny precedence/scope captured; complete permission catalogue and scope mapping outstanding. |
| Events and registration | Partial | Approval/publish gate captured; local approval and exception workflows unresolved. |
| Attendance | Partial | History/correction and uniqueness captured; event-level/session-level constraint needs refinement. |
| Finance | Partial | Account ownership, currency and separation captured; accounting and approval policies unresolved. |
| Credentials | Partial | Issuer/version/evidence/history captured; official credential authority rules unresolved. |
| Notifications/integrations | Pass at platform-policy level | Seven approved principles represented; provider details outstanding. |
| Audit | Partial | Append-only and actor model captured; access authority and retention unresolved. |
| Idempotency | Pass at conceptual-policy level | Technical storage/lease/retention values deferred. |
| Retention | Partial | Policy/hold/action model captured; no arbitrary durations invented. |
| Reporting | Pass at conceptual level | Reporting consumes authoritative data and rechecks scope. |

## 4. Security and data-integrity checks

The next ERD revision must retain these mandatory controls:

1. Deny by default; explicit deny overrides only within its named permission/resource scope.
2. Scope ambiguity fails closed. A district-level role must not silently become an unrestricted cross-church or cross-department role.
3. A user cannot grant themselves privileges or approve a transaction they submitted.
4. Expired or revoked appointments cannot grant active appointment-derived permissions.
5. A member category or department membership does not itself grant leadership authority.
6. Sensitive mutations use idempotency and atomic state transitions.
7. Foreign keys and database constraints must protect critical ownership, uniqueness and relationship invariants.
8. Financial amounts use decimal arithmetic and match account currency.
9. Posted financial records are corrected through linked reversals, not silent edits or deletion.
10. Attendance corrections preserve original values and approval history.
11. Audit records are append-only; secrets and unnecessary sensitive payloads are excluded.
12. Retention holds block covered destructive actions. No unapproved retention period is invented.
13. Notification and webhook retries do not duplicate business effects.
14. Payment confirmation requires authenticated provider evidence and reconciliation for uncertain outcomes.
15. Rate limiting, CSRF, secure session handling and the DFR-001/004 auth requirements remain mandatory even though they are not all ERD entities.

## 5. Policy gaps versus technical design decisions

The following are policy/owner matters and should remain open until an authoritative decision is provided:
- eligibility and age criteria for Adventurer, Pathfinder and Senior Youth categories;
- younger-member identity verification and safe individual-account onboarding;
- transfer cancellation, rejection, appeal and backdating;
- acting appointments and exceptional appointment overlaps;
- complete permission catalogue and role conflict matrix;
- department eligibility, renewal and appeals;
- local event approval, registration exceptions and refunds;
- attendance registration prerequisites and self-check-in policy;
- finance approval thresholds, accounting treatment, partial payments, reimbursements and budget enforcement;
- credential requirements and issuing authority;
- audit access and emergency access authority;
- official retention periods and disposal authority.

The following are technical design matters that can be resolved after ERD approval without changing the approved business policy:
- physical representation of scope references;
- index and unique-constraint implementation;
- idempotency key digest and lease strategy;
- transaction isolation and locking strategy;
- webhook ordering/replay handling;
- queue retry/backoff implementation;
- reporting read-model strategy.

## 6. Governance finding: DFR-006 discrepancy

The repository README states that DFR-006 was lifted on 2026-10-29. The decision register records DFR-006 as a formal design freeze. The current project-owner instruction explicitly requires DFR-001–DFR-006 to remain frozen and prohibits application/Prisma/migration/database implementation until final ERD approval.

For this Phase 1 work, the explicit current owner instruction is controlling. The README and decision register should be reconciled in a separately reviewed governance update before implementation. This review does not alter either source file and does not treat the README statement as implementation authorization.

## 7. Recommended next revision

Revise the conceptual ERD to address ERD-REV-01 through ERD-REV-10. Keep policy gaps clearly marked. Then perform a final traceability pass from each approved/testable requirement to:
- its owning conceptual entity,
- relationships and cardinalities,
- lifecycle and history records,
- integrity constraints,
- authorization and audit requirements.

After that, prepare the project-owner approval package. The approval package must include the ERD, decision register status, unresolved policy list, assumptions, security review, and explicit statement that approval authorizes only the next agreed physical-design stage unless the owner separately authorizes implementation.

## 8. Review conclusion

**The ERD is a sound working draft but is not yet ready for final approval.** The ten refinements above should be incorporated before presenting it for formal sign-off. No implementation is authorized by this review.
