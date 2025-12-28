-- ALTER TYPE "public"."user_role" ADD VALUE 'user';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user';