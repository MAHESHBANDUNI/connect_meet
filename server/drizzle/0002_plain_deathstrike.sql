ALTER TABLE "meeting_participants" DROP CONSTRAINT "meeting_participants_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "meeting_participants" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;