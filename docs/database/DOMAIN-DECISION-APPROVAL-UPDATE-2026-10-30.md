# Domain Decision Approval Update

- Approval date: 2026-10-30
- Recorded from explicit product-owner approvals in the project conversation.
- Status: APPROVED POLICY DECISIONS
- Scope: Product baseline, member identity/cardinality, ministry classification, primary church membership, and annual leadership appointments.
- Implementation authorization: This record does not authorize Prisma models, migrations, or database implementation. The corrected ERD remains subject to consistency review and formal approval.

## DDD-001: Product requirements baseline

**Decision: APPROVED**

Adopt PRB-001 v0.1 as the reconstructed, versioned working product baseline.

**Provenance qualification:** The historical authoritative original PRD has not been recovered. PRB-001 is a reconstructed baseline and must not be represented as the original historical PRD. Preserve this provenance note in all references to the baseline.

## MEM-02: User-to-Member cardinality

**Decision: APPROVED**

DYMS v1 uses a one-to-one relationship between User and Member:

- Each Member profile is associated with exactly one User account.
- Each User account is associated with at most one Member profile.
- The approved mandatory User–Member association policy remains in force for members who access the platform.
- This decision resolves the previously blocked MEM-02 cardinality question. Update the data model and requirements traceability consistently.

## DDD-002: Youth ministry categories and affiliations

**Decision: CATEGORY MODEL APPROVED IN PRINCIPLE; AGE-21 OVERLAP RULE APPROVED**

Use the official General Conference Seventh-day Adventist Youth Ministries website as the primary reference for published ministry age ranges.

The current General Conference website publishes:
- Adventurers: ages 4–9.
- Pathfinders: ages 10–15.
- Ambassadors: ages 16–21.
- Young Adults: ages 21–30.
- Public Campus Ministry: campus/student context, not an exclusive age-only category.

DYMS top-level member categories remain:
1. Adventurer (4–9).
2. Pathfinder (10–15).
3. Senior Youth (16–30+).

Within Senior Youth, retain Ambassadors and Young Adults as ministry affiliations. Public Campus Ministry is an additional affiliation and may coexist with another affiliation. Master Guide is a training/credential pathway, not a top-level member age category.

**Age-21 overlap rule: APPROVED**

A 21-year-old member may hold both Ambassador and Young Adult affiliations concurrently, subject to approval by the appropriate local ministry authorities. DYMS must respect the published overlapping age ranges and must not invent a new age boundary or enforce mutual exclusivity at age 21.

**Source note:** The General Conference website lists Young Adults as 21–30, while an Adventist News Network report from July 2025 describes Young Adults as 22–30. Retain this discrepancy as a source note. Do not silently rewrite the published ranges. The approved system rule is to permit both affiliations at age 21, subject to local approval.

## DDD-003: Member's primary church membership

**Decision: APPROVED**

Each Member has one current primary church membership at a time.

A church transfer must close the previous membership and open the new primary membership atomically. Historical church membership records must be preserved. A transfer must not overwrite or erase prior membership history.

## DDD-004: Annual leadership appointment lifecycle

**Decision: APPROVED**

- Leadership appointment terms run from January 1 through December 31.
- Renewal is recorded as a new historical appointment for the next annual term, not by overwriting the previous appointment.
- Appointment and renewal authority belongs to the designated higher authority for the relevant organizational level.
- A leader cannot appoint or renew themselves.
- When an appointment expires without renewal, appointment-derived authority ends. The person's account and membership remain active unless separately deactivated under the applicable policy.
- Preserve the complete appointment history.

## Required downstream consistency updates

When the current authoritative database companion documents are restored to the active specification branch, reconcile these decisions across:
- ERD.md
- DATA-MODEL.md
- REQUIREMENTS-TRACEABILITY.md
- INVARIANT-ENFORCEMENT-REGISTER.md
- DATABASE-DESIGN-DECISION-REGISTER.md

At minimum, verify:
- User–Member cardinality is one-to-one and consistently represented.
- Ministry categories and affiliations are distinct concepts; Master Guide remains a credential/training pathway.
- Age 21 permits overlapping Ambassador and Young Adult affiliations with local approval.
- Current primary church membership is singular, while membership history is retained.
- Leadership appointments are annual, immutable historical records with higher-authority renewal and no self-renewal.

## Source references

- General Conference of Seventh-day Adventists, Adventist Youth Ministries, “Ministries”: https://youth.adventist.org/Ministries
- Adventist News Network, July 2025 report on Adventist youth ministry age categories: https://adventist.news/
  
The source URLs identify the official ministry reference and the reported age-range discrepancy. Verify the exact ANN article URL before using it as a formal external citation in a published specification.
