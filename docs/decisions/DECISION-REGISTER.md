# DYMS Architecture Decision Register

## Purpose

This register records approved design decisions for the District Youth
Management System (DYMS).

Approval of a design decision does not mean the corresponding software has
been implemented, tested, or independently verified.

## DFR-001 — Authentication Architecture

**Status:** APPROVED

Approved decisions:
- Argon2id password hashing.
- Short-lived access credentials.
- Rotating refresh credentials with server-side session validation.
- Persistent server-side sessions and revocation.
- Secure HttpOnly browser cookies.
- CSRF protection for cookie-authenticated state-changing requests.
- Explicit CORS origin allowlist.
- Rate limiting and brute-force protection.
- Refresh-token reuse detection.
- Single-use, expiring password-reset tokens.
- Security-event auditing.
- No long-lived authentication tokens in browser localStorage.

## DFR-002 — API, Domain and Authorization Contracts

**Status:** APPROVED

Approved design baseline:
- Versioned REST API under /api/v1.
- Standard success and error response envelopes.
- Domain entities, business rules, and lifecycle transitions.
- Authorization based on identity, membership, appointments, permissions,
  organizational scope, resource ownership, and business rules.
- Cross-church and cross-department access restrictions.
- Financial separation of duties.
- Audit logging, idempotency for sensitive mutations, and rate limiting.
- OpenAPI documentation and API contract testing requirements.

## DFR-003 — Database Consistency Review

**Status:** APPROVED

Approved design baseline:
- PostgreSQL as the primary system of record.
- Prisma ORM and version-controlled migrations.
- UUID internal identifiers and appropriate unique constraints.
- Foreign-key integrity and non-destructive historical record handling.
- Transaction-safe operations for critical business workflows.
- Decimal types for monetary values.
- UTC timestamps with event time zones retained.
- Historical records preserved through lifecycle state changes, reversal,
  expiration, or revocation as appropriate.
- Production schema changes managed through reviewed migrations.

## DFR-004 — Final Authentication Parameters

**Status:** APPROVED

Approved parameters:
- Access credential lifetime: 15 minutes.
- Session inactivity timeout: 7 days.
- Absolute session lifetime: 30 days.
- Password-reset token lifetime: 30 minutes.
- Refresh credentials rotate and cannot extend a session beyond its
  absolute expiration.
- Same-origin production deployment through HTTPS.
- Secure, HttpOnly, host-only cookies with SameSite=Lax.
- Access cookie path: /api/v1.
- Refresh cookie path: /api/v1/auth.
- Session-bound synchronizer CSRF token and origin validation.
- Coordinated frontend refresh and atomic backend rotation.
- Refresh-token reuse detection and defined revocation behavior.
- Per-session revocation, logout from all devices, and session invalidation
  following password reset or account suspension.
- Appointment expiration removes appointment-derived permissions without
  automatically deactivating the member account.

## DFR-005 — Backup and Disaster Recovery Objectives

**Status:** APPROVED

Approved targets:
- Recovery Point Objective: maximum 24 hours of data loss.
- Recovery Time Objective: restore critical services within 8 hours.
- Automated daily database backups.
- Encrypted backups with restricted access.
- Scheduled restoration tests.
- Backup failure monitoring and alerting.
- Documented disaster recovery procedure.

These targets must be validated against the production infrastructure and
demonstrated through recovery testing.

## DFR-006 — Formal Design Freeze

**Status:** APPROVED

The approved DYMS design specification is frozen for implementation.

Changes to the frozen specification require a documented change request
and review of the impact on requirements, architecture, security, data,
testing, and operations.

Design freeze does not certify that implementation, testing, deployment,
or production readiness has been completed.

## Implementation and Verification Status

All decisions above are approved design decisions.

The following remain implementation and release responsibilities:
- Application code and infrastructure.
- Automated unit, integration, security, and end-to-end tests.
- Security and operational verification.
- Backup restoration exercises.
- Deployment and production smoke tests.
- Milestone reviews and verified Git commits.
