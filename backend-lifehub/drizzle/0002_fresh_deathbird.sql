CREATE TYPE "public"."discipline_cycle_status" AS ENUM('active', 'completed', 'archived');--> statement-breakpoint
CREATE TABLE "discipline_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "discipline_cycle_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discipline_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"date" date NOT NULL,
	"is_done" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discipline_logs_task_date_unique" UNIQUE("task_id","date")
);
--> statement-breakpoint
CREATE TABLE "discipline_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "discipline_cycles" ADD CONSTRAINT "discipline_cycles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discipline_logs" ADD CONSTRAINT "discipline_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discipline_logs" ADD CONSTRAINT "discipline_logs_task_id_discipline_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."discipline_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discipline_tasks" ADD CONSTRAINT "discipline_tasks_cycle_id_discipline_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."discipline_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "discipline_cycles_user_idx" ON "discipline_cycles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "discipline_cycles_status_idx" ON "discipline_cycles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "discipline_logs_task_idx" ON "discipline_logs" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "discipline_logs_user_idx" ON "discipline_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "discipline_logs_date_idx" ON "discipline_logs" USING btree ("date");--> statement-breakpoint
CREATE INDEX "discipline_tasks_cycle_idx" ON "discipline_tasks" USING btree ("cycle_id");