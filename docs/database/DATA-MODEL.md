# DYMS Database Domain Model

> **Restoration and current-decision note (2026-10-30):** This document is restored from the latest recoverable project snapshot located in the user's saved files. Its original content is retained as the design baseline, with the status corrections below taking precedence wherever older text conflicts. This restoration is not ERD approval and does not authorize Prisma models or migrations.
>
> Current approved domain resolutions supersede conflicting earlier wording: MEM-02 is one-to-one User–Member; DDD-003 requires one current primary church with atomic transfer and preserved history; DDD-004 requires annual historical appointments with higher-authority renewal and no self-renewal. DDD-002 permits concurrent Ambassador and Young Adult affiliations at age 21 when locally approved. DFR-006 was lifted on 2026-10-29. See `DOMAIN-DECISION-APPROVAL-UPDATE-2026-10-30.md` and the DDD-013 specification for the authentication/idempotency slice.

## 1. Document Status

- Status: Proposed design draft
- Product: District Youth Management System (DYMS)
- Target release: v1.0
- Organizational scope: Sango District
- Architecture: Approved modular monolith with Clean Architecture
- Persistence: PostgreSQL with Prisma ORM
- Design freeze: DFR-006 was historically approved and was lifted on 2026-10-29; implementation was authorized, subject to the remaining ERD and schema approval gates
- Review state: Remediated proposed design; awaiting explicit user approval

This document translates the known architectural and security decisions
into a proposed relational domain model. It does not claim that the model
has been approved, implemented, tested, or deployed.

The approved product requirements document was not found in the current
repository or its available Git history. Requirements that cannot be
verified must remain explicit review items rather than being treated as
approved facts.

No Prisma models or database migrations are authorized by this draft alone.

This document is read with [`ERD.md`](ERD.md), which defines the conceptual
relationships; [`REQUIREMENTS-TRACEABILITY.md`](REQUIREMENTS-TRACEABILITY.md),
which records provenance and approval blockers; and
[`INVARIANT-ENFORCEMENT-REGISTER.md`](INVARIANT-ENFORCEMENT-REGISTER.md),
which separates database, transaction, and application enforcement. These
documents preserve the proposed status of rules that have no authoritative
product source.

[`ERD-FINAL-REVIEW.md`](ERD-FINAL-REVIEW.md) records the remediation outcome,
material approval blockers, and final approval checklist.

## 2. Design Principles

1. PostgreSQL is the authoritative system of record.
2. Internal entity identifiers use UUIDs.
3. Foreign keys and unique constraints protect relational integrity.
4. Timestamps use consistent UTC semantics.
5. Money uses fixed-precision decimal types.
6. Historical business records are preserved where required.
7. Sensitive workflows use database transactions.
8. Authorization is enforced by the server using trusted identity,
   valid assignments, resource scope, and business rules.
9. Rate limiting remains mandatory for APIs and sensitive operations.
10. Production schema changes require reviewed, version-controlled
    migrations. Production must not rely on Prisma db push.

## 3. Organizational Scope

DYMS v1.0 is scoped to Sango District.

The initial organizational model is:

District
├── Churches
└── Departments
└── Participating churches

### 3.1 District

Represents the district managed by this deployment.

### 3.2 Church

Each church belongs to one district in v1.0.

### 3.3 Department

Departments are owned by the district, not independently duplicated
under each church.

A church may participate in a district department through an explicit
church-department relationship. The relationship must support lifecycle
tracking if participation can change.

### 3.4 Future expansion

Multi-district and multi-conference operation is outside the initial
scope. Any expansion that changes the approved specification requires a
documented change request and impact review.

## 4. Identity and Membership

### 4.1 User

Represents an authenticated account.

Responsibilities include account status, authentication identity,
password hash, and security-related lifecycle state.

Passwords must be hashed with Argon2id. Raw passwords must never be stored.

### 4.2 Member

Represents a person's Adventist Youth Ministries membership profile.

Every Member must have exactly one User account, and each User may be
associated with at most one Member.

The one-to-one relationship requires a unique foreign key. The requirement
that every Member has a User must also be guaranteed by the application
creation workflow or an appropriate database-level mechanism; a unique
foreign key alone does not enforce mandatory participation on both sides.

Member categories for v1.0:

- ADVENTURER
- PATHFINDER
- SENIOR_YOUTH

Master Guide is a credential, not a member category.

### 4.3 Primary church membership

Each Member has exactly one current primary church, represented by the
Member's current primary-church reference.

A church transfer must preserve the previous membership record and its
effective dates in ChurchMembershipHistory. The transfer workflow must
update the current church reference and close/open the corresponding
history records in one database transaction.

The implementation must prevent concurrent transfers from creating
multiple current primary-church assignments. Appropriate database
constraints and transaction-level concurrency controls must enforce
this invariant.

### 4.4 Department membership

A Member may participate in multiple district departments simultaneously,
including departments in which the Member's primary church does not
participate.

ChurchDepartment records which churches participate in a district
department. DepartmentMembership records an individual Member's
participation. These are separate relationships with separate lifecycles.

Department assignments must retain status, effective dates, and relevant
history. Department participation does not change primary church
membership and does not automatically grant leadership permissions.

## 5. Leadership and Authorization

### 5.1 Roles and permissions

Roles group permissions. Permissions describe specific actions.

`RolePermission` is the explicit junction between `Role` and `Permission`.
It represents their many-to-many relationship and preserves the identity of
both related records. Whether permission-to-role changes are versioned, take
effect immediately, or require reapproval remains unresolved; the
implementation must audit the change and must not silently reinterpret
historical authorization decisions.

Assignments must be scoped to the appropriate district, church,
department, or resource context.

A RoleAssignment grants a role to a Member within an explicit organizational
scope. An Appointment records a time-bounded leadership designation and its
lifecycle. Every appointment references the RoleAssignment it activates or
governs; the appointment, assignment, Member, role, and scope must agree.
The subject Member, creating actor, approving authority, and ending or
revoking actor are distinct identities. Creation does not constitute approval.

An appointment that requires approval cannot produce effective authority
until it is valid and approved. Appointment-independent assignments may exist
only where the eventual role policy permits them. Neither record grants
permissions outside its approved scope.

The source material does not define the role catalogue, permission precedence,
the conflicting-position matrix, or which roles are appointment-independent.
The authorization policy must define these before implementation. Until then,
the design must not choose a precedence algorithm or a universal active-term
uniqueness rule. It must still prevent exact duplicate and contradictory active
records using a reviewed scope identity, effective-period checks, transactions,
and tests.

The server must derive effective access from trusted records. A client-
supplied identifier must never, by itself, grant access to another
organization's records.

### 5.2 Appointments

Leadership appointments have explicit effective dates and lifecycle
states.

Expired or ended appointments remain historical records. Their
appointment-derived permissions must no longer be effective.

Ending an appointment must not automatically deactivate the User or
delete the Member.

The annual term is January 1 through December 31. The authoritative product
requirements must still decide the lifecycle treatment for mid-year creation,
early ending, renewal, and overlap. Approval and renewal require the
appropriate higher authority. The system must reject self-appointment,
self-renewal, and prohibited self-approval after resolving the actor's scope
and authority.

### 5.3 Separation of duties

Technical administration does not automatically grant financial approval
or credential-issuance authority.

Self-appointment, prohibited self-renewal, and prohibited self-approval
must be prevented by application rules and tested.

## 6. Authentication and Security Records

The proposed authentication domain includes:

- Session
- RefreshTokenUse
- PasswordResetToken
- SecurityEvent

### Session

Persistent server-side session state must support:

- Refresh credential hashes, never raw refresh credentials
- Credential rotation
- Reuse detection
- Per-session revocation
- Account-wide revocation
- Inactivity expiration
- Absolute expiration
- Session invalidation after password reset or account suspension

Approved defaults:

- Access credential lifetime: 15 minutes
- Inactivity timeout: 7 days
- Absolute session lifetime: 30 days
- Password-reset token lifetime: 30 minutes
- Password-reset tokens are single-use

Refresh credentials must not extend a session beyond its absolute expiry.

### RefreshTokenUse

`RefreshTokenUse` is the required history of individual refresh credentials
bound to a Session. It stores only a secure lookup hash or fingerprint, never
the raw credential, and records issue time, expiry, consumption state and
time, and the replacement-token relationship where needed for rotation
history.

One successful refresh is a database transaction that validates the active
session and its inactivity and absolute deadlines; consumes the current token;
creates its replacement; updates the session's current refresh state; and
writes any required SecurityEvent. Concurrent refreshes must serialize or use
an equivalent reviewed database mechanism so a token cannot rotate twice.

A presentation of a confirmed previously consumed token revokes the affected
session and records the security event in the same transaction where feasible.
A hash mismatch alone is not proof of replay, and an unknown invalid token
must not trigger account-wide revocation. A consumed token has no undocumented
grace period. If a successful replacement response is lost and no approved
recovery mechanism can recover the new credential, the client must
reauthenticate.

The SecurityEvent database row is part of the transaction whenever the
triggering state change is in PostgreSQL. If a later external notification or
export is required, a durable outbox or equivalent recovery/reconciliation
mechanism must be chosen before implementation; no such mechanism is approved
by this design. The residual risk is delivery failure after the database event
has committed, never loss of the committed security-event record itself.

### PasswordResetToken

The design must support secure storage, expiry, single use, and invalidation
after successful password reset. Raw reset tokens must not be logged.

### SecurityEvent

Relevant authentication failures, revocations, authorization failures,
and other security events must be recorded without secrets or raw tokens.

SecurityEvent may reference a User, Session, both, or neither when an identity
cannot be established. Rejected authentication attempts must remain recordable
without an active session. Retention and deletion restrictions for session,
token, reset-token, and security-event records remain blocked pending a
verified retention source.

## 7. Events and Attendance

Proposed entities:

- Event
- EventRegistration
- AttendanceRecord
- AttendanceCorrectionHistory

The model must support event scheduling, registration where applicable,
attendance recording, and traceable corrections.

An attendance correction must preserve the existing AttendanceRecord
and create a separate AttendanceCorrectionHistory entry containing the
previous value, corrected value, reason, actor, timestamp, and request
identifier where available. The attendance change, history entry, and
related audit event must be handled consistently in a database
transaction.

Corrections must be authorized and audited. The implementation must
define how duplicate scans and concurrent corrections are handled.

Event timestamps must preserve UTC consistency and the relevant event
time zone. Registration limits and event ownership require verification
against the product requirements before implementation.

## 8. Finance

Proposed entities:

- FinancialAccount
- FinancialTransaction
- FinancialApproval

Financial records must use fixed-precision decimal values and an explicitly
defined currency representation.

The model and application workflow must preserve these invariants:

1. A transaction creator or submitter cannot approve their own transaction.
2. Posted transactions cannot be deleted or overwritten to change their
   financial meaning.
3. Correcting a posted transaction requires a new linked reversal
   transaction and a mandatory reason. The original transaction remains
   unchanged.
4. A posted transaction cannot be reversed more than once unless a
   formally approved financial rule explicitly permits a different model.
5. Posting, reversal, approval, and their audit records must be handled
   consistently in database transactions.
6. Sensitive financial operations are authorized and audited.

The reversal relationship must identify the original transaction and
prevent duplicate reversal through appropriate database constraints and
transaction-level controls.

Currency rules, account ownership, transaction numbering, approval
thresholds, and the full financial lifecycle remain requirements to verify.

## 9. Credentials

Proposed entities:

- CredentialDefinition
- MemberCredential

Each credential issuance must have its own MemberCredential record.
Where applicable, the record must retain its definition, recipient,
issuance date, expiration date, issuer, and lifecycle status.

Revocation must preserve the original issuance record and record the
revocation reason, actor, and timestamp. Reissuance creates a new record;
where appropriate, it links to the prior issuance rather than replacing
or erasing it. Credential issuance, revocation, and reissuance require
authorization and audit records.

Master Guide must be represented as a credential rather than a member
category.

The exact credential catalogue, eligibility rules, and verification
workflow require review before implementation.

Blockchain anchoring and public verification remain deferred from the MVP.
Sensitive personal information must not be placed on-chain.

## 10. Audit and Idempotency

Proposed entities:

- AuditLog
- IdempotencyRecord

Audit records should capture, where applicable:

- Actor
- Action
- Resource type and identifier
- Result
- Organizational scope
- Timestamp
- Request or correlation identifier
- Reason and relevant change metadata

Audit history must be append-only through application policy and appropriate database permissions. Existing audit entries must not be edited or deleted through normal application workflows. The retention period and any exceptions remain unresolved (DDD-014: BLOCKED) and must follow an authoritative policy once located or formally approved. Indefinite retention is not an approved policy. Sensitive values, passwords, raw tokens, and authentication secrets must not be recorded.

Idempotency records should protect sensitive operations against unintended
duplicate execution. Their key scope, retention period, payload-fingerprint
rules, and response-replay behavior must be specified for each applicable
API operation. Idempotency checks and the protected mutation must be
coordinated to prevent duplicate side effects.

## 11. Reconciled Domain Inventory

The following is the complete conceptual inventory shared with `ERD.md`.
Uppercase names identify conceptual database entities. Entity names in a later
Prisma schema remain an implementation decision. `ROLE_PERMISSION` and
`REFRESH_TOKEN_USE` were added here to correct prior inventory omissions.

| Domain                | Entities                 |
| --------------------- | ----------------------------------------------------------------------------------- |
| Identity              | `USER`, `MEMBER`                 |
| Organization          | `DISTRICT`, `CHURCH`, `DEPARTMENT`, `CHURCH_DEPARTMENT`                 |
| Membership            | `CHURCH_MEMBERSHIP_HISTORY`, `DEPARTMENT_MEMBERSHIP`                 |
| Authorization         | `ROLE`, `PERMISSION`, `ROLE_PERMISSION`, `ROLE_ASSIGNMENT`, `APPOINTMENT`           |
| Authentication        | `SESSION`, `REFRESH_TOKEN_USE`, `PASSWORD_RESET_TOKEN`, `SECURITY_EVENT`            |
| Events and attendance | `EVENT`, `EVENT_REGISTRATION`, `ATTENDANCE_RECORD`, `ATTENDANCE_CORRECTION_HISTORY` |
| Finance               | `FINANCIAL_ACCOUNT`, `FINANCIAL_TRANSACTION`, `FINANCIAL_APPROVAL`                 |
| Credentials           | `CREDENTIAL_DEFINITION`, `MEMBER_CREDENTIAL`                 |
| Audit and idempotency | `AUDIT_LOG`, `IDEMPOTENCY_RECORD`                 |

### 11.1 Entity responsibility catalogue

The catalogue records conceptual ownership, not a claim that a table or field
already exists. `1` and `0..1` identify required and optional participation
from the entity being described; `0..*` means zero or more related records.
Unresolved matters stay unresolved until supported by a product source or
approved change control.

| Entity                          | Owning domain and purpose              | Key relationships and cardinality                       | Lifecycle, preservation, or unresolved decision                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `USER`                          | Identity; authenticated account and account status.              | Has `0..1` `MEMBER`; owns `0..*` sessions, reset tokens, and actor records.                       | Password hashes only; suspension invalidates sessions. Account lifecycle and retention need product policy.                                           |
| `MEMBER`                        | Membership; youth membership profile.              | Must have `1` `USER`, `1` current `CHURCH`; has `0..*` histories, departmentmemberships, assignments, appointments, registrations, attendance records, and credentials.                       | Preserve profile-linked history. Category transitions and category-history model are blocked.                                                         |
| `DISTRICT`                      | Organization; Sango District deployment boundary.              | Has `0..*` churches and departments.                       | V1 has no multi-district or conference expansion. District businesskeys and deletion policy are unresolved.                                          |
| `CHURCH`                        | Organization; district-owned church.              | Belongs to `1` district; has `0..*` members, membership histories, and church-department records.                       | Historical references must be retained. Church lifecycle and business-key policy are unresolved.                                                      |
| `DEPARTMENT`                    | Organization; district-owned youth department.              | Belongs to `1` district; has `0..*` church-department and department-membership records.                       | Department lifecycle and leadership rules are blocked.                                                                                  |
| `CHURCH_DEPARTMENT`             | Organization; a church's participation in a district department.       | Each record joins `1` church with `1` department; each parent has `0..*` records.                       | Requires participation status/effective dates if it changes. Exact uniqueness and history policy are unresolved.                                      |
| `CHURCH_MEMBERSHIP_HISTORY`     | Membership; effective-dated primary-church record.              | Belongs to `1` member and `1` church; each parent has `0..*` history records.                       | Transfer closes and opens records transactionally. Current-record constraint and transfer state model remain proposed.                                |
| `DEPARTMENT_MEMBERSHIP`         | Membership; a member's participation in a department.              | Joins `1` member with `1` department; each parent has `0..*` records.                       | Has status/effective dates/history. Active uniqueness and departmental leadership relationship are blocked.                                           |
| `ROLE`                          | Authorization; named permission grouping.              | Has `0..*` `ROLE_PERMISSION` and `ROLE_ASSIGNMENT` records.                       | Catalogue, lifecycle, and whether roles need versioning are blocked.                                                                                  |
| `PERMISSION`                    | Authorization; individually authorizable action.              | Has `0..*` `ROLE_PERMISSION` records.                       | Permission catalogue and scope semantics are blocked.                                                                                  |
| `ROLE_PERMISSION`               | Authorization; explicit role-to-permission junction.              | Belongs to `1` role and `1` permission; each parent has `0..*` records.                       | Pair uniqueness is required conceptually; change/version policy is unresolved.                                                                        |
| `ROLE_ASSIGNMENT`               | Authorization; role granted to a member in an explicit scope.          | Belongs to `1` member and `1` role; has `0..*` appointments; scope is district, church, department, or approved resource context.                       | Effective dates/status and scope identity are required. Scope encoding, duplicate/overlap rules, and appointment-independence are blocked.            |
| `APPOINTMENT`                   | Leadership; time-bounded designation governing one assignment.         | Has `1` subject member and `1` role assignment; each assignment can support `0..*` historical appointments. Creator, approver, and ending actor are distinct actor links as applicable. | Annual Jan 1–Dec 31 term, renewal as a new historical appointment, higher-authority appointment/renewal, and no self-appointment/self-renewal are approved. Mid-year creation, early termination, overlap/conflict policy, and exact actor-field representation remain open. |
| `SESSION`                       | Authentication; persistent server-side authenticated session.          | Belongs to `1` user; has `0..*` refresh-token uses and security events.                       | Enforce status, inactivity, 30-day absolute expiry, and revocation;retain per approved security policy.                                              |
| `REFRESH_TOKEN_USE`             | Authentication; hash-only history of each rotating refresh credential. | Belongs to `1` session; may reference `0..1` replacement token and one predecessor.                       | Issued, consumed, expired, and reuse-detection history are preserved. Approved retention is 12 months after expiry/consumption/revocation; exact physical linkage fields remain for schema design. |
| `PASSWORD_RESET_TOKEN`          | Authentication; single-use reset credential record.              | Belongs to `1` user.                       | Hash-only, 30-minute expiry, consumed/invalidated state; approved retention is 90 days after expiry/consumption/revocation, subject to legal holds/investigations. |
| `SECURITY_EVENT`                | Authentication/security; recordable security outcome.              | May reference `0..1` user and `0..1` session; can exist with neither.                       | Preserve without secrets. Approved retention is 24 months after occurrence, subject to legal holds/investigations. System-actor representation remains open. |
| `EVENT`                         | Events; scheduled district-scoped activity.              | Has `0..*` registrations and attendance records; may have a creating user.                       | Stores UTC-consistent schedule plus event time zone. Ownership, lifecycle, retention, capacity, and waitlists are blocked.                            |
| `EVENT_REGISTRATION`            | Events; a member's registration where registration applies.            | Belongs to `1` event and `1` member.                       | Eligibility, active uniqueness, cancellation, capacity, and waitlist policy are blocked.                                                              |
| `ATTENDANCE_RECORD`             | Attendance; member attendance at an event.              | Belongs to `1` event and `1` member; has `0..*` correction-history records.                       | Preserve record and corrections. Active uniqueness, duplicate-scan response, and concurrency mechanism are blocked.                                   |
| `ATTENDANCE_CORRECTION_HISTORY` | Attendance; immutable correction of an attendance record.              | Belongs to `1` attendance record and `1` correcting user; logically associates with an audit entry.                       | Stores before/after value, reason, actor, time, request ID. Must betransactional; retention follows audit policy.                                    |
| `FINANCIAL_ACCOUNT`             | Finance; account to which financial activity may be associated.        | Has `0..*` financial transactions; current model permits `0..1` account on atransaction pending requirements.                       | Ownership, scope, categories, lifecycle, and requiredness are blocked.                                                                                |
| `FINANCIAL_TRANSACTION`         | Finance; financial business record.              | May reference `0..1` account and `0..1` member; has `0..*` approvals; may reverse or be reversed by a transaction.                       | Decimal money; posted records immutable; reversal history preserved. Lifecycle, numbering, currency, and account requirement are blocked.             |
| `FINANCIAL_APPROVAL`            | Finance; actor decision about a transaction.              | Belongs to `1` transaction and `1` approving user.                       | Preserves actor and decision. Approval stages, thresholds, and posting relation are blocked.                                                          |
| `CREDENTIAL_DEFINITION`         | Credentials; catalogue definition.              | Has `0..*` member-credential issuances.                       | Catalogue ownership, uniqueness, eligibility, lifecycle, and issuerrules are blocked.                                                                |
| `MEMBER_CREDENTIAL`             | Credentials; individual credential issuance.              | Belongs to `1` definition and `1` member; issued/revoked by an authorized actor; may link to `0..1` prior issuance.                       | Every issuance is retained. Revocation and reissuance preserve history. Disclosure, retention, and replacement eligibility are blocked.               |
| `AUDIT_LOG`                     | Audit; append-only business or security action history.              | May reference `0..1` human user or formal system actor; targets use resourcetype plus identifier rather than a foreign key to every entity.                       | No normal update/delete. Access, system actor, metadata, and retention exceptions are blocked.                                                        |
| `IDEMPOTENCY_RECORD`            | API reliability; coordinates one protected mutation and retry result.  | Authentication scope is authenticated principal/session or pre-auth context plus operation identity; business mutation/audit linkage is logical and endpoint-specific. | Authentication policy AUTH-IDEM-001–041 is approved; response retention, tombstones, state, fingerprint, and replay rules are specified in DDD-013. Physical scope, indexes, recovery/outbox relationships remain to be modeled. Other business-domain idempotency remains unresolved. |

This inventory is provisional. Entity boundaries, names, fields, and
relationships must be reviewed before Prisma models are written.

## 12. Integrity and Lifecycle Requirements

The detailed schema design must address:

- UUID primary keys and foreign-key integrity
- Unique account-to-member association
- Exactly one current primary church per Member
- Historical church membership and transfer records
- Multiple concurrent department memberships
- Unique church participation per department where applicable
- Valid appointment periods and effective authorization
- Unique and valid session/token identifiers
- Transaction-safe financial approvals and reversals
- Credential lifecycle and revocation
- Append-only audit policy
- Indexes for common lookups and authorization scope
- Appropriate deletion restrictions and retention rules

Cross-row invariants that cannot be enforced with ordinary foreign keys or
unique constraints must be handled through carefully designed transactions,
database constraints where suitable, or explicit application workflows.

## 13. Authorization and Data Isolation

Protected access must consider:

- Authenticated User and account status
- Associated Member and active membership
- Valid appointment where required
- Role and permission
- District, church, and department scope
- Resource ownership
- Applicable business rules

Tests must verify that changing a URL, request body, or identifier does not
allow cross-church or cross-department access.

Technical administrator privileges must not implicitly grant financial
approval or credential-issuance authority.

## 14. Review Items Before Schema Implementation

The following must be resolved from the approved requirements or through
the applicable change-control process:

1. Recover or reconstruct the authoritative product requirements record
   without presenting newly inferred requirements as previously approved.
2. Specify how the mandatory Member-to-User relationship is guaranteed,
   including account provisioning and failure handling.
3. Confirm Member category transitions and whether a member can hold more
   than one category over time.
4. Specify church transfer rules, history states, transactional updates,
   and concurrent-transfer prevention.
5. Confirm district-wide department participation and department
   leadership rules.
6. Define RoleAssignment and Appointment interaction, permission scope,
   precedence, and expiry behavior.
7. Define the complete financial transaction, approval, and reversal lifecycle.
8. Define the credential catalogue, eligibility, reissuance, and revocation rules.
9. Confirm the append-only audit access policy and any formally approved
   retention requirements.
10. Specify event registration, attendance correction, duplicate scans,
    and concurrent attendance-update handling.
11. Review foreign keys, uniqueness constraints, indexes, deletion
    restrictions, and concurrency controls for every domain.
12. Verify every proposed entity and lifecycle against the frozen
    requirements and DFR-001 through DFR-006.

## 15. Implementation Gate

Do not add Prisma models or generate migrations until:

- The proposed entity relationships are reviewed.
- Required invariants and unresolved requirements are documented.
- The model is checked against DFR-001 through DFR-005 and the recorded DFR-006 lift/change history.
- Any conflict with the frozen design is resolved through the approved
  change-control process.
- The data-model document is reviewed and its status is explicitly updated.

After approval, implementation should proceed in small, testable increments
with Prisma validation, migration review, automated tests, and verified
Git commits.

## 16. Current approved decision reconciliation — 2026-10-30

This section is the current policy overlay for the restored domain model. Where earlier sections describe a now-resolved question as proposed or blocked, this section takes precedence for the policy only. It does not approve physical schema details.

### 16.1 Identity

Every Member has exactly one User account, and each User is associated with at most one Member. This one-to-one cardinality is approved under MEM-02. The exact database mechanism for mandatory participation and atomic provisioning remains a schema-design item.

### 16.2 Ministry category and affiliation distinction

DYMS top-level member categories are Adventurer (4–9), Pathfinder (10–15), and Senior Youth (16–30+). Ambassador and Young Adult are affiliations within Senior Youth. A 21-year-old may hold both affiliations concurrently, subject to local ministry approval. Public Campus Ministry is an additional affiliation based on campus context. Master Guide is a training/credential pathway and is not a top-level age category. Category transition/history details not expressly decided remain open.

### 16.3 Primary church membership

Each Member has one current primary church membership. A transfer closes the previous membership and opens the new primary membership atomically. Historical membership records are preserved. The precise database concurrency mechanism remains for schema design.

### 16.4 Leadership appointments

Leadership appointment terms run from January 1 through December 31. Renewal creates a new historical appointment record rather than overwriting the prior appointment. The designated higher authority controls appointment and renewal. Self-appointment and self-renewal are prohibited. Expiry ends appointment-derived authority without deactivating the User or deleting the Member. Role catalogue, permission precedence, and conflicting-position policy remain open under DDD-005.

### 16.5 Authentication idempotency and retention

Authentication mutation idempotency is governed by DDD-013-AUTHENTICATION-IDEMPOTENCY-SPECIFICATION.md and its consistency review. AUTH-IDEM-001–041 are consolidated there. CR-01 through CR-06 are approved policy/contract decisions. The authentication domain is not yet ERD-ready because its approved scope, indexes, pre-auth context, reset-delivery secret boundary, key-version metadata, tombstone/recovery relationships, transaction boundaries, and replay behavior still require physical modeling and validation. Authentication retention is approved as follows: Session records 12 months after expiry/revocation; refresh-token history 12 months after expiry/consumption/revocation; password-reset records 90 days after expiry/consumption/revocation; SecurityEvent records 24 months after occurrence. Legal holds and active security investigations suspend deletion. Cleanup must be audited and retry-safe. Backup retention is separate. Retention for other business records remains unresolved.

### 16.6 Current implementation boundary

DFR-006 was lifted on 2026-10-29 and implementation was authorized. This does not authorize Prisma models or migrations before formal approval of the corrected ERD. No physical schema or migration is approved by this document.

### 16.7 DDD-013 authentication persistence boundary

The approved authentication idempotency contract requires conceptual persistence for operation scope, request fingerprint, HMAC key version, operation state, processing lease, BIGINT fencing counter, safe terminal result metadata, retention timestamps, tombstones, and recovery outcomes. Authenticated and pre-authenticated scopes must remain distinguishable and enforceably unique.

Password-reset delivery requires an outbox reference and a protected short-lived secret-storage boundary. Queue messages must carry opaque references rather than reset secrets. The exact division into tables/entities, foreign keys, partial indexes, and secret-store integration is not approved by this domain model. It must be specified in the authentication ERD slice and reviewed against DDD-013-CONSISTENCY-REVIEW.md §§5 and 9.

CR-01 through CR-06 are approved. The remaining gate is physical modeling and verification, not policy approval. Session ownership remains independent of User–Member cardinality.
