CREATE TABLE "user_accounts" (
  "id" UUID NOT NULL,
  "login_identifier" TEXT NOT NULL,
  "email" TEXT,
  "phone_e164" VARCHAR(20),
  "password_hash" TEXT NOT NULL,
  "status" VARCHAR(24) NOT NULL,
  "email_verified_at" TIMESTAMPTZ(6),
  "phone_verified_at" TIMESTAMPTZ(6),
  "last_login_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "uq_user_accounts_login_identifier" UNIQUE ("login_identifier"),
  CONSTRAINT "ck_user_accounts_status" CHECK ("status" IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED'))
);

CREATE UNIQUE INDEX "uq_user_accounts_phone_present"
  ON "user_accounts" ("phone_e164") WHERE "phone_e164" IS NOT NULL;

-- uq_user_accounts_email_present remains excluded. Its normalization expression is policy-blocked in CPERD-02.

CREATE TABLE "auth_sessions" (
  "id" UUID NOT NULL,
  "user_account_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "last_activity_at" TIMESTAMPTZ(6) NOT NULL,
  "inactivity_expires_at" TIMESTAMPTZ(6) NOT NULL,
  "absolute_expires_at" TIMESTAMPTZ(6) NOT NULL,
  "revoked_at" TIMESTAMPTZ(6),
  "revocation_reason" TEXT,
  "user_agent_summary" TEXT,
  "ip_address" INET,
  CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "uq_auth_sessions_id_user_account" UNIQUE ("id", "user_account_id"),
  CONSTRAINT "fk_auth_sessions_user_account_id" FOREIGN KEY ("user_account_id")
    REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "ck_auth_sessions_expiry_order" CHECK (
    "inactivity_expires_at" > "created_at"
    AND "absolute_expires_at" > "inactivity_expires_at"
  )
);

CREATE INDEX "ix_auth_sessions_account_expiry"
  ON "auth_sessions" ("user_account_id", "absolute_expires_at");

CREATE TABLE "auth_session_tokens" (
  "id" UUID NOT NULL,
  "auth_session_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "token_generation" INTEGER NOT NULL,
  "issued_at" TIMESTAMPTZ(6) NOT NULL,
  "consumed_at" TIMESTAMPTZ(6),
  "revoked_at" TIMESTAMPTZ(6),
  CONSTRAINT "auth_session_tokens_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "uq_auth_session_tokens_token_hash" UNIQUE ("token_hash"),
  CONSTRAINT "fk_auth_session_tokens_auth_session_id" FOREIGN KEY ("auth_session_id")
    REFERENCES "auth_sessions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "ck_auth_session_tokens_generation_positive" CHECK ("token_generation" > 0)
);

CREATE INDEX "ix_auth_session_tokens_session_generation"
  ON "auth_session_tokens" ("auth_session_id", "token_generation" DESC);

CREATE TABLE "password_reset_tokens" (
  "id" UUID NOT NULL,
  "user_account_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "consumed_at" TIMESTAMPTZ(6),
  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_password_reset_tokens_user_account_id" FOREIGN KEY ("user_account_id")
    REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "ck_password_reset_tokens_expiry_order" CHECK ("expires_at" > "created_at")
);

CREATE INDEX "ix_password_reset_tokens_account_expiry"
  ON "password_reset_tokens" ("user_account_id", "expires_at");

CREATE TABLE "pre_auth_contexts" (
  "id" UUID NOT NULL,
  "secret_digest" BYTEA,
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "consumed_at" TIMESTAMPTZ(6),
  "revoked_at" TIMESTAMPTZ(6),
  "secret_erased_at" TIMESTAMPTZ(6),
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "pre_auth_contexts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ck_pre_auth_contexts_expiry_window" CHECK (
    "expires_at" > "created_at"
    AND "expires_at" <= "created_at" + INTERVAL '10 minutes'
  ),
  CONSTRAINT "ck_pre_auth_contexts_secret_digest_shape" CHECK (
    ("secret_digest" IS NULL AND "secret_erased_at" IS NOT NULL)
    OR ("secret_digest" IS NOT NULL AND octet_length("secret_digest") = 32)
  )
);

CREATE UNIQUE INDEX "uq_pre_auth_contexts_secret_digest"
  ON "pre_auth_contexts" ("secret_digest") WHERE "secret_digest" IS NOT NULL;

CREATE INDEX "ix_pre_auth_contexts_expiry"
  ON "pre_auth_contexts" ("expires_at") WHERE "secret_digest" IS NOT NULL;

CREATE TABLE "audit_events" (
  "id" UUID NOT NULL,
  "district_id" UUID,
  "church_id" UUID,
  "department_id" UUID,
  "actor_type" VARCHAR(20) NOT NULL,
  "actor_user_account_id" UUID,
  "actor_service_principal_id" UUID,
  "initiating_user_account_id" UUID,
  "action" VARCHAR(100) NOT NULL,
  "target_type" VARCHAR(80) NOT NULL,
  "target_id" UUID,
  "occurred_at" TIMESTAMPTZ(6) NOT NULL,
  "reason" TEXT,
  "correlation_id" UUID,
  "safe_change_summary" JSONB,
  CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ck_audit_events_actor_type" CHECK ("actor_type" IN ('USER', 'SYSTEM', 'SERVICE', 'ANONYMOUS')),
  CONSTRAINT "ck_audit_events_actor_identity" CHECK (
    ("actor_type" = 'USER' AND "actor_user_account_id" IS NOT NULL AND "actor_service_principal_id" IS NULL)
    OR ("actor_type" = 'SERVICE' AND "actor_service_principal_id" IS NOT NULL AND "actor_user_account_id" IS NULL)
    OR ("actor_type" IN ('SYSTEM', 'ANONYMOUS') AND "actor_user_account_id" IS NULL AND "actor_service_principal_id" IS NULL)
  ),
  CONSTRAINT "fk_audit_events_actor_user" FOREIGN KEY ("actor_user_account_id")
    REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "fk_audit_events_initiating_user" FOREIGN KEY ("initiating_user_account_id")
    REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE INDEX "ix_audit_events_actor_user_time"
  ON "audit_events" ("actor_user_account_id", "occurred_at");
CREATE INDEX "ix_audit_events_target_time"
  ON "audit_events" ("target_type", "target_id", "occurred_at");
CREATE INDEX "ix_audit_events_correlation"
  ON "audit_events" ("correlation_id");
