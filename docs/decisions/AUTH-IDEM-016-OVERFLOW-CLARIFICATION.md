# AUTH-IDEM-016: Fencing Counter Overflow Clarification

- Decision ID: AUTH-IDEM-016 clarification
- Decision date: 2026-11-02
- Decision authority and approver: DYMS project owner
- Status: APPROVED
- Related records: PR #25, PR #52, PR #35
- Scope: Authentication idempotency recovery fencing/version counter
- Physical database design approval: NOT GRANTED
- Implementation authorization: NOT AUTHORIZED

## 1. Owner decision

The project owner explicitly approved the recommendation on 2026-11-02:

1. The PostgreSQL BIGINT fencing/version counter must never wrap, reset, or silently reuse a prior value.
2. Counter overflow is an integrity failure.
3. When an increment would exceed the supported BIGINT range, the recovery claim or state transition must fail closed. No stale or un-fenced worker may proceed.
4. The affected operation must be withheld from automatic recovery and routed to controlled recovery or manual intervention.
5. The event must be recorded and surfaced to authorized operators without exposing credentials or other authentication secrets.
6. No automatic counter reset, wraparound, truncation, or replacement with a reused value is permitted.

## 2. Relationship to the earlier AUTH-IDEM-016 records

PR #25 explicitly treated overflow as an integrity failure and prohibited wrap/reset. PR #52 left overflow handling open. The project owner's decision dated 2026-11-02 resolves that discrepancy in favor of the PR #25 treatment.

This clarification supplements AUTH-IDEM-016. It does not change the common previously approved core:

- PostgreSQL BIGINT counter.
- Initial value 0.
- Increment by exactly 1 for each successful recovery claim.
- Atomic claim/counter coordination.
- Stale fencing-value rejection.

The clarification does not silently rewrite either historical pull request. Both remain part of the decision history.

## 3. Approval boundary

This approval settles the policy/technical integrity rule for overflow behavior. It does not approve:

- Physical column definitions, nullability, defaults, or index structures.
- Prisma models or schema.
- SQL DDL, migrations, triggers, or database functions.
- Recovery worker implementation, APIs, or application code.
- Any other physical database design element.

Those items remain subject to the DYMS physical-design review and explicit approval gates.

## 4. Required consistency updates

The canonical DDD decision register and DDD-013 approval evidence recovery record must cite this clarification and no longer list overflow policy as an unresolved owner decision. The consolidated DDD-013 specification must be checked for consistency during the remaining ERD validation. Its draft status and the final DDD-013 approval gate remain unchanged.

## 5. Change history

| Date | Change | Authority/evidence |
|---|---|---|
| 2026-11-02 | Resolved the AUTH-IDEM-016 overflow wording conflict. Overflow is an integrity failure; wrapping, resetting, or reusing values is prohibited; fail closed and route to controlled recovery/manual intervention. | Explicit project-owner approval in the DYMS conversation; formalized in this decision record. |
