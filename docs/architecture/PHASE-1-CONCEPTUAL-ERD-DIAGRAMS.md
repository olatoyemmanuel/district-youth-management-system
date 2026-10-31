# DYMS Phase 1 Conceptual ERD Diagrams

**Status:** Visual companion to the conceptual ERD. Working review artifact only.  
**Scope:** DYMS v1.0, Sango District.  
**Implementation:** Not authorized. These diagrams are logical relationship views, not physical database schema.

The diagrams show principal relationships. The authoritative candidate attributes, constraints, assumptions, policy gaps, and integrity refinements remain in [PHASE-1-CONCEPTUAL-ERD.md](./PHASE-1-CONCEPTUAL-ERD.md).

## 1. Identity, member category, and church

```mermaid
erDiagram
    USER_ACCOUNT ||--o| MEMBER : "has profile"
    MEMBER ||--o{ MEMBER_CATEGORY_ASSIGNMENT : "has category history"
    MEMBER_CATEGORY ||--o{ MEMBER_CATEGORY_ASSIGNMENT : "classifies"
    MEMBER ||--o{ CHURCH_MEMBERSHIP : "has church history"
    CHURCH ||--o{ CHURCH_MEMBERSHIP : "records membership"
    DISTRICT ||--|{ CHURCH : "contains"
    MEMBER ||--o{ CHURCH_TRANSFER_REQUEST : "initiates"
    CHURCH ||--o{ CHURCH_TRANSFER_REQUEST : "source or receiving church"
```

Cardinality interpretation: each MEMBER must link to exactly one USER_ACCOUNT. A USER_ACCOUNT may exist before a MEMBER profile is created, and may link to at most one MEMBER. The member's current primary church is one active CHURCH_MEMBERSHIP; historical memberships remain retained.

## 2. Department membership

```mermaid
erDiagram
    MEMBER ||--o{ DEPARTMENT_MEMBERSHIP : "joins"
    DEPARTMENT ||--o{ DEPARTMENT_MEMBERSHIP : "has members"
    CHURCH o|--o{ DEPARTMENT_MEMBERSHIP : "optional church scope"
    DEPARTMENT ||--o{ DEPARTMENT_ELIGIBILITY_RULE : "defines versioned eligibility"
```

Department membership does not grant leadership authority. Eligibility rules are placeholders until official requirements are confirmed.

## 3. Leadership and authorization

```mermaid
erDiagram
    POSITION ||--o{ APPOINTMENT : "is filled through"
    MEMBER ||--o{ APPOINTMENT : "holds"
    APPOINTMENT ||--o{ APPOINTMENT_ROLE_LINK : "derives roles through"
    ROLE ||--o{ APPOINTMENT_ROLE_LINK : "mapped to appointment"
    USER_ACCOUNT ||--o{ USER_ROLE_ASSIGNMENT : "receives independent role"
    ROLE ||--o{ USER_ROLE_ASSIGNMENT : "assigned as"
    ROLE ||--o{ ROLE_PERMISSION : "contains"
    PERMISSION ||--o{ ROLE_PERMISSION : "granted by role"
    USER_ACCOUNT ||--o{ ACCESS_DENY : "is target of"
    PERMISSION ||--o{ ACCESS_DENY : "denies"
    ROLE_CONFLICT_RULE ||--o{ ROLE_CONFLICT_REVIEW : "requires review"
    USER_ACCOUNT ||--o{ ROLE_CONFLICT_REVIEW : "subject of review"
```

Position, appointment, role, and permission are separate concepts. An appointment grants no implicit permissions. Explicit deny applies only to its named permission and scope.

## 4. Events, registration, and attendance

```mermaid
erDiagram
    EVENT ||--o{ EVENT_APPROVAL : "has decisions"
    EVENT ||--o{ EVENT_REGISTRATION : "accepts"
    MEMBER ||--o{ EVENT_REGISTRATION : "registers"
    EVENT ||--o{ EVENT_SESSION : "contains"
    EVENT ||--o{ ATTENDANCE_RECORD : "records event attendance"
    EVENT_SESSION o|--o{ ATTENDANCE_RECORD : "optional session"
    MEMBER ||--o{ ATTENDANCE_RECORD : "has attendance"
    ATTENDANCE_RECORD ||--o{ ATTENDANCE_CORRECTION : "has correction history"
```

Attendance is either event-level or session-level for a given event and member. The final physical design must prevent double-counting across these modes. Registration prerequisite remains a policy question.

## 5. Finance

```mermaid
erDiagram
    FINANCIAL_ACCOUNT ||--o{ FINANCIAL_TRANSACTION : "owns transactions"
    FINANCIAL_TRANSACTION ||--o{ TRANSACTION_APPROVAL : "has decisions"
    FINANCIAL_TRANSACTION ||--o{ PAYMENT : "has payment attempts"
    FINANCIAL_TRANSACTION ||--o{ TRANSACTION_LINE : "may contain lines"
    FINANCIAL_TRANSACTION ||--o{ TRANSACTION_REVERSAL : "may be reversed by"
    BUDGET ||--o{ BUDGET_LINE : "contains"
```

Each account has one organizational owner and one currency. Partial payments, accounting sign convention, budget enforcement, and partial reversal policy remain unresolved.

## 6. Credentials

```mermaid
erDiagram
    MEMBER ||--o{ CREDENTIAL_ISSUANCE : "receives"
    CREDENTIAL_DEFINITION ||--o{ CREDENTIAL_ISSUANCE : "defines"
    CREDENTIAL_ISSUANCE ||--o{ CREDENTIAL_EVIDENCE : "supported by"
    CREDENTIAL_ISSUANCE o|--o{ CREDENTIAL_ISSUANCE : "prior issuance lineage"
```

Credential definitions are versioned. Issuance, renewal, revocation, correction, and reissue preserve lineage. Qualification requirements and issuer authority must come from an approved governing source.

## 7. Notifications and external integrations

```mermaid
erDiagram
    NOTIFICATION_TEMPLATE ||--o{ NOTIFICATION : "renders"
    NOTIFICATION ||--|{ NOTIFICATION_RECIPIENT : "targets"
    USER_ACCOUNT ||--o{ NOTIFICATION_RECIPIENT : "receives"
    NOTIFICATION_RECIPIENT ||--o{ NOTIFICATION_DELIVERY : "has attempts"
    INTEGRATION_PROVIDER ||--o{ NOTIFICATION_DELIVERY : "delivers through"
    INTEGRATION_PROVIDER ||--o{ WEBHOOK_EVENT : "sends events"
    INTEGRATION_PROVIDER ||--o{ INTEGRATION_FAILURE : "has failures"
    USER_ACCOUNT ||--o{ NOTIFICATION_PREFERENCE : "sets preferences"
```

Notification retries and webhook processing must be idempotent. Provider acceptance is not proof of delivery. Provider secrets are stored outside ordinary database records.

## 8. Audit, idempotency, and retention

```mermaid
erDiagram
    USER_ACCOUNT ||--o{ AUTH_SESSION : "opens"
    RETENTION_POLICY ||--o{ RETENTION_ACTION : "governs"
    USER_ACCOUNT ||--o{ AUDIT_ACCESS_EVENT : "accesses audit"
    AUDIT_EVENT ||--o{ AUDIT_ACCESS_EVENT : "access may concern"
    RETENTION_POLICY ||--o{ RETENTION_HOLD : "subject to hold"
```

AUDIT_EVENT, IDEMPOTENCY_RECORD, RETENTION_POLICY, RETENTION_HOLD, and RETENTION_ACTION have cross-domain relationships. Some use conceptual target references; physical design must enforce valid targets. Retention periods are not invented, and a valid hold blocks covered destructive actions.

## 9. Cross-domain principles

- Every member has one individual account. No guardian-managed or delegated login relationship exists.
- Member category, department membership, appointment, role, and credential are distinct.
- Every scoped permission and business record must have a valid organizational scope.
- Historical assignments and decisions are preserved.
- Sensitive state changes are auditable and idempotent.
- Finance, attendance, transfer, appointment, and credential workflows require atomic integrity.
- Reporting consumes authoritative records and rechecks authorization.
- These diagrams do not approve physical table names, columns, indexes, constraints, Prisma models, or migrations.
