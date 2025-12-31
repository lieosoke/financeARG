/*
CREATE TABLE "districts" (
	"id" text PRIMARY KEY NOT NULL,
	"regency_id" text NOT NULL,
	"name" text NOT NULL
);
*/
--> statement-breakpoint
/*
CREATE TABLE "provinces" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
*/
--> statement-breakpoint
/*
CREATE TABLE "regencies" (
	"id" text PRIMARY KEY NOT NULL,
	"province_id" text NOT NULL,
	"name" text NOT NULL
);
*/
--> statement-breakpoint
/*
CREATE TABLE "villages" (
	"id" text PRIMARY KEY NOT NULL,
	"district_id" text NOT NULL,
	"name" text NOT NULL
);
*/
--> statement-breakpoint
-- ALTER TABLE "districts" ADD CONSTRAINT "districts_regency_id_regencies_id_fk" FOREIGN KEY ("regency_id") REFERENCES "public"."regencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "regencies" ADD CONSTRAINT "regencies_province_id_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "villages" ADD CONSTRAINT "villages_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;