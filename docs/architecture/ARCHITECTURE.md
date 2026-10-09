# DYMS System Architecture

## 1. Purpose

This document records the approved architectural baseline for the
District Youth Management System (DYMS).

The system is a centralized platform for managing district-level Adventist
Youth Ministries, including membership, churches, leadership appointments,
events, attendance, finance, credentials, notifications, reporting, and audit.

This document describes the intended architecture, not a claim that the
system has already been implemented or independently tested.

## 2. Architectural Style

DYMS uses a modular monolith with Clean Architecture and Domain-Driven
Design-inspired boundaries.

The API and background worker are separate runtime processes. They may
share application modules and domain rules while having distinct execution
responsibilities.

Modules must have explicit boundaries and should not access another module's
internal implementation directly without an approved interface.

CQRS may be used selectively where it provides a clear benefit. It is not
required for every operation.

## 3. Technology Baseline

### Backend
- Node.js 22
- TypeScript
- NestJS
- REST API
- OpenAPI documentation
- Prisma ORM

### Data and asynchronous processing
- PostgreSQL as the primary system of record
- Redis for rate limiting, caching, and queue infrastructure
- BullMQ for background jobs
- S3-compatible object storage for authorized files and attachments

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query for server state
- Zustand for client-side UI state
- React Hook Form and Zod for form handling and validation

### Operations
- Docker Compose for local infrastructure
- GitHub Actions for automated checks and CI/CD
- HTTPS reverse proxy in production
- Structured logs, request IDs, health checks, and monitoring

## 4. Logical Components

### Frontend
Provides the user interface, accessible interactions, form validation,
role- and scope-aware navigation, and API integration.

Frontend permission checks improve usability but never replace server-side
authorization.

### API application
Handles authentication, input validation, authorization, application
use cases, domain rules, persistence coordination, and API responses.

### Domain and application modules
Organize membership, organization, leadership, events, attendance, finance,
credentials, notifications, reporting, and audit responsibilities.

### PostgreSQL
Stores authoritative business records, relationships, status transitions,
and persistent audit information.

### Redis and BullMQ
Support distributed rate limiting, caching where appropriate, and
asynchronous job processing. Redis is not the authoritative store for
core business records.

### Background worker
Processes notifications, exports, and other asynchronous tasks independently
of HTTP request handling.

### Object storage
Stores authorized attachments and other files. The database retains
metadata and storage references, with access controlled by application policy.

## 5. Deployment Baseline

The intended production topology is:

Internet
  -> HTTPS reverse proxy
     -> Frontend
     -> API under /api/v1

The API connects to PostgreSQL, Redis, and object storage.
A separate worker process consumes background jobs.

The initial deployment uses a same-origin frontend and API where practical.
The actual production hostname and infrastructure provider remain undecided.

## 6. API Standards

- Base path: /api/v1
- Format: REST and JSON
- Documented through OpenAPI
- Consistent success and error response envelopes
- Request/correlation IDs
- Input validation and explicit DTOs
- Scope-aware authorization
- Explicit CORS allowlist
- Security headers
- Rate limiting with appropriate 429 responses
- Idempotency for sensitive operations where required
- Version-controlled API contract changes

Heavy operations should use background jobs when appropriate and return
an accepted response with a job identifier.

## 7. Data and Persistence Principles

- UUIDs are used for internal entity identifiers.
- Human-readable identifiers may be provided where useful.
- PostgreSQL is the primary system of record.
- Money uses fixed-precision decimal types.
- Timestamps are stored consistently in UTC; event time zones are retained.
- Foreign-key and uniqueness constraints protect data integrity.
- Historical records use lifecycle states, revocation, or reversal rather
  than destructive deletion where required.
- Schema changes use reviewed, version-controlled Prisma migrations.
- Production schema changes must not rely on Prisma db push.

## 8. Authorization

Authorization combines identity, active membership, active appointment,
permissions, organization and department scope, resource ownership, and
business rules.

Authentication alone does not grant access.

The server must enforce access boundaries even if a client modifies a URL,
request body, identifier, or frontend state.

Technical administrator privileges do not automatically grant ministry,
financial approval, or credential-issuance authority.

## 9. Security Baseline

- Argon2id password hashing
- Short-lived access credentials
- Rotating refresh credentials
- Server-side session validation and revocation
- Secure HttpOnly browser cookies
- Session-bound CSRF protection and origin validation
- Explicit CORS allowlist
- Mandatory rate limiting
- Brute-force protection
- Input validation and safe database access
- Secrets excluded from source control and logs
- Audit trails for sensitive operations
- Signed and replay-protected webhooks where applicable
- Secure file upload and download authorization

## 10. Authentication Parameters

The approved defaults are:

- Access credential lifetime: 15 minutes
- Session inactivity timeout: 7 days
- Absolute session lifetime: 30 days
- Password-reset token lifetime: 30 minutes
- Password-reset tokens: single-use
- Refresh credentials: rotated and capped by session expiration
- Cookies: Secure in production, HttpOnly, SameSite=Lax, host-only
- CSRF: session-bound synchronizer token and origin validation

Cookie paths, expiration enforcement, refresh concurrency, and revocation
must be implemented and verified against the approved security contract.

## 11. Reliability and Operations

- Health, liveness, and readiness endpoints
- Graceful shutdown
- Structured logs and correlation IDs
- Monitoring for API errors, database and Redis health, queues, and backups
- Automated backups with restricted access and encryption
- Scheduled restore tests
- Documented recovery procedures
- Approved RPO: maximum 24 hours
- Approved RTO: restore critical services within 8 hours

The recovery targets must be validated against the eventual production
infrastructure and restoration tests.

## 12. Testing and Delivery

The CI pipeline should run:

1. Dependency installation
2. Linting
3. Type checking
4. Unit tests
5. Integration tests
6. Security and dependency checks
7. Production builds
8. Relevant end-to-end tests

Changes must be reviewed against acceptance criteria before a milestone is
marked complete or committed as a verified milestone.

## 13. Deferred Scope

Blockchain anchoring and public verification are not part of the initial MVP.
The credential model should preserve the option for future integrity proofs
without putting sensitive personal information on-chain.

Kubernetes is not required for the MVP.

## 14. Status

Architecture decision baseline: approved and frozen for implementation.

Implementation, automated testing, deployment, and production readiness
remain separate engineering and release gates.
