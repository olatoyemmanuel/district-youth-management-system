# DYMS CPERD-14 — Credential and Youth-Eligibility Standards Evidence Matrix

- Deliverable: CPERD-14
- Date: 2026-11-11
- Repository: olatoyemmanuel/district-youth-management-system
- Branch: phase-1/requirements-consolidation
- Status: **EVIDENCE MATRIX PREPARED; SOURCE-VERSION AND LOCAL-ADAPTATION REVIEW REQUIRED**
- Implementation: **NOT AUTHORIZED**

## 1. Purpose

This matrix supports ODR-001 (category eligibility/progression) and ODR-009 (credential catalogue). It records official Adventist Youth Ministries source material, identifies what each source supports, distinguishes membership categories from progressive classes and leadership credentials, and defines how DYMS should represent changing external criteria.

This is a standards evidence register, not an adoption of every source statement as a DYMS hardcoded rule. The project owner approved configurable eligibility and credential models. Official source, version, effective date, jurisdiction and approving authority must be recorded when DYMS asserts official recognition.

## 2. Governing DYMS design rules

1. One active primary member category at a time; preserve category history.
2. Eligibility rules are versioned and configurable. Do not hardcode age thresholds or automatic promotion.
3. A category is not the same thing as a progressive class, honor, award or leadership credential.
4. Master Guide is a leadership credential, not a member category.
5. Credentials are issued only from configured definitions by a recognized issuer role after evidence review.
6. Renewal/reissue must link to the prior issuance. Revocation requires a reason and preserves history.
7. Unknown validity/expiry remains unset. Do not invent an expiry period.
8. The Conference/Mission and relevant church authority are represented as issuer/approver metadata where the source requires them. DYMS does not claim to replace their recognition authority.
9. No guardian account is created. Where an official program requires parent/guardian cooperation or consent for a minor, the consent/evidence workflow must not create a guardian login.
10. Credentials remain off-chain and authoritative in DYMS. Blockchain is deferred; no personal data or credential evidence is placed on-chain.

## 3. Official source evidence matrix

| Source ID | Official source | Supported subject | Key evidence captured | Jurisdiction / caveat |
|---|---|---|---|---|
| SRC-AYM-001 | General Conference Adventist Youth Ministries, Adventurer Club: https://www.gcyouthministries.org/ministries/adventurers/ | Adventurer programme | Club ages 4–9; age/grade-specific curriculum; church, home and school partnership | General Conference source; verify any Division/Union adaptation |
| SRC-AYM-002 | General Conference Adventist Youth Ministries, Adventurer Progressive Classes: https://www.gcyouthministries.org/ministries/adventurers/progressive-classes/ | Adventurer class progression | Little Lamb (pre-kindergarten), Early Bird (kindergarten), Busy Bee (grade 1), Sunbeam (grade 2), Builder (grade 3), Helping Hand (grade 4) | Page describes curriculum as four levels but lists six grade-level class labels; confirm the current manual/version before encoding |
| SRC-AYM-003 | General Conference Adventist Youth Ministries, Pathfinder Structure & Organization: https://www.gcyouthministries.org/ministries/pathfinders/structure-organization/ | Pathfinder class progression | Six classes: Friend 10, Companion 11, Explorer 12, Ranger 13, Voyager 14, Guide 15 | General Conference page; division adaptations may apply |
| SRC-AYM-004 | General Conference Adventist Youth Ministries, Pathfinder Club Membership Requirements: https://www.gcyouthministries.org/ministries/pathfinders/pathfinder-club-membership-requirements/ | Pathfinder membership | Applicant age 10–15; application; club staff committee consideration; parent cooperation | No guardian account model is implied; consent capture requires separate DYMS workflow design |
| SRC-AYM-005 | General Conference Adventist Youth Ministries, Ambassadors membership: https://www.gcyouthministries.org/ministries/ambassadors/membership/ | Ambassador/Senior Youth | Ambassador programme ages 16–21; Senior Youth described as 16–30+ | General Conference source; Young Adult lower boundary differs across GC pages |
| SRC-AYM-006 | General Conference Adventist Youth Ministries, Ministries overview: https://www.gcyouthministries.org/ministries/ | Ministry age ranges | Adventurer 4–9; Pathfinder 10–15; Ambassador 16–21; Young Adults 21–30 | The Young Adult lower boundary is 21 here, while another GC membership page uses 22; do not hardcode the transition |
| SRC-AYM-007 | General Conference Adventist Youth Ministries, Master Guide Requirements: https://www.gcyouthministries.org/leadership-training/master-guide/master-guide-requirements/ | Master Guide leadership credential | Baptized member in regular standing; 16 to start and 18 at investiture; background check and child protection; Conference/Mission approval; Basic Staff Training; active service; portfolio review | Current page is the primary source for this evidence set; exact curriculum revision/effective date must be captured from the downloaded manual |
| SRC-AYM-008 | General Conference Adventist Youth Ministries, Master Guide programme: https://www.gcyouthministries.org/leadership-training/master-guide/ | Master Guide credential identity | Master Guide is a youth-ministry leadership programme, not a Pathfinder programme or member category | Supports the owner-approved distinction between category and credential |
| SRC-AYM-009 | General Conference Adventist Youth Ministries, Leadership Training: https://www.gcyouthministries.org/leadership-training/ | Senior Youth Leader and Master Guide | SYL is a leadership curriculum for individuals approved by the church board; Master Guide and SYL are leadership curricula for different ministry segments | Do not convert either curriculum into a member category |
| SRC-AYM-010 | General Conference Adventist Youth Ministries, Senior Youth Leadership Curriculum for Pastors (2024): https://www.gcyouthministries.org/wp-content/uploads/English-SYL-for-Pastors-April-2024.pdf | Pastor-specific SYL pathway | Pastor curriculum and its stated prerequisites | Pastor-specific academic prerequisites must not be applied to every SYL candidate |
| SRC-AYM-011 | General Conference Adventist Youth Ministries, Resource Manuals: https://www.gcyouthministries.org/resources/resource-manuals/ | Curriculum versioning | GC provides manuals and explicitly directs users to local Division adaptations/guidelines | DYMS must retain Division/Union source metadata where the local field adopts an adaptation |

## 4. Membership category and progressive-class mapping

These are source-backed candidate mappings, not final DYMS category codes or age rules.

| Ministry programme | Candidate member category relationship | Progressive class / track | External eligibility evidence | DYMS treatment |
|---|---|---|---|---|
| Adventurer | Candidate Junior Youth category | Little Lamb, Early Bird, Busy Bee, Sunbeam, Builder, Helping Hand | GC programme describes ages 4–9 and grade-specific class progression | Store category separately from class achievements; use configured source/version and grade/age criteria; no automatic promotion |
| Pathfinder | Candidate Junior Youth category | Friend, Companion, Explorer, Ranger, Voyager, Guide | GC source describes ages 10–15 and class ages 10–15 | Store category separately from class achievements; class completion is evidence/achievement, not a new member category |
| Ambassador | Candidate Senior Youth category | Ambassador programme modules | GC source describes programme for ages 16–21 | Store as configurable category/programme relationship; do not infer eligibility from birth date alone |
| Young Adults | Candidate Senior Youth category | Young Adult programme | GC sources differ on lower boundary: 21 in the Ministries overview, 22 in another membership description | Owner-approved one-active-category rule remains; exact transition age/source/version must be configured, not hardcoded |
| Public Campus Ministry | Candidate ministry participation/department relationship, not assumed member category | Campus ministry programme | GC lists PCM as a senior-youth ministry programme | Model participation/appointment only if approved in DYMS scope; do not invent a member category |
| Master Guide | Not a member category | Leadership curriculum and investiture | GC explicitly identifies it as a youth-ministry leadership programme | Credential issuance linked to member; category assignment remains unchanged |
| Senior Youth Leader | Not a member category | Senior Youth leadership curriculum | GC lists SYL under leadership training and requires church-board approval | Credential/leadership recognition linked to member; do not use as a membership category |

### 4.1 Source discrepancies requiring configuration

- Adventurer Progressive Classes page says “four levels” but lists six class labels. The actual progression labels are listed above; confirm against the current official manual and any WAD/Union adaptation.
- Young Adult age boundary is 21 on one GC overview and 22 on another membership page. Keep the source, version and jurisdiction with the eligibility rule. Do not automatically transition a member on a birthday until the owner selects the applicable source rule.
- General Conference directs users to consult local Division adaptations. DYMS should not assume that a GC page alone establishes the exact currently adopted West-Central Africa Division, Union or Conference rule.
- Age/grade evidence may be different from investiture/credential requirements. Do not use a class-age table as the Master Guide or SYL eligibility rule.

## 5. Leadership credential evidence matrix

| Credential candidate | Required evidence from current official source | Issuer / approval evidence | Renewal / expiry treatment | DYMS representation |
|---|---|---|---|---|
| Master Guide | Baptized member in regular standing; age 16 to begin and 18 at investiture; child-protection/background-check requirements; Basic Staff Training; active ministry service; required curriculum/portfolio | Local church board recommendation; Conference/Mission supervision and approval; portfolio review/investiture by authorized Conference/Mission representative | No general credential expiry is asserted by the reviewed source; leave validity unset unless an adopted official rule specifies it | Credential definition + version; candidate member; evidence references; issuer organization/actor; approval decision; investiture date; linked renewal/reissue; reasoned revocation |
| Senior Youth Leader | Senior Youth leadership curriculum; church-board approval; exact pathway requirements depend on current GC curriculum | Church board approval and authorized Conference/Mission curriculum/investiture process as specified by adopted version | No general expiry asserted by the reviewed sources; leave unset | Separate leadership credential; do not treat pastor-only SYL requirements as universal |
| Adventurer class achievement | Completion evidence for the applicable grade-level class and requirements | Authorized club/investiture process under adopted Division/Conference guidance | Achievement record; no automatic expiry assumed | Progressive-class achievement linked to member and source/version; not a member category |
| Pathfinder class achievement | Completion evidence for Friend through Guide class requirements | Authorized club/investiture process under adopted Division/Conference guidance | Achievement record; no automatic expiry assumed | Progressive-class achievement linked to member and source/version; not a member category |
| Pathfinder/Adventurer honor or award | Exact honor/award requirements and completion evidence from adopted official manual | Recognized instructor/evaluator and approved investiture process | No expiry assumed unless the official credential explicitly defines it | Configured credential/achievement definition; issuer/evidence review; source/version |
| Other leadership or ministry recognition | Not standardized in this matrix | Must be tied to an approved source and recognized issuer | Unset until source says otherwise | Do not issue an unconfigured credential |

### 5.1 Master Guide details to preserve

The reviewed General Conference Master Guide requirements page specifies:
- baptized member in regular standing;
- minimum age 16 to start and 18 at investiture;
- background check and child-protection course, with Conference/Mission approval;
- mentor discussion and portfolio evidence;
- Basic Staff Training workshops;
- at least one year of active Adventurer/Pathfinder staff service or teaching Sabbath School for those age groups;
- investiture after completion of requirements and Conference/Mission portfolio review;
- completion timeframe of one to three years in the current page.

These requirements must be stored as a versioned evidence checklist, not as hardcoded fields or a single boolean. A later official curriculum version must not rewrite an already-issued credential's historical criteria.

## 6. Candidate credential definition metadata

For each configured credential/class/award definition, preserve:

1. Stable internal code and version.
2. Display name and credential type: membership-linked class achievement, honor/award, leadership credential or other approved recognition.
3. Source authority and source document.
4. Source version, publication/effective date and jurisdiction.
5. Eligibility rule version and effective dates.
6. Prerequisite criteria and evidence checklist.
7. Recognized issuer role and issuing organization scope.
8. Required reviewer/approver and separation-of-duties rule.
9. Investiture/award/issue date.
10. Validity start/end only when the official source defines them.
11. Renewal/reissue relationship to the prior issuance.
12. Revocation reason, actor, decision and date.
13. Disclosure/verification policy and permitted audience.
14. Evidence reference and integrity metadata; do not expose evidence documents by default.

For each issued credential, store the exact definition version used. Do not recompute historic eligibility using the newest curriculum version.

## 7. Source-of-truth and authority handling

- General Conference Youth Ministries pages/manuals provide the global source baseline.
- Division/Union/Conference adaptations must be recorded as distinct sources with version/effective date and jurisdiction.
- The Conference/Mission remains the recognized issuer/approver where the source requires it.
- The local church board recommendation/approval is captured as a decision record where required.
- DYMS stores the source and decision provenance; it does not self-certify a person as officially invested without recognized issuer evidence.
- External policy references are metadata/configuration inputs, not a reason to hardcode unknown criteria or block the configurable design.

## 8. Data protection and child-safety boundaries

- No guardian account or shared member login is introduced.
- If a minor-programme requirement calls for parent/guardian cooperation, consent or a safety record, capture only the minimum evidence through an authorized adult/staff workflow. The guardian is not given a DYMS member account by this design.
- Background-check results and child-protection evidence are highly sensitive. Prefer a verified outcome, authority, date and restricted evidence reference over storing raw investigation details.
- Only designated authorized reviewers should access sensitive evidence.
- Credential evidence is private by default. Public verification returns only approved credential status and minimal disclosure fields.
- No credential evidence, personal identity data, background-check data or safeguarding information is stored on-chain.

## 9. Decisions required before credential catalogue approval

1. Which exact member category labels are used for Junior Youth, Senior Youth, and any other categories in DYMS v1?
2. Which GC or WAD/Union/Conference age/grade adaptations apply to Sango District, and what source/version/effective date governs each?
3. How is the 21-versus-22 Young Adult boundary resolved for the applicable field?
4. Does DYMS store Adventurer and Pathfinder class completion as credential achievements under ODR-009, or as a separate achievement record type?
5. Which honors/awards are included in the initial catalogue?
6. Which recognized offices/roles may issue, review and revoke Master Guide and SYL credentials?
7. Which evidence fields are mandatory, who may access them, and what evidence is stored versus externally verified?
8. Which credential definitions have a validity period, and which remain valid indefinitely until revocation?
9. How are source updates/version changes handled without altering historic issued credentials?
10. What is the approved disclosure/verification view for each credential type?

## 10. Disposition

- Official source entries recorded: **11**.
- Candidate ministry/category mappings: **7**.
- Candidate credential/achievement types: **5**.
- Exact age/grade rules hardcoded: **0**.
- Credential validity periods invented: **0**.
- New database tables/columns/FKs or seeds: **0**.
- CPERD-14 status: **EVIDENCE MATRIX PREPARED; LOCAL SOURCE ADAPTATION AND OWNER CATALOGUE SELECTION REQUIRED**.
- Implementation authorization: **NOT GRANTED**.

This matrix is a design evidence artifact. It does not approve credential definitions, create eligibility rules, change member categories, issue credentials, modify the physical ERD, or authorize implementation.
