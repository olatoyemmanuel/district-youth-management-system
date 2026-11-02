# DYMS Phase 3 — API Contract Design

- Revision: API-01
- Date: 2026-11-02
- Scope: DYMS v1.0, Sango District
- Status: **COMPLETE API CATALOGUE PROPOSAL; REQUEST/RESPONSE SCHEMAS REQUIRE CONTRACT REVIEW**
- Governing decisions: DFR-002, DFR-001, DFR-004, approved DDD decisions, 107-ID testable requirements
- Implementation: **NOT AUTHORIZED**

## 1. Purpose

This document defines the proposed REST API surface, endpoint ownership, authorization expectations, request conventions, response envelopes, pagination, idempotency boundaries and error catalogue.

It is a complete endpoint catalogue proposal for the current v1 domain scope, not an approved OpenAPI file or implementation specification. Endpoint names, field-level schemas, enum values and status transitions must be reconciled with the final physical ERD and authority-approved lifecycle catalogues.

## 2. Global contract

- Base path: `/api/v1`.
- Transport: HTTPS, same-origin production deployment.
- Media type: `application/json`, except explicitly documented binary export retrieval.
- Resource identifiers: UUIDs.
- Timestamps: RFC 3339 UTC timestamps; event-local timezone is retained as domain data.
- Monetary values: decimal strings with currency code; never binary floating-point.
- Authentication: server-side session with Secure HttpOnly cookies.
- CSRF: required for cookie-authenticated state-changing requests, with origin validation.
- Authorization: server-side, deny-by-default, resource ownership and scope checked on every protected operation.
- Rate limiting: mandatory for public and authenticated routes.
- Sensitive mutation idempotency: only where the operation has an approved idempotency contract. Authentication idempotency follows AUTH-IDEM-001–041; business idempotency is not implied.
- OpenAPI: every implemented route must have request, response, authorization, error and rate-limit documentation.
- No endpoint returns password hashes, cookies, raw tokens, HMAC material, provider secrets, internal database details or unrestricted audit payloads.

## 3. Standard response envelopes

### 3.1 Success

Proposed success envelope:

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-11-02T12:00:00Z"
  }
}
```

For collection responses, `data` contains an array and `meta.pagination` contains the cursor/page information. For asynchronous operations, `data` contains the job/resource reference and an explicit processing state.

### 3.2 Error

Proposed error envelope:

```json
{
  "error": {
    "code": "STABLE_MACHINE_CODE",
    "message": "Safe user-facing explanation",
    "details": [],
    "requestId": "uuid"
  }
}
```

Validation details may identify safe field names and validation codes. They must not contain SQL, stack traces, secrets, internal paths or sensitive record contents.

## 4. HTTP and resource conventions

| Method | Meaning | Rule |
|---|---|---|
| GET | Read a resource/collection | No state mutation |
| POST | Create resource or execute named command | Command semantics and idempotency explicitly documented |
| PATCH | Update allowed mutable fields | No silent lifecycle transition; use named command where approval/history applies |
| DELETE | Remove a resource | Not available for posted financial/audit/history records; retention workflow is separate |

Prefer named command endpoints for approval, rejection, posting, reversal, transfer, correction, revocation and other auditable transitions. Do not expose generic status patching.

Use cursor pagination for high-volume audit, attendance and history. Use bounded page pagination for small controlled catalogues. All list endpoints must cap page size and apply server-side scope filtering before pagination.

## 5. Authentication and account endpoints

Base: `/auth`

| Method and path | Purpose | Access | Key controls |
|---|---|---|---|
| POST `/auth/login` | Authenticate account | Public | Argon2id verification, generic failure, rate limit |
| POST `/auth/refresh` | Rotate refresh credential | Session cookie | CSRF/origin, atomic rotation, reuse detection |
| POST `/auth/logout` | Revoke current session | Authenticated session | CSRF, audit |
| POST `/auth/logout-all` | Revoke all account sessions | Authenticated account | CSRF, audit |
| GET `/auth/me` | Current account/member/session bootstrap | Authenticated | Minimum necessary profile |
| GET `/auth/sessions` | List current account sessions | Authenticated | Own account only |
| DELETE `/auth/sessions/{sessionId}` | Revoke one session | Authenticated | Own account; CSRF |
| POST `/auth/password-reset-requests` | Request reset | Public | Uniform response, 30-minute token, rate limit |
| POST `/auth/password-resets` | Complete reset | Reset token | Single use, expiry, revoke sessions |
| POST `/auth/password-change` | Change current password | Authenticated | Current credential check, revoke/rotate policy |
| GET `/auth/csrf` | Obtain synchronizer CSRF token | Cookie/session context | Session-bound; no sensitive disclosure |

No guardian, shared-account or delegated child-login endpoints are permitted.

## 6. Member and membership endpoints

Base: `/members`, `/membership`

| Method and path | Purpose | Access |
|---|---|---|
| POST `/members` | Create member and linked individual account through controlled provisioning | Authorized membership administrator |
| GET `/members` | List members in authorized scope | Membership read permission |
| GET `/members/{memberId}` | Read member | Member/self or scoped membership permission |
| PATCH `/members/{memberId}` | Update allowed profile fields | Member/self or scoped administrator |
| GET `/members/{memberId}/category-history` | Read category history | Scoped membership permission |
| POST `/members/{memberId}/category-assignments` | Submit category decision/assignment | Authorized category administrator |
| POST `/members/{memberId}/category-assignments/{assignmentId}/end` | End assignment with reason | Authorized category administrator |
| GET `/members/{memberId}/church-memberships` | Read membership history | Member/self or scoped authority |
| POST `/church-transfers` | Member initiates transfer | Authenticated member |
| GET `/church-transfers` | List transfer requests in scope | Authorized membership authority |
| GET `/church-transfers/{transferId}` | Read transfer | Requester or authorized scope |
| POST `/church-transfers/{transferId}/receiving-decision` | Record receiving-church acceptance decision | Receiving church authority |
| POST `/church-transfers/{transferId}/district-decision` | Record district final decision | District authority |
| POST `/church-transfers/{transferId}/complete` | Complete approved transfer on approved date | Authorized workflow/service actor |

Withdrawal, rejection, cancellation, appeal and backdating endpoints are intentionally omitted until ODR-002 policy is approved. Exact category eligibility and lifecycle endpoints remain dependent on ODR-001.

## 7. Organization endpoints

Base: `/district`, `/churches`, `/departments`

| Method and path | Purpose | Access |
|---|---|---|
| GET `/district` | Read district profile | Authorized district user |
| GET `/churches` | List local churches | Authenticated users subject to visibility policy |
| POST `/churches` | Create church | District organization administrator |
| GET `/churches/{churchId}` | Read church | Authorized scope |
| PATCH `/churches/{churchId}` | Update allowed church data | District authority |
| GET `/departments` | List district departments | Authenticated users subject to visibility policy |
| POST `/departments` | Create department | District organization authority |
| GET `/departments/{departmentId}` | Read department | Authorized scope |
| PATCH `/departments/{departmentId}` | Update permitted catalogue fields | District authority |

ODR-004 owner-approved default: departments are district-owned; events have one district or local-church owner; departments may organize but do not own events. Delegated governance confirmation remains pending.

## 8. Leadership and access administration endpoints

Base: `/positions`, `/appointments`, `/access`

| Method and path | Purpose | Access |
|---|---|---|
| GET `/positions` | List position catalogue | Authorized organization/leadership read |
| POST `/positions` | Create position | Designated district authority |
| GET `/positions/{positionId}` | Read position | Authorized scope |
| POST `/appointments` | Submit appointment | Authorized requester |
| GET `/appointments` | List appointments | Authorized scope |
| GET `/appointments/{appointmentId}` | Read appointment | Authorized scope/subject |
| POST `/appointments/{appointmentId}/approve` | Approve appointment | Higher authority, never self |
| POST `/appointments/{appointmentId}/reject` | Reject appointment | Higher authority |
| POST `/appointments/{appointmentId}/terminate` | Terminate with reason | Designated authority, subject to approved lifecycle |
| POST `/appointments/{appointmentId}/renew` | Submit fresh renewal | Authorized requester; fresh approval required |
| GET `/access/roles` | Read controlled role catalogue | Security administrator |
| GET `/access/permissions` | Read permission catalogue | Security administrator |
| POST `/access/grants` | Request independent operational grant | Authorized grantor, no self-grant |
| POST `/access/grants/{grantId}/approve` | Approve grant | Independent authorized approver |
| POST `/access/denies` | Issue explicit deny | Authorized independent authority |
| POST `/access/denies/{denyId}/review` | Review deny | Authorized reviewer, affected actor excluded |
| POST `/access/denies/{denyId}/revoke` | Revoke deny | Authorized independent authority |

Acting appointments and exceptional overlap are not exposed. The complete role, permission and role-conflict catalogue remains subject to security/governance approval.

## 9. Department membership endpoints

Base: `/department-memberships`

| Method and path | Purpose | Access |
|---|---|---|
| POST `/department-memberships` | Member requests membership | Authenticated member |
| GET `/department-memberships` | List in authorized scope | Member/self or department coordinator |
| GET `/department-memberships/{membershipId}` | Read membership | Member/self or authorized scope |
| POST `/department-memberships/{membershipId}/approve` | Coordinator approval | Designated coordinator |
| POST `/department-memberships/{membershipId}/withdraw` | Member withdrawal | Member/self |
| POST `/department-memberships/{membershipId}/terminate` | Reasoned termination | Authorized coordinator |

Rejection/appeal, annual renewal, eligibility exceptions and church-transfer effects are not exposed as settled workflows pending ODR-007 authority confirmation.

## 10. Events, sessions and registration endpoints

Base: `/events`

| Method and path | Purpose | Access |
|---|---|---|
| POST `/events` | Create event draft | Authorized event coordinator |
| GET `/events` | List visible events | Authenticated, scope-filtered |
| GET `/events/{eventId}` | Read event | Authenticated, scope-filtered |
| PATCH `/events/{eventId}` | Update permitted draft fields | Event owner/coordinator |
| POST `/events/{eventId}/submit-approval` | Submit event for approval | Event coordinator |
| POST `/events/{eventId}/approve` | Approve event | Designated owner-scope authority |
| POST `/events/{eventId}/publish` | Publish approved event | Authorized event coordinator |
| POST `/events/{eventId}/changes` | Request material event change | Authorized coordinator |
| POST `/events/{eventId}/changes/{changeId}/approve` | Approve material change | Designated event authority |
| POST `/events/{eventId}/cancel` | Cancel with reason | Designated event authority |
| POST `/events/{eventId}/sessions` | Add session to draft/approved event | Event coordinator under lifecycle rules |
| PATCH `/events/{eventId}/sessions/{sessionId}` | Update permitted session data | Event coordinator under lifecycle rules |
| POST `/events/{eventId}/registrations` | Register member | Authenticated member or authorized operator |
| GET `/events/{eventId}/registrations` | List registrations | Event coordinator |
| POST `/events/{eventId}/registrations/{registrationId}/confirm` | Confirm registration | Authorized event workflow |
| POST `/events/{eventId}/registrations/{registrationId}/cancel` | Cancel registration | Member/self or authorized coordinator |

Waitlist endpoints are excluded. Late registration reopening and capacity overrides require explicit event-authority approval. ODR-008 defaults govern capacity behavior.

## 11. Attendance endpoints

Base: `/attendance`

| Method and path | Purpose | Access |
|---|---|---|
| POST `/attendance/subjects` | Initialize event attendance subject and selected mode | Authorized event/attendance coordinator |
| GET `/attendance/events/{eventId}` | Read event attendance | Authorized event scope |
| GET `/attendance/sessions/{sessionId}` | Read session attendance | Authorized event scope |
| POST `/attendance/records` | Record attendance | Authorized attendance personnel |
| GET `/attendance/records` | Search attendance | Authorized scope |
| GET `/attendance/records/{recordId}` | Read attendance fact | Authorized scope |
| POST `/attendance/records/{recordId}/corrections` | Request correction | Authorized event personnel |
| POST `/attendance/corrections/{correctionId}/approve` | Approve correction | Designated independent authority |
| POST `/attendance/corrections/{correctionId}/apply` | Apply approved correction | Authorized workflow actor |

The subject mode is EVENT or SESSION and cannot be mixed after the first attendance record. Self-check-in and offline capture are excluded pending authority confirmation. A documented registration exception must include actor, reason and approval evidence.

## 12. Finance endpoints

Base: `/finance`

| Method and path | Purpose | Access |
|---|---|---|
| GET `/finance/accounts` | List accounts in scope | Finance read permission |
| POST `/finance/accounts` | Request account opening | Authorized finance officer |
| GET `/finance/accounts/{accountId}` | Read account | Finance scope |
| POST `/finance/accounts/{accountId}/freeze` | Freeze account with reason | Authorized finance/security authority |
| POST `/finance/accounts/{accountId}/close` | Close after reconciliation | Designated finance authority |
| GET `/finance/budgets` | List budgets | Finance scope |
| POST `/finance/budgets` | Create budget draft | Authorized budget preparer |
| POST `/finance/budgets/{budgetId}/submit` | Submit budget | Budget preparer |
| POST `/finance/budgets/{budgetId}/approve` | Approve budget | Independent finance authority |
| GET `/finance/transactions` | List transactions | Finance scope |
| POST `/finance/transactions` | Submit transaction | Authorized finance officer |
| GET `/finance/transactions/{transactionId}` | Read transaction | Finance scope |
| POST `/finance/transactions/{transactionId}/approve` | Approve transaction | Independent approver |
| POST `/finance/transactions/{transactionId}/reject` | Reject with reason | Independent approver |
| POST `/finance/transactions/{transactionId}/payments` | Initiate approved payment | Authorized payment officer |
| POST `/finance/transactions/{transactionId}/post` | Post reconciled transaction | Authorized posting officer |
| POST `/finance/transactions/{transactionId}/reversals` | Request full reversal | Authorized finance officer |
| POST `/finance/reversals/{reversalId}/approve` | Approve reversal | Independent finance authority |
| POST `/finance/reversals/{reversalId}/post` | Post approved reversal | Authorized posting officer |

Partial payments, multiple successful payments, FX, refunds and budget exceptions remain disabled pending finance authority confirmation. Do not expose endpoints for these options until approved. Payment-provider callbacks use a separate authenticated integration route and event-deduplication contract.

## 13. Credential endpoints

Base: `/credentials`

| Method and path | Purpose | Access |
|---|---|---|
| GET `/credentials/definitions` | List approved credential definitions | Authorized user |
| POST `/credentials/definitions` | Propose definition | Authorized catalogue editor |
| POST `/credentials/definitions/{definitionId}/versions` | Propose version | Authorized catalogue editor |
| POST `/credentials/definitions/{definitionId}/versions/{versionId}/approve` | Approve definition version | Recognized authority |
| POST `/credentials/issuances` | Request issuance | Authorized requester |
| GET `/credentials/issuances` | List issuances in scope | Authorized scope |
| GET `/credentials/issuances/{issuanceId}` | Read issuance | Member/self or authorized scope |
| POST `/credentials/issuances/{issuanceId}/evidence` | Attach protected evidence reference | Authorized submitter |
| POST `/credentials/issuances/{issuanceId}/verify` | Verify evidence | Authorized verifier |
| POST `/credentials/issuances/{issuanceId}/issue` | Issue credential | Designated issuer |
| POST `/credentials/issuances/{issuanceId}/revoke` | Revoke with reason | Authorized issuer/higher authority |

Official credential catalogue, issuer authority, evidence types and validity rules remain open. Public blockchain verification is not in v1.

## 14. Reporting, audit, retention and notifications endpoints

### Reporting: `/reports`

| Method and path | Purpose | Access |
|---|---|---|
| GET `/reports/definitions` | List available report definitions | Authorized report user |
| GET `/reports/definitions/{definitionId}` | Read report metadata | Authorized report user |
| POST `/reports/runs` | Request report run | Authorized report user |
| GET `/reports/runs` | List own/authorized report runs | Scope-filtered |
| GET `/reports/runs/{runId}` | Read run status/result metadata | Requester or authorized scope |
| POST `/reports/runs/{runId}/cancel` | Cancel permitted queued/running job | Requester/authorized operator |
| POST `/reports/runs/{runId}/exports` | Request protected export | Authorized report user |
| GET `/reports/exports/{exportId}` | Retrieve short-lived authorized export | Reauthorization required |

Report catalogue/classification/disclosure policy remains delegated-authority gated. CSV/PDF are initial proposed formats under ODR-013. Apply report resource limits and rate limiting.

### Audit: `/audit`

| Method and path | Purpose | Access |
|---|---|---|
| GET `/audit/events` | Search permitted audit metadata | Audit Officer/explicit audit permission |
| GET `/audit/events/{eventId}` | Read permitted event detail | Explicit audit permission |
| POST `/audit/access-requests` | Request exceptional audit access | Authorized requester |
| POST `/audit/access-requests/{requestId}/approve` | Independent approval | Authorized reviewer |

Audit access is itself audited. System Administrator does not automatically have unrestricted audit-read access. Break-glass remains disabled pending authority confirmation.

### Retention: `/retention`

| Method and path | Purpose | Access |
|---|---|---|
| GET `/retention/policies` | Read approved schedules | Records authority |
| POST `/retention/holds` | Place authorized hold | Designated hold authority |
| POST `/retention/holds/{holdId}/release` | Release hold | Authorized independent authority |
| POST `/retention/actions` | Request controlled disposal action | Authorized records authority |
| POST `/retention/actions/{actionId}/approve` | Approve action | Independent authorized approver |

No permanent deletion endpoint is exposed for ordinary users. Automated permanent deletion remains disabled until approved record-class schedules and authorities exist.

### Notifications: `/notifications`

| Method and path | Purpose | Access |
|---|---|---|
| GET `/notifications` | List own notifications | Authenticated account |
| GET `/notifications/{notificationId}` | Read own notification | Recipient |
| POST `/notifications/{notificationId}/read` | Mark own notification read | Recipient |
| GET `/notifications/preferences` | Read own preferences | Account holder |
| PATCH `/notifications/preferences` | Update permitted channel preferences | Account holder |
| GET `/notifications/deliveries/{deliveryId}` | Read safe delivery status | Recipient/authorized operator |

In-app is baseline. Email requires verified addresses and approved templates. SMS/WhatsApp remain disabled pending consent and provider decisions.

## 15. Integration and operational endpoints

| Method and path | Purpose | Access |
|---|---|---|
| POST `/integrations/webhooks/{providerCode}` | Receive provider callback | Provider signature/authentication |
| GET `/health/live` | Process liveness | Public or infrastructure-restricted |
| GET `/health/ready` | Dependency readiness | Infrastructure-restricted |
| GET `/operations/jobs/{jobId}` | Read safe job status | Authorized operator |
| POST `/operations/outbox/{messageId}/retry` | Controlled retry | Explicit operational permission |
| GET `/operations/integration-failures` | List failures | Integration operator |
| POST `/operations/integration-failures/{failureId}/resolve` | Record manual resolution | Authorized operator |

Operational endpoints must not expose infrastructure secrets, queue payloads containing sensitive data or arbitrary job execution.

## 16. Stable error catalogue

| HTTP | Code | Meaning |
|---:|---|---|
| 400 | VALIDATION_FAILED | Request shape/value invalid |
| 400 | INVALID_COMMAND | Command cannot be interpreted |
| 401 | UNAUTHENTICATED | No valid authenticated actor |
| 401 | INVALID_CREDENTIALS | Generic authentication failure |
| 401 | SESSION_INVALID | Session expired or revoked |
| 403 | FORBIDDEN | Authenticated actor lacks permission |
| 403 | SCOPE_NOT_AUTHORIZED | Resource scope is invalid or unauthorized |
| 403 | REQUEST_ORIGIN_REJECTED | Origin/CSRF validation failed |
| 404 | RESOURCE_NOT_FOUND | Resource not visible or does not exist |
| 409 | STATE_CONFLICT | Current lifecycle does not permit command |
| 409 | IDEMPOTENCY_KEY_REUSED | Same key submitted with different request fingerprint |
| 409 | DUPLICATE_RESOURCE | Unique business identity already exists |
| 409 | CAPACITY_EXCEEDED | Approved capacity rule prevents registration |
| 422 | BUSINESS_RULE_VIOLATION | Domain invariant failed |
| 429 | RATE_LIMITED | Request limit exceeded |
| 503 | DEPENDENCY_UNAVAILABLE | Required security/dependency service unavailable |
| 500 | INTERNAL_ERROR | Unexpected error with no internal detail exposed |

The exact status/code mapping must be contract-tested. Do not use 404 to conceal resources unless the security contract explicitly requires indistinguishable behavior.

## 17. Idempotency contract

- Authentication routes use DDD-013 AUTH-IDEM-001–041 only where the specific authentication operation is listed in the approved specification.
- D13-PDR-01 defines the candidate persistence shape; it remains under independent and owner physical-design review.
- Business mutation endpoints must not inherit authentication idempotency automatically.
- Finance posting, attendance capture, registration, credential issuance and webhook processing require separately approved operation-specific idempotency or deduplication contracts.
- Request fingerprint mismatch for an existing authentication key returns HTTP 409 and `IDEMPOTENCY_KEY_REUSED`.
- Never expose raw idempotency keys, fingerprints, HMAC values or fencing metadata in API responses.

## 18. Contract completeness and approval checklist

- [ ] Every endpoint maps to one owning bounded context.
- [ ] Every endpoint maps to testable requirement IDs in the API traceability appendix.
- [ ] Every endpoint specifies authentication, permission, scope and separation-of-duties requirements.
- [ ] Every mutation defines lifecycle preconditions, actor attribution and audit behavior.
- [ ] Every asynchronous route defines job state and retrieval authorization.
- [ ] Every file/export route uses private storage and rechecks authorization.
- [ ] Every public route has a rate limit and abuse-control profile.
- [ ] Every sensitive mutation has an explicit idempotency/deduplication decision.
- [ ] Every endpoint has stable success/error schemas and contract tests.
- [ ] Every policy-blocked workflow remains absent or disabled.
- [ ] The route catalogue is reconciled against the final physical ERD.

## 19. Approval boundary

This is a complete route-catalogue proposal, not a final OpenAPI contract. Request/response field schemas, lifecycle enums and endpoint-level permission codes require formal contract review. No API code, controller, DTO, Prisma schema, migration, SQL DDL or database object is authorized.
