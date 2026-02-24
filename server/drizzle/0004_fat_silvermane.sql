ALTER TABLE "meetings" ADD COLUMN "direct_join_permission" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "mute_permission" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "screen_share_permission" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "drop_permission" boolean DEFAULT false NOT NULL;