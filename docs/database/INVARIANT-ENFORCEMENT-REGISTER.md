# **DYMS Invariant Enforcement Register**

> **Restoration and current-decision note (2026-10-30):** This document is restored from the latest recoverable project snapshot located in the user's saved files. Its original content is retained as the design baseline, with the status corrections below taking precedence wherever older text conflicts. This restoration is not ERD approval and does not authorize Prisma models or migrations.
>
> Current policy resolutions: IM-01 and IM-02 now reflect approved one-to-one User–Member cardinality; IM-03 through IM-05 reflect one current primary church and atomic, history-preserving transfers; appointment invariants reflect annual historical appointments and higher-authority renewal with no self-renewal. Exact database constraints and concurrency mechanisms remain proposed until schema design. DDD-002 age-21 overlap is an affiliation rule, not a new exclusive member category.

## **1. Purpose and status**

This register turns the critical rules in the ERD into explicit design,

transaction, application, and test obligations. It is conceptual: no listed

constraint, transaction, permission, or test is implemented merely because it

appears here.

- **Status:** Draft enforcement plan; database design remains **NOT READY** pending resolution of blocked decisions and final ERD approval.

- **Scope:** DYMS v1.0, Sango District

- **Companion records:** [ERD](ERD.md), [Database Domain Model](DATA-MODEL.md),

  [Requirements Traceability](REQUIREMENTS-TRACEABILITY.md)

### **1.1 Status meanings**

- **Verified:** the rule and a suitable enforcement layer are supported by an

  approved source. Implementation and testing remain future work.

- **Proposed:** the rule is supported, but the exact schema or concurrency

  technique needs approval during schema design.

- **Blocked:** a product rule, permission policy, or lifecycle choice is

  missing; no implementation technique may silently decide it.

## **2. Invariant register**

| ID | Domain and rule | Required database integrity mechanism | Required transaction boundary | Application enforcement | Concurrency risk | Required automated verification | Source | Status |

|---|---|---|---|---|---|---|---|---|

| IM-01 | Identity: every `MEMBER` has exactly one `USER`. | Required member-to-user reference; unique reference; deferred constraint or creation workflow must ensure mandatory participation. | Create account and member atomically; roll back both on failure. | Do not expose a member as active until association exists. | Partial provisioning or racing account creation. | Failed provision leaves neither partial active member nor duplicate association. | ERD §3.1; DATA-MODEL §4.2. | Proposed |

| IM-02 | Identity: a `USER` has at most one `MEMBER`. | Unique user reference from member. | Same provisioning transaction as IM-01. | Reject reassignment unless an approved lifecycle permits it. | Concurrent member creation for one user. | Parallel create attempts yield one association only. | ERD §3.1; DATA-MODEL §4.2. | Proposed |

| IM-03 | Membership: every member has one current primary church. | Required `MEMBER` current-church foreign key; history-current constraint design is proposed. | Included with all transfer history changes. | Validate church belongs to Sango District. | Two conflicting transfers. | Create/update rejects null or invalid current church. | ERD §3.2; DATA-MODEL §4.3. | Proposed |

| IM-04 | Membership: transfer preserves prior history and opens new history. | Effective-date and status integrity for `CHURCH_MEMBERSHIP_HISTORY`; exact partial uniqueness/check rule is pending. | Update current church, close prior record, open new record, and audit together.| Validate dates and authorized scope. | Crash or retry between close/open steps. | Rollbackand retry leave one coherent before/after history. | ERD §3.2; DFR-003. | Proposed |

| IM-05 | Membership: concurrent transfers cannot create contradictory current memberships. | Row lock, serializable operation, exclusion/partial-unique constraint, or other reviewed mechanism. | Entire transfer workflow. | Surface a defined conflict/retry result. | Simultaneous transfer requests. | Parallel transfers never create two current histories. | ERD §3.2; DFR-003; DDD-003. | Proposed |

| DP-01 | Departments: church participation and member participation are separate concepts. | Separate `CHURCH_DEPARTMENT` and `DEPARTMENT_MEMBERSHIP` foreign-key junctions. | Each relationship lifecycle is independent. | Do not infer one from the other. | Accidental coupling in bulk updates. | Member can participate where primary church does not; changes remain independent. | ERD §3.3; DATA-MODEL §4.4. | Verified |

| DP-02 | Departments: member participation uniqueness and lifecycle are explicit. | Reviewed member/department/effective-period uniqueness and status rule. | Status/date changes with audit where sensitive. | Enforce eligibility once product policy exists. | Duplicate active membership under concurrent joins. | Parallel join and lifecycle transition tests. | ERD §§3.3,11.2; DATA-MODEL §11.1; DDD-006. | Blocked |

| DP-03 | Departments: departmental membership does not itself grant leadership authority. |No implicit authorization relation from membership. | Not applicable beyond related assignment workflow. | Require role, scope, and appointment where required. | UI or service treats membership as role. | Department membership alone cannot call leadership-protected endpoint. | ERD §3.3; Security §6. | Verified |

| DP-04 | Departments: the District Departmental Coordinator role is scoped to its assigned department; other departmental leadership eligibility and authority must be explicit. | Assignment scope is department-specific; no implicit grant from department membership. | Appointment and role assignment follow the approved scope and higher-authority rules. | Require a valid role assignment, required appointment, and permission for the target department. | Participation or a client-supplied department ID is treated as leadership authority. | Cross-department negative tests deny access without the correct assignment, appointment, permission, and resource scope. | DDD-005 approval 2026-10-31; ERD §4; Traceability RT-029. | Partially approved; other departmental leadership policy remains blocked |

| LA-01 | Authorization: appointment-dependent permission ends at appointment expiry/end without deactivating account. | Date/state fields and assignment link; index for evaluation. | Appointment status change and audit together. | Server derives access using current time, state, scope, account, and membership. | Stale authorization cache or midnight expiry race. | Expired appointment loses protected access; account remains usable for unrelated allowed actions. | DFR-004; Security §6; ERD §4.5. | Verified |

| LA-02 | Authorization: subject, creator, approver, and ending actor are distinguishable. |Required subject/assignment references; actor references or immutable lifecycle/audit representation. | Create/approve/renew/end action and audit together. | Check actor identity and scope. | Actor fields overwritten or ambiguous. | Audit/report correctly distinguishes all actors. | ERD §4.2.1; DATA-MODEL §5. | Proposed |

| LA-03 | Authorization: no self-appointment, self-renewal, or prohibited self-approval. | Database cannot generally infer all authority; preserve actor and subject identifiers for comparison. | Authority check and lifecycle change in one transaction. | Server compares actor/subject, evaluates higher-authority scope, and rejects prohibited actions. | Subject or authority changes during action. | Negative tests for every self-action and cross-scope approver. | Security §6; user-approved domain baseline; ERD §4.6. | Verified |

| LA-04 | Authorization: each protected request enforces organizational scope. | Scope foreign keys and indexes where relational; no client identifier is authority. | Protect multi-record mutations with scope check and mutation. | Server derives scope from trusted identity/assignment/resource. | IDOR and stale scope state. | Cross-church/cross-department URL and body substitution tests. | DFR-002; Security §6; Architecture §8. | Verified |

| LA-05 | Authorization: historical appointments remain available but grant no current authority. | Non-destructive status/end-date history; deletion restriction. | End/renew records and audit consistent. | Filter effective authority by valid state/date. | Reused historical ID or bad query excludes history. | Historical reporting returns ended record; access check denies its authority. | DFR-003, DFR-004; ERD §§4.3–4.5. | Verified |

| LA-06 | Authorization: valid assignments combine permissions additively; explicit deny overrides allow; scope is enforced and no role title has automatic seniority precedence. | Stable assignment/resource scope identity; explicit-deny representation and duplicate/overlap constraints remain technical design items. | Resolve grants, denies, assignment validity, appointment state, scope, and resource access consistently for each request. | Apply approved additive/deny/scope policy; reject or review duplicate, contradictory, or specifically prohibited role combinations. | Cross-scope IDOR, conflicting grants/denies, concurrent assignment changes, expired appointment, or ambiguous overlapping roles. | Matrix tests prove additive grants, deny-overrides-allow, scope boundaries, expiry, and rejection/review of unresolved combinations. | DDD-005 approval 2026-10-31; DDD-004; ERD §§4.2.2–4.5; Traceability RT-029. | Policy approved; specific role-conflict matrix and technical enforcement remain open |

| AU-01 | Authentication: refresh rotation is atomic. | Unique hash lookup/current-token integrity; consumed state; replacement linkage; appropriate locks or isolation. | Validate session, consume old token, create replacement, update session, write event in one database transaction. | Coordinate browser refresh requests. | Two successful rotations of same credential. | Parallel refresh has exactly one success and one defined failure. | DFR-004; Security §5; ERD §5.4. | Verified |

| AU-02 | Authentication: consumed refresh token is never silently reusable. | Persist consumption state and lookup history; no reuse-grace constraint. | Reuse decision and affected session update/event together. | Reject consumed token; client reauthenticates if response is lost and no recovery exists. | Lost response tempts retry with consumed token. | Consumed tokenretry cannot rotate again. | ERD §5.4; remediation baseline. | Verified |

| AU-03 | Authentication: confirmed reuse revokes affected session and records a security event; unknown token/hash mismatch does not cause account-wide revocation. | Lookup distinguishes consumed recognized token from unknown invalid token. | Revoke affected session and write event in one transaction where PostgreSQL state is involved. | Do not infer replay from mismatch alone. | Hash collision/lookup ambiguity or racing reuse. | Confirmed reuse revokes one affected session; unrelated invalid token does not revoke all sessions. | DFR-001, DFR-004; ERD §5.4. | Verified |

| AU-04 | Authentication: session inactivity, absolute expiry, suspension, and revocation are consistently enforced. | Session status, last activity, absolute expiry, revocation metadata and indexes. | Reset/suspension plus session invalidation transaction. | Validate session and account state on protected requests and refresh. | Request races expiry/revocation. | Boundary-time, logout-all, password-reset, and suspension tests. | DFR-004; Security §§3–5. | Verified |

| AU-05 | Authentication: reset tokens are hash-only, 30-minute, and single-use. | Unique secure token lookup; consumed/expiry state. | Token consumption, password change, and session invalidation together. | Rate limit and return safe errors. | Parallel reset submissions. | Expired/reused token fails; concurrent use permits one reset only. | DFR-001, DFR-004; Security§3. | Verified |

| AU-06 | Authentication: security-event row survives required state changes without secrets. | Optional user/session references; secret-free payload schema. | State mutation and database event row in same transaction; later external delivery needs approved durable recovery. | Record rejected events without valid identity/session. | Event write failure or external notification failure. | Transaction rollback behavior and secret-redaction tests. | DFR-001; Security §11; DATA-MODEL §6. | Proposed |

| AT-01 | Attendance: duplicate scans have deterministic behavior. | Approved active uniqueness/idempotency mechanism for event/member/scan scope. | Scan result, any record, audit, and idempotency state coordinated. | Return approved original/conflict result. | Concurrent scans/retries. | Same scan retries and parallel scans follow specified result. | ERD §§6.3–6.5; Traceability B-005; DDD-008. | Blocked |

| AT-02 | Attendance: corrections preserve original values and correction history. | `ATTENDANCE_CORRECTION_HISTORY` is insert-only with required before/after, reason, actor, time. | Attendance update, history insert, audit insert in one transaction. | Authorize correction by event/scope. | Direct overwrite or history omission. | Correction retains prior value and immutable history. | User-approved domain baseline; ERD §6.4. | Verified |

| AT-03 | Attendance: correction and audit records remain consistent. | Required correction/audit association or correlated identifiers. | Correction, history, audit are atomic. | Do not expose success after rollback. | One insert succeeds while another fails. | Forced error leaves no partial correction or false audit success. | ERD §6.4; DFR-003. | Verified |

| AT-04 | Attendance: concurrent corrections do not silently overwrite newer values. | Version/expected-value locking or other approved optimistic/pessimistic control. | Read-check-write plus history/audit transaction. | Return defined conflict and require reload/retry. | Two authorized corrections based on same value. | Parallel correction produces one success and oneconflict. | ERD §6.5; Traceability B-005; DDD-008. | Blocked |

| FN-01 | Finance: submitter cannot approve own transaction. | Persist submitter and approver identities. | Approval decision, financial state, and audit in one transaction. | Server compares actor to creator/submitter and checks approved authority. | Submitter identity changedor concurrent approval. | Creator/submitting actor self-approval is rejected. | DFR-002; Security §10; ERD §7.3. | Verified |

| FN-02 | Finance: posted transactions are not edited or deleted through normal operations. | Lifecycle state, deletion restriction, and database/application permissions. | Posting and audit together; correction is a separate reversal workflow. | Reject normal update/delete of posted meaning. | Concurrent post/edit/delete. | Posted update/delete is denied; original remains reportable. | Security §10; user-approved domain baseline; ERD §7.2. | Verified |

| FN-03 | Finance: reversal preserves original and has a reason. | Self-reference to original; mandatory reason on reversal; state checks. | Reversal, state effects, and audit in one transaction. | Authorize reverse action and validate original eligibility. | Reversal without valid original/reason. | Reversal leaves original unchanged and retains reason/link. | User-approved domain baseline; ERD §7.4. | Verified |

| FN-04 | Finance: one original transaction has no duplicate reversal unless future approvedpolicy says otherwise. | Unique original-reversal relation or equivalent lock/constraint, conditional on lifecycle design. | Check/create reversal and audit atomically. | Return conflict for duplicate action. | Parallel reversal requests. | Parallel reversal attempts produce atmost one committed reversal. | User-approved domain baseline; ERD §7.4. | Proposed |

| FN-05 | Finance: approval preserves responsible actor and decision. | Required approval transaction/user references and decision/time fields. | Approval plus relevant financial state/audit transaction. | Validate authority, scope, and threshold/stage when policy exists. | Competing/duplicate approvals. | Approval report identifies actor and decision; unauthorized approval fails. | ERD §7.3; Security §10. | Verified |

| CR-01 | Credentials: issuance and revocation preserve history. | Separate issuance records; revocation state/reason/actor/time; deletion restrictions. | Issue/revoke and audit in one transaction. | Validate issuer authority and scope once policy exists. | Revocation races verification/reissue. | Issued record remains after revoke with actor/time/reason. | User-approved domain baseline; ERD §§8.2–8.4. | Verified |

| CR-02 | Credentials: reissuance creates a new linked issuance. | New `MEMBER_CREDENTIAL` record with optional prior-issuance relation. | Reissue, linkage, and audit in one transaction. | Validate approved reissue eligibility. | Repeated reissue requests. | Reissue does not modify original and preserves linkage. | User-approved domain baseline; ERD §8.5. | Verified |

| CR-03 | Credentials: catalogue, eligibility, and issuer authority are enforced only after verification. | Catalogue business-key/ownership and scope relations to be approved. | Issuance workflow transaction. | Server evaluates approved eligibility/authority. | Ineligible or cross-scope issue. | Eligibility/authority matrix tests after policy approval. | ERD §§8.2–8.3; Traceability B-007; DDD-011. | Blocked |

| AD-01 | Audit: normal operations cannot silently alter or delete audit history. | Insert-only database permissions/controls; no normal update/delete path. | Required audit row commitswith business action. | Restrict audit administrative access. | Privileged normal account modifies history. | Update/delete denied; authorized read access tested. | Security §11; ERD §9.3. | Verified |

| AD-02 | Audit: entries record actor, action, resource, outcome, scope, time, and request context as applicable. | Required fields/nullability where context is known; resource type/ID target representation. | Record required audit with protected operation. | Distinguish actor from target and support formal system actor. | Missing context on failure path. | Sensitive workflows produce complete contextual audit record. | Security §11; ERD §9.2. | Proposed |

| AD-07 | Audit access: authorised read access is role-based; sensitive access is logged; Audit Viewer cannot modify records or manage permissions; Audit Administrator manages access and reviews access activity but cannot alter historical records. Only the single System Administrator appoints/revokes Audit Administrators. | Distinct permission grants and immutable actor/action/time/scope access records; exact record scopes and masking remain to be specified. | Access decision and access-log record coordinated; appointment/revocation and audit trail committed together. | Enforce least privilege; deny self/peer appointment by Audit Administrators; one System Administrator is sufficient. | Privilege escalation, unlogged read, self-appointment, or audit-record tampering. | Positive/negative scope tests, access-log completeness, denied-attempt logging where feasible, appointment authority tests, and update/delete denial. | DDD-012 approved decisions; PR #4, #5, #6, #8, #9; ERD §9.3. | Policy approved; exact scope/enforcement Proposed |\n\n| AD-03 | Audit: secrets never enter audit records. | Restricted metadata schema/redaction; no raw credential/token fields. | Apply redaction before audit write. | Code review and safe logging/audit helpers. | Exception payload or before/after value leaks secret. | Secret-injection/redaction tests and log audit. | DFR-001; Security §11; ERD §9.3. | Verified |
| AD-06 | Audit-log and non-authentication business-record retention follow a record-class-specific approved policy; indefinite retention is not assumed. | Retention/deletion controls remain unspecified for audit logs and non-authentication records until separately approved. Authentication SECURITY_EVENT retention is 24 months under DDD-014. | Any disposition workflow follows its approved policy and is auditable; legal holds suspend deletion where approved. | Do not apply authentication retention periods to AUDIT_LOG or other business records. | Unapproved indefinite retention, premature deletion, or cross-class retention leakage. | Verify record-class policy before implementation; distinguish AUDIT_LOG from SECURITY_EVENT. | DDD-014; ERD §9.3; Decision Register DDD-014. | Blocked for audit logs and other business records |

| AD-04 | Non-authentication idempotency: protected business mutation and idempotency state remain coordinated. | Scoped key uniqueness, request fingerprint, state/result storage design. | Idempotency acquisition, mutation, and required audit/event state in one recoverable transaction. | Define per-domain replay and recovery policy before use. | Same key concurrently or response lost after commit. | Same-key retry never duplicates a committed protected business effect. | DFR-002; ERD §§9.4–9.6; DDD-013. | Blocked for non-authentication domains; authentication contract is approved under AUTH-IDEM-001–041. |

| AD-05 | Non-authentication idempotency: concurrent duplicates cannot create duplicate protected effects. | Unique scoped key plus locking/isolation or comparable mechanism. | Entire protected operation. | Enforce approved payload-mismatch and retry policy for the relevant domain. | Concurrent requests with equivalent/different payload. | Parallel same-key and mismatch tests. | DFR-002; ERD §9.5; DDD-013. | Blocked for non-authentication domains; authentication contract is approved under AUTH-IDEM-001–041. |

## **3. Readiness rule**

Rows marked **Blocked** identify questions that must be answered from

authoritative requirements or an approved decision before their affected

schema or workflow is designed. Rows marked **Proposed** require review of the

concrete constraint or transaction mechanism during approved schema design.

A status in this register does not indicate that a control is implemented or

tested today.
## 4. Approved policy updates — 2026-10-30

The following policy rules are approved. The concrete database constraints and concurrency mechanisms remain proposed until the ERD is approved and physical schema design is authorized.

| Invariant IDs | Approved policy | Enforcement and verification obligation | Status |
|---|---|---|---|
| IM-01, IM-02 | One-to-one User–Member: every Member has exactly one User; each User has at most one Member. | Required and unique relationship; account/member provisioning must be atomic. Test duplicate association and rollback. | Policy approved; exact database mechanism proposed. |
| IM-03 | Each Member has one current primary church. | Required current membership; validate district scope. Test null/invalid church rejection. | Policy approved; exact database mechanism proposed. |
| IM-04, IM-05 | Transfer closes prior church membership and opens the new primary membership atomically; prior history is preserved; concurrent transfers must not create contradictory current memberships. | One transaction for current church, history close/open, and audit. Choose lock/constraint strategy during schema design. Test rollback, retry, and concurrent transfer. | Policy approved; technical enforcement proposed. |
| CAT-01 | Top-level categories are Adventurer, Pathfinder, Senior Youth. Ambassador/Young Adult are Senior Youth affiliations; age 21 permits both with local approval. Public Campus Ministry is additional affiliation; Master Guide is a credential/training pathway. | Model category, affiliation, and credential as distinct concepts. Do not encode age-21 mutual exclusion. Test local-approval gate. | Classification approved; remaining category history/transition details open. |
| LA-01, LA-02, LA-03, LA-05 | Annual appointment Jan 1–Dec 31; renewal is a new historical appointment; higher authority appoints/renews; no self-appointment or self-renewal; expiry removes appointment-derived authority without deactivating the account. | Preserve subject, creator, approver, and ending actor; evaluate authority using appointment validity, date, scope, and actor. Test expiry and prohibited self-actions. | Policy approved; exact lifecycle state model and role precedence remain partly open. |
| AU-IDEM-01 | Authentication state-changing operations follow AUTH-IDEM-001–041. | Coordinate idempotency acquisition, protected mutation, audit/outbox requirements, and replay/recovery contract. See DDD-013 specification and consistency review. | Policy and CR-01 through CR-06 approved; ERD slice remains not ready pending physical modeling and verification. |
| AU-RET-01 | Authentication retention periods: session 12 months; refresh history 12 months; password-reset records 90 days; security events 24 months. Legal holds/investigations suspend deletion. | Audited, retry-safe cleanup; backup retention separate. Test retention cutoff, holds, and retry. | Authentication retention approved; other domain retention remains blocked. |

A policy approval does not mean the corresponding constraint, transaction, application logic, or test has been implemented. Do not mark an implementation control as complete until it is built and verified.
