CREATE TYPE "public"."wallet_type" AS ENUM('CASH', 'BANK', 'MOBILE_MONEY');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('INCOME', 'EXPENSE', 'TRANSFER');--> statement-breakpoint
CREATE TABLE "pocket_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(80) NOT NULL,
	"type" "wallet_type" NOT NULL,
	"provider" varchar(120),
	"balance" numeric(14, 2) DEFAULT '0' NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pocket_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(30) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pocket_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"source_wallet_id" uuid,
	"destination_wallet_id" uuid,
	"activity_id" uuid,
	"description" text,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pocket_wallets" ADD CONSTRAINT "pocket_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pocket_activities" ADD CONSTRAINT "pocket_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pocket_transactions" ADD CONSTRAINT "pocket_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pocket_transactions" ADD CONSTRAINT "pocket_transactions_source_wallet_id_pocket_wallets_id_fk" FOREIGN KEY ("source_wallet_id") REFERENCES "public"."pocket_wallets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pocket_transactions" ADD CONSTRAINT "pocket_transactions_destination_wallet_id_pocket_wallets_id_fk" FOREIGN KEY ("destination_wallet_id") REFERENCES "public"."pocket_wallets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pocket_transactions" ADD CONSTRAINT "pocket_transactions_activity_id_pocket_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."pocket_activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pocket_wallets_user_idx" ON "pocket_wallets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pocket_activities_user_idx" ON "pocket_activities" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pocket_activities_user_name_idx" ON "pocket_activities" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "pocket_transactions_user_idx" ON "pocket_transactions" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "pocket_transactions_source_wallet_idx" ON "pocket_transactions" USING btree ("source_wallet_id");--> statement-breakpoint
CREATE INDEX "pocket_transactions_destination_wallet_idx" ON "pocket_transactions" USING btree ("destination_wallet_id");--> statement-breakpoint
CREATE INDEX "pocket_transactions_activity_idx" ON "pocket_transactions" USING btree ("activity_id");