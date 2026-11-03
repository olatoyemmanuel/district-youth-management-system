# Authentication Retention Decision

- Decision ID: AUTH-RET-001
- Related decision: DDD-014 (Retention and Deletion)
- Status: APPROVED for the authentication-record categories listed below
- Approval date: 2026-10-30
- Scope: DYMS authentication persistence
- Approval basis: Explicit user approval in the project conversation

## Decision

DYMS shall use separate retention periods for authentication session records, refresh-token history, password-reset records, and security events. The approved periods are:

| Record category | Approved retention period | Retention clock starts |
|---|---:|---|
| Session records | 12 months | Session expiry or revocation |
| Refresh-token history | 12 months | Token expiry, consumption, or revocation |
| Password-reset records | 90 days | Token expiry, consumption, or revocation |
| Security events | 24 months | Event occurrence |

## Approved exceptions

Deletion of records relevant to a documented legal hold or an active security investigation shall be suspended for the duration of that hold or investigation.

An exception must be documented, limited to relevant records, authorised by the appropriate authority, and assigned a review date. The approval of this decision does not establish the identity of the authorised role; that authority remains subject to the audit/access governance decision.

## Enforcement requirements

1. Retention enforcement must not delete active sessions or active refresh tokens.
2. Raw refresh tokens and raw password-reset tokens must never be stored. Retention applies to hashes and necessary lifecycle metadata only.
3. Eligible records may be permanently deleted after the applicable retention period, unless an approved exception applies.
4. Deletion operations must preserve referential integrity and produce an auditable cleanup record without exposing secrets.
5. Retention cleanup must be safe to retry and must report failures for operational follow-up.
6. Backup retention and disposal are governed separately. Deleting a live database record does not itself establish that copies in backups have been disposed of.
7. The system must enforce session expiry during authentication and refresh operations. A cleanup job is not a substitute for runtime expiry checks.

## Decision boundary and remaining status of DDD-014

This approval resolves the retention-period choice for the four authentication-record categories above only.

DDD-014 remains BLOCKED overall for the wider data model. Retention periods and deletion rules for audit logs, membership history, appointment history, attendance corrections, finance records, credentials, and other non-authentication records remain unresolved. Backup retention and disposal also require a separate policy decision.

This decision does not approve Prisma models, database migrations, automated cleanup implementation, or the final ERD. Those remain subject to the existing database design and implementation gates.

## Change control

Any change to these approved periods or exceptions requires an explicit, documented decision and must not silently alter this record.
