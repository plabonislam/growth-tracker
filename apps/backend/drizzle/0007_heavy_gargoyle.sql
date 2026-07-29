CREATE TYPE "public"."topic_status" AS ENUM('draft', 'published');--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "status" "topic_status" DEFAULT 'draft' NOT NULL;