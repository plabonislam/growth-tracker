ALTER TABLE "clubs" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
CREATE UNIQUE INDEX "clubs_name_lower_unique" ON "clubs" USING btree (lower("name"));