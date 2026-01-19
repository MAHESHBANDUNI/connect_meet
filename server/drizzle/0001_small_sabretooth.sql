CREATE TABLE "meeting_participants" (
	"participant_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"user_id" uuid,
	"participant_role" text DEFAULT 'PARTICIPANT' NOT NULL,
	"participant_status" text DEFAULT 'INVITED' NOT NULL,
	"has_joined" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp,
	"left_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"meeting_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_code" text NOT NULL,
	"topic" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"status" text DEFAULT 'SCHEDULED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "meetings_meeting_code_unique" UNIQUE("meeting_code")
);
--> statement-breakpoint
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_meeting_id_meetings_meeting_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("meeting_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;