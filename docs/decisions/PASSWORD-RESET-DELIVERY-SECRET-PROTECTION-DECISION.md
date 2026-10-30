# AUTH-IDEM-039: Password-Reset Delivery Secret Protection

**Status:** Approved by product owner  
**Date:** 2026-10-30  
**Scope:** Secret handling between password-reset token creation and asynchronous delivery

## Decision

1. The transactional outbox and BullMQ job payload must contain only an opaque reference to a protected, short-lived reset-delivery secret. They must not contain a raw reset token, reset URL containing the token, or other recoverable credential.
2. Store the delivery secret separately in a protected secret store. Protect it using envelope encryption backed by a managed deployment secret/key-management facility. Encryption keys and plaintext secrets must not be committed to source control.
3. Only the password-reset delivery worker/service identity receives the minimum permission required to retrieve and decrypt the referenced secret. Ordinary application users, general queue consumers, logs, traces, audit records, and error reports must not expose it.
4. The protected secret's lifetime must not exceed the associated password-reset token's approved 30-minute lifetime. Expire or erase the secret when delivery succeeds or when the reset token expires or is revoked, whichever occurs first.
5. Delivery retries may retrieve the same protected secret while it remains valid. Retries must not create a new reset token or extend its expiry. After expiry or erasure, delivery must stop and the user must request a new reset.
6. Record delivery state and security-relevant outcomes without recording the secret. Access to the protected secret store must be restricted and auditable.
7. The outbox record must retain only the opaque reference and the minimum delivery metadata needed for reliable processing. Define safe cleanup for orphaned references and failed/expired deliveries in the implementation contract.

## Rationale

Password-reset delivery is asynchronous, but the reset token is a bearer secret. An opaque outbox reference plus separately encrypted storage permits reliable delivery without placing credentials in queue payloads or ordinary operational data.

## Constraints

This decision approves the protection policy, not a specific vendor or product. The exact secret-store technology, key-management integration, failure recovery, and deletion mechanics must be specified before implementation. No Prisma schema, migration, or implementation is authorized by this decision alone.
