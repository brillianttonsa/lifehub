-- --- 1. CORE USER TABLE ---
CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT UNIQUE NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- --- 2. POCKET: WALLET TABLE ---
-- Everything belongs directly to the userId
CREATE TABLE "Wallet" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "User"("id"),
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- CASH, BANK, MOBILE_MONEY
    "provider" TEXT, -- AIRTEL, TIGO, NMB, etc.
    "currency_code" TEXT NOT NULL DEFAULT 'TZS',
    "balance" DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- --- 3. POCKET: CATEGORIES ---
CREATE TABLE "PocketCategory" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "User"("id"),
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- INCOME, EXPENSE, TRANSFER
    "parent_id" UUID REFERENCES "PocketCategory"("id"),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- --- 4. POCKET: TRANSACTIONS ---
CREATE TABLE "PocketTransaction" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "User"("id"),
    "kind" TEXT NOT NULL, -- INCOME, EXPENSE, TRANSFER
    "amount" DECIMAL(18, 2) NOT NULL,
    "currency_code" TEXT NOT NULL DEFAULT 'TZS',
    "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "description" TEXT,
    "source_wallet_id" UUID REFERENCES "Wallet"("id"),
    "destination_wallet_id" UUID REFERENCES "Wallet"("id"),
    "category_id" UUID REFERENCES "PocketCategory"("id"),
    "reference_code" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- --- 5. POCKET: WALLET LEDGER ENTRIES ---
CREATE TABLE "WalletLedgerEntry" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "User"("id"),
    "wallet_id" UUID NOT NULL REFERENCES "Wallet"("id"),
    "transaction_id" UUID NOT NULL REFERENCES "PocketTransaction"("id"),
    "entry_type" TEXT NOT NULL, -- DEBIT, CREDIT
    "amount" DECIMAL(18, 2) NOT NULL,
    "balance_before" DECIMAL(18, 2) NOT NULL,
    "balance_after" DECIMAL(18, 2) NOT NULL,
    "recorded_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --- INDEXES FOR PERFORMANCE ---
-- Essential for keeping queries fast as the transaction history grows
CREATE INDEX idx_wallet_user ON "Wallet"("user_id");
CREATE INDEX idx_transaction_user ON "PocketTransaction"("user_id");
CREATE INDEX idx_ledger_transaction_user ON "WalletLedgerEntry"("transaction_id", "user_id");

-- --- 6. HABITS (PERSONAL DOMAIN) ---
-- Habit sets group habits and define an active cycle window.
CREATE TABLE "HabitSet" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "User"("id"),
    "title" TEXT NOT NULL,
    "goal_description" TEXT,
    "cycle_unit" TEXT NOT NULL, -- DAY, WEEK, MONTH
    "cycle_length" INT NOT NULL,
    "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CLOSED, ARCHIVED
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE "Habit" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "User"("id"),
    "habit_set_id" UUID NOT NULL REFERENCES "HabitSet"("id"),
    "name" TEXT NOT NULL,
    "target_count_per_day" INT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE "HabitCheckin" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "User"("id"),
    "habit_id" UUID NOT NULL REFERENCES "Habit"("id"),
    "checkin_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" TEXT NOT NULL, -- DONE, NOT_DONE
    "note" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_habit_checkin_unique ON "HabitCheckin"("habit_id", "checkin_date");
CREATE INDEX idx_habitset_user ON "HabitSet"("user_id");
CREATE INDEX idx_habit_user ON "Habit"("user_id");
CREATE INDEX idx_habitcheck_user ON "HabitCheckin"("user_id");

-- --- 7. PLANS (PERSONAL DOMAIN) ---
CREATE TABLE "Plan" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "User"("id"),
    "type" TEXT NOT NULL, -- DAILY, WEEKLY, MONTHLY, YEARLY
    "title" TEXT NOT NULL,
    "description" TEXT,
    "period_start" TIMESTAMP WITH TIME ZONE NOT NULL,
    "period_end" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, DONE, CANCELLED
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE "PlanItem" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "User"("id"),
    "plan_id" UUID NOT NULL REFERENCES "Plan"("id"),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO', -- TODO, DOING, DONE, SKIPPED
    "due_date" TIMESTAMP WITH TIME ZONE,
    "is_recurring" BOOLEAN NOT NULL DEFAULT FALSE,
    "recurrence_rule" TEXT,
    "lifetime_preset" TEXT, -- DAYS, WEEK, MONTH, RANGE
    "lifetime_value" INT,
    "lifetime_start" TIMESTAMP WITH TIME ZONE,
    "lifetime_end" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_plan_user ON "Plan"("user_id");
CREATE INDEX idx_planitem_user ON "PlanItem"("user_id");
CREATE INDEX idx_planitem_plan ON "PlanItem"("plan_id");


-- user
CREATE TABLE "User" (
    "id" PRIMARY KEY DEFAULT,
    "email" TEXT UNIQUE NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP WITH TIME ZONE
);


ALTER TABLE "User"
ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE "User"
ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE "AuthSesion"
ALTER COLUMN created_at SET DEFAULT NOW();