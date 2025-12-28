CREATE TYPE "public"."marital_status" AS ENUM('single', 'married', 'divorced', 'widowed');--> statement-breakpoint
CREATE TYPE "public"."title" AS ENUM('Mr', 'Mstr', 'Mrs', 'Miss', 'Infant');--> statement-breakpoint
ALTER TYPE "public"."room_type" ADD VALUE 'queen';--> statement-breakpoint
ALTER TABLE "jamaah" ADD COLUMN "title" "title";--> statement-breakpoint
ALTER TABLE "jamaah" ADD COLUMN "marital_status" "marital_status";