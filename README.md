# District Youth Management System (DYMS)

DYMS is a centralized management platform for Adventist Youth Ministries across a federation, its districts and local churches. It supports membership, church organization, leadership appointments, events, attendance, finance, credentials, notifications, reporting and auditability.

## Project status

- Product and requirements baseline: approved, 107 testable requirements.
- Architecture decisions DFR-001 through DFR-006: approved and preserved.
- CPERD-02 physical design: project-owner approved.
- CPERD-02 master SHA: `995b025d8381bc3c7e91acc64c71fadfc042546d`.
- CPERD-02 approval manifest SHA: `ba5ed274a9983f877cf7be033f99a12f764939cd`.
- Project-owner implementation authorization: GRANTED on 2026-11-11.
- Implementation: IN PROGRESS.
- External independent DDD-013 technical assurance: NOT PERFORMED.
- PostgreSQL execution, concurrency, security, backup and restore validation: pending implementation verification.

The exact CPERD-02 approval is preserved in [the project-owner approval record](docs/architecture/PHASE-3-CPERD-02-PROJECT-OWNER-APPROVAL-RECORD.md). The approved master and manifest are immutable approval targets. Any material design change follows DFR-006 change control.

## Technology

### Backend
- Node.js 22
- TypeScript
- NestJS
- PostgreSQL
- Prisma ORM
- Redis and BullMQ for background processing
- Versioned REST API under `/api/v1`

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Zustand
- React Hook Form and Zod

### Engineering and operations
- Docker Compose
- GitHub Actions
- Automated unit, integration and end-to-end tests
- Structured logging, request correlation and health checks
- Rate limiting on public and authenticated APIs

## Repository structure

```text
.
├── backend/
│   ├── prisma/
│   ├── src/
│   └── test/
├── docs/
│   ├── product/
│   ├── architecture/
│   ├── api/
│   ├── security/
│   ├── database/
│   ├── operations/
│   └── decisions/
└── .github/
    └── workflows/
```

The frontend and infrastructure implementation will be added as their delivery milestones begin.

## Current implementation slice

The backend foundation includes:
- Validated environment configuration.
- PostgreSQL connectivity through Prisma.
- API liveness and database readiness endpoints.
- Global rate limiting.
- Server-generated request IDs and `X-Request-Id` correlation.
- Standard success and error response envelopes.
- Safe exception normalization that avoids returning internal server errors to clients.

Authentication and session management are the next backend feature slice.

## Local backend development

Requirements: Node.js 22 and PostgreSQL.

```bash
cd backend
npm ci
cp .env.example .env
# Set DATABASE_URL to your local PostgreSQL database.
npm run build
npm test
npm run test:e2e
npm run start:dev
```

The Prisma schema and migrations are implemented incrementally against the owner-approved CPERD-02 baseline. Do not apply migrations to a shared or production database without the required review and deployment controls.

## Security principles

- Argon2id password hashing.
- Short-lived access credentials and rotating refresh credentials.
- Server-side sessions, revocation and refresh-token reuse detection.
- Secure HttpOnly cookies and session-bound CSRF protection.
- Explicit CORS allowlist and origin validation.
- Deny-by-default authorization with organization and resource scoping.
- Rate limiting and brute-force protection.
- No long-lived authentication tokens in browser localStorage.
- No secrets, production data or real environment files in source control.
- Preserve financial, credential, leadership and audit history.

## Product boundaries

- Organizational hierarchy: Royal Federation, District, Local Church.
- Federation access is oversight-only and read-only.
- Districts manage their own churches and members.
- Every member has an individual account. Guardian or shared child accounts are not supported.
- Blockchain anchoring and public on-chain credential verification are deferred from v1.
- Policy-dependent features remain disabled until their governing rules are approved and configured.

## Documentation

The `docs/` directory contains the approved product, architecture, security, database, API and governance baselines. Implementation must follow those approved decisions. Documentation should support delivery and verification, not delay working software.

## License

License selection is pending.
