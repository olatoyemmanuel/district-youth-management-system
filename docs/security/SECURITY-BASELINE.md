# DYMS Security Baseline

## 1. Purpose and Status

This document defines the approved security requirements for the District
Youth Management System (DYMS).

These requirements are design commitments. Their implementation, testing,
and operational effectiveness must be verified separately.

## 2. Security Principles

- Deny access by default.
- Authenticate users before protected operations.
- Authorize every protected request on the server.
- Validate all untrusted input.
- Apply least privilege and separation of duties.
- Protect sensitive information in transit and at rest.
- Preserve auditability for sensitive operations.
- Avoid exposing secrets in responses, logs, or error messages.
- Apply rate limiting to public and authenticated APIs.
- Treat security failures as explicit, testable outcomes.

## 3. Authentication

- Hash passwords using Argon2id with reviewed parameters.
- Use short-lived access credentials.
- Rotate refresh credentials on successful refresh.
- Validate sessions against server-side state.
- Support per-session and account-wide session revocation.
- Use Secure, HttpOnly, host-only cookies in production.
- Use SameSite=Lax as the approved cookie default.
- Never store long-lived authentication tokens in browser localStorage.
- Return generic authentication errors to reduce account enumeration.
- Rate-limit login, registration, password recovery, and refresh operations.
- Require single-use, expiring password-reset tokens.
- Revoke existing sessions following a successful password reset.
- Record relevant authentication and session security events.

## 4. Approved Authentication Parameters

- Access credential lifetime: 15 minutes.
- Session inactivity timeout: 7 days.
- Absolute session lifetime: 30 days.
- Password-reset token lifetime: 30 minutes.
- Refresh credentials: rotating and constrained by session expiration.
- CSRF protection: session-bound synchronizer token.
- Origin validation: explicit allowlist for protected browser requests.

Cookie paths and expiration behavior must follow the approved authentication
contract. Implementation tests must verify the effective browser behavior.

## 5. Session and Refresh Security

- Maintain persistent server-side session records.
- Store refresh-token hashes rather than raw refresh tokens.
- Rotate refresh credentials atomically.
- Detect refresh-token reuse.
- Define safe handling for concurrent refresh requests.
- Revoke sessions when logout or administrative revocation occurs.
- Support logout from all devices.
- Enforce inactivity and absolute session expiration.
- Invalidate or revoke sessions when an account is suspended.
- Recheck account status and authorization on protected requests.

## 6. Authorization

Authorization decisions must consider:

- Authenticated identity.
- Account status.
- Active membership.
- Active leadership appointment where required.
- Permission.
- District, church, and department scope.
- Resource ownership.
- Applicable business rules.

Additional requirements:

- Enforce authorization on the server, not only in the frontend.
- Prevent insecure direct object reference (IDOR) vulnerabilities.
- Prevent cross-church and cross-department data access.
- Do not allow self-appointment, self-renewal, or self-approval where prohibited.
- Enforce financial separation of duties.
- Do not treat technical administrator access as automatic financial or
  credential-issuance authority.
- Remove appointment-derived permissions when an appointment expires or ends.
- Audit sensitive permission and scope changes.

## 7. Mandatory Rate Limiting

Rate limiting is a required security and reliability control.

- Use Redis-backed distributed rate limiting where applicable.
- Apply stricter policies to login, registration, password reset, token
  refresh, event registration, uploads, exports, credential verification,
  and other abuse-prone endpoints.
- Apply limits by appropriate combinations of IP address, authenticated
  account, session, and resource.
- Do not trust client-supplied identity headers unless set by a trusted proxy.
- Configure trusted proxy behavior explicitly.
- Return HTTP 429 when a request exceeds its applicable limit.
- Provide appropriate Retry-After behavior when meaningful.
- Record relevant rate-limit security events without logging secrets.
- Test limits across multiple application instances where distributed
  enforcement is required.
- Define safe behavior when Redis is unavailable for security-sensitive
  endpoints.
- Ensure legitimate users are not permanently blocked by simplistic
  IP-only rules.

Exact thresholds must be documented, measured, and reviewed before release.

## 8. Input and API Security

- Validate request bodies, parameters, headers, and query strings.
- Use explicit DTOs and prevent unsafe mass assignment.
- Use safe parameterized database access through the persistence layer.
- Enforce request-size and upload-size limits.
- Use consistent error responses without internal stack traces.
- Configure security headers.
- Restrict CORS to approved origins.
- Protect cookie-authenticated state-changing requests against CSRF.
- Use TLS in production.
- Avoid state-changing GET endpoints.
- Apply pagination limits and allowlisted sorting/filtering.
- Use idempotency protections for sensitive operations where required.
- Protect webhooks with signatures, replay prevention, and idempotent handling.

## 9. File Security

- Validate permitted file types, content types, and file sizes.
- Do not trust filenames or client-supplied content types.
- Generate safe storage keys.
- Store uploads outside executable application paths.
- Require authorization for upload, access, replacement, and deletion.
- Avoid public exposure of sensitive attachments.
- Record relevant file operations.
- Reject malformed or disallowed uploads safely.

## 10. Financial and Historical Data

- Prevent deletion of posted financial transactions.
- Use documented reversal operations with reasons.
- Enforce creator/submitter versus approver separation.
- Preserve credential issuance and revocation history.
- Preserve leadership appointment and membership history.
- Use database transactions and constraints for critical state changes.
- Audit corrections to attendance, finance, credentials, and appointments.

## 11. Audit and Logging

Audit records should capture relevant actor, action, resource, result,
organization scope, timestamp, and request/correlation identifiers.

Where appropriate, include previous and new values, reason, and metadata.

- Keep audit history append-only through application policy and database
  permissions.
- Restrict audit access and audit sensitive exports.
- Never log passwords, raw access credentials, refresh tokens, reset tokens,
  secrets, or full session cookies.
- Minimize personal data in operational logs.
- Record authentication failures, session revocations, rate-limit events,
  authorization failures, and sensitive administrative actions.
- Protect logs against unauthorized access and tampering.

## 12. Notifications and Webhooks

- Do not include unnecessary sensitive information in notifications.
- Respect channel preferences and applicable consent requirements.
- Process delivery asynchronously where appropriate.
- Use retries, backoff, idempotency, and dead-letter handling.
- Verify webhook signatures and prevent replay attacks.
- Keep provider credentials in managed secrets or protected environment
  configuration.
- Avoid trusting provider callback data until it has been validated.

## 13. Secrets and Configuration

- Keep real environment files and secrets out of Git.
- Provide example configuration with placeholders only.
- Use least-privilege credentials for each environment.
- Separate development, staging, and production secrets.
- Rotate exposed or compromised credentials promptly.
- Avoid embedding secrets in frontend bundles.
- Restrict production access and document secret rotation procedures.

## 14. Security Testing

Required security test areas include:

- Authentication and password recovery.
- Session expiration, rotation, revocation, and reuse detection.
- CSRF and origin validation.
- Role, permission, scope, and resource-ownership enforcement.
- Cross-church and cross-department access.
- Rate limiting and abuse resistance.
- Input validation and injection resistance.
- File upload and download authorization.
- Webhook signature and replay protection.
- Financial separation of duties.
- Audit integrity and sensitive-data redaction.
- Dependency and configuration security.

Security tests must run as part of the relevant feature and release gates.

## 15. Incident and Recovery Readiness

- Maintain a documented security incident response procedure.
- Monitor authentication abuse, elevated error rates, suspicious access,
  queue failures, and backup failures.
- Maintain encrypted backups with restricted access.
- Approved RPO: maximum 24 hours.
- Approved RTO: restore critical services within 8 hours.
- Test restoration and recovery procedures.
- Document actions for credential compromise and unauthorized access.

## 16. Definition of Done

A feature is not security-complete merely because its happy path works.

The feature must have relevant authorization checks, input validation,
rate limiting, error handling, audit behavior, automated tests, documentation,
and review against its applicable threat scenarios.

## 17. Status

Security baseline: approved for implementation.

Implementation, security testing, penetration testing, and production
readiness remain separate verification activities.
