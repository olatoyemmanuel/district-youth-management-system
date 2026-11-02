# District Youth Management System (DYMS)

DYMS is a centralized management platform for Adventist Youth Ministries
at district level. It supports membership, church organization, leadership
appointments, events, attendance, finance, credentials, notifications,
reporting, and auditability.

## Project Status

- Phase 1: CLOSED for the agreed v1 product, domain and requirements scope
- Phase 2: ACTIVE, physical database design reconciliation and documentation-level integrity review
- Product requirements: approved 107-ID baseline
- Architecture and design specification: approved baseline under DFR-006 change control
- DFR-006 formal design freeze: PRESERVED; change control remains in force
- Physical ERD CPERD-01: project-owner approved
- DDD-013 detailed physical design: project-owner approved
- Application implementation: NOT AUTHORIZED; separate explicit authorization required

Phase 1 closure and Phase 2 entry are recorded in [PHASE-1-CLOSURE-AND-PHASE-2-ENTRY.md](docs/decisions/PHASE-1-CLOSURE-AND-PHASE-2-ENTRY.md). Phase 2 starts from approved physical design CPERD-01. The project owner decides DYMS product behavior; external confirmation is not a prerequisite for accepting project design decisions. Official standards remain configurable source metadata where applicable. Documentation-only design work is authorized. This does not authorize Prisma schemas, migrations, SQL DDL, database objects, seeds, API/backend/frontend implementation, infrastructure changes, or deployment. DFR-001–DFR-006 remain preserved. Material changes to the frozen specification require a documented change request and impact review. See [DFR-006 Governance Clarification](docs/decisions/DFR-006-GOVERNANCE-CLARIFICATION-2026-11-02.md) and the [Phase 4 Governance and Design Closure Register](docs/decisions/PHASE-4-GOVERNANCE-AND-DESIGN-CLOSURE-REGISTER.md).

## Technology Stack

### Backend
- Node.js 22
- TypeScript
- NestJS
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- REST API and OpenAPI

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Zustand
- React Hook Form
- Zod

### Infrastructure and Quality
- Docker Compose
- GitHub Actions
- Automated tests and quality checks
- Structured logging, health checks, and monitoring
- Rate limiting as a mandatory API security control

## Repository Structure

```text
dyms/
├── backend/
├── frontend/
├── docs/
│   ├── product/
│   ├── architecture/
│   ├── api/
│   ├── security/
│   ├── database/
│   ├── operations/
│   └── decisions/
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   ├── monitoring/
│   └── scripts/
└── .github/
    └── workflows/
```

## Core Engineering Principles

- Follow the approved design specification.
- Use clear module boundaries and separation of concerns.
- Enforce authorization at the server, including organization and resource scope.
- Validate untrusted input at system boundaries.
- Apply rate limiting to APIs, with stricter policies for sensitive operations.
- Keep secrets out of source control and logs.
- Preserve financial, credential, leadership, and audit history.
- Use version-controlled database migrations.
- Test business rules, permissions, security controls, and failure paths.
- Commit only reviewed and verified milestones.

## Local Development

The engineering foundation is being established. Setup instructions for
installing dependencies, starting services, running tests, and applying
database migrations will be added as the corresponding components are
implemented and verified.

## Documentation

See `docs/` for architecture, security, database, API, operational, and
decision records.

## Security

Do not commit credentials, production data, private keys, or real environment
files. Use documented environment variables and local example configuration.

Report security issues privately to the project maintainers rather than
publishing sensitive exploit details.

## License

License selection is pending.
