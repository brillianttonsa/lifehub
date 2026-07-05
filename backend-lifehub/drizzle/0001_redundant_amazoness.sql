CREATE TYPE "public"."cycle_status" AS ENUM('Active', 'Completed', 'Archived');--> statement-breakpoint
CREATE TYPE "public"."cycle_type" AS ENUM('Yearly', 'Half-Yearly', 'Quarterly', 'Monthly', 'Weekly', 'Custom');--> statement-breakpoint
CREATE TYPE "public"."goal_priority" AS ENUM('Low', 'Medium', 'High');--> statement-breakpoint
CREATE TYPE "public"."goal_status" AS ENUM('Pending', 'In Progress', 'Completed');--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"planning_cycle_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"priority" "goal_priority" DEFAULT 'Medium' NOT NULL,
	"status" "goal_status" DEFAULT 'Pending' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planning_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "cycle_type" DEFAULT 'Monthly' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "cycle_status" DEFAULT 'Active' NOT NULL,
	"archived_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "plans" CASCADE;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_planning_cycle_id_planning_cycles_id_fk" FOREIGN KEY ("planning_cycle_id") REFERENCES "public"."planning_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planning_cycles" ADD CONSTRAINT "planning_cycles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "goals_planning_cycle_idx" ON "goals" USING btree ("planning_cycle_id");--> statement-breakpoint
CREATE INDEX "goals_user_idx" ON "goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goals_status_idx" ON "goals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "goals_priority_idx" ON "goals" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "planning_cycles_user_idx" ON "planning_cycles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "planning_cycles_type_idx" ON "planning_cycles" USING btree ("type");--> statement-breakpoint
CREATE INDEX "planning_cycles_status_idx" ON "planning_cycles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "planning_cycles_start_date_idx" ON "planning_cycles" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "planning_cycles_end_date_idx" ON "planning_cycles" USING btree ("end_date");--> statement-breakpoint
DROP TYPE "public"."plan_priority";--> statement-breakpoint
DROP TYPE "public"."plan_status";--> statement-breakpoint
DROP TYPE "public"."plan_timeframe";