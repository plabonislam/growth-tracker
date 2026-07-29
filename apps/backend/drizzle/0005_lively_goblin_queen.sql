CREATE TYPE "public"."resource_kind" AS ENUM('video', 'doc');--> statement-breakpoint
ALTER TABLE "module_resources" ADD COLUMN "kind" "resource_kind" DEFAULT 'doc' NOT NULL;