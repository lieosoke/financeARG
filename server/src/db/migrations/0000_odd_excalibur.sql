CREATE TYPE "public"."user_role" AS ENUM('owner', 'finance', 'admin');--> statement-breakpoint
CREATE TYPE "public"."package_status" AS ENUM('open', 'closed', 'ongoing', 'completed');--> statement-breakpoint
CREATE TYPE "public"."package_type" AS ENUM('umroh', 'haji');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'dp', 'cicilan', 'lunas', 'dibatalkan');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('single', 'double', 'triple', 'quad');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('tiket_pesawat', 'hotel', 'transport', 'visa_handling', 'muthawif', 'konsumsi', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."income_category" AS ENUM('dp', 'cicilan', 'pelunasan', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('bank_bca', 'bank_mandiri', 'bank_bni', 'bank_bri', 'bank_syariah', 'cash', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('pemasukan', 'pengeluaran');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'paid', 'cancelled');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false,
	"name" text,
	"image" text,
	"role" "user_role" DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" "package_type" NOT NULL,
	"description" text,
	"price_per_person" numeric(15, 2) NOT NULL,
	"total_seats" integer NOT NULL,
	"booked_seats" integer DEFAULT 0,
	"departure_date" timestamp,
	"return_date" timestamp,
	"status" "package_status" DEFAULT 'open' NOT NULL,
	"estimated_cost" numeric(15, 2),
	"actual_cost" numeric(15, 2) DEFAULT '0',
	"hotel_makkah" text,
	"hotel_madinah" text,
	"airline" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" text,
	CONSTRAINT "packages_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "jamaah" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"nik" text,
	"passport_number" text,
	"passport_expiry" timestamp,
	"gender" "gender",
	"date_of_birth" timestamp,
	"place_of_birth" text,
	"phone" text,
	"email" text,
	"address" text,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"emergency_contact_relation" text,
	"package_id" text,
	"seat_number" integer,
	"total_amount" numeric(15, 2) NOT NULL,
	"paid_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"remaining_amount" numeric(15, 2),
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"room_type" "room_type",
	"room_number" text,
	"room_mate" text,
	"is_active" boolean DEFAULT true,
	"is_cancelled" boolean DEFAULT false,
	"cancellation_reason" text,
	"notes" text,
	"photo_url" text,
	"passport_scan_url" text,
	"ktp_scan_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" text
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"contact_person" text,
	"phone" text,
	"email" text,
	"address" text,
	"bank_account" text,
	"bank_name" text,
	"bank_account_holder" text,
	"npwp" text,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "transaction_type" NOT NULL,
	"income_category" "income_category",
	"expense_category" "expense_category",
	"amount" numeric(15, 2) NOT NULL,
	"package_id" text,
	"jamaah_id" text,
	"vendor_id" text,
	"payment_method" "payment_method",
	"reference_number" text,
	"bank_name" text,
	"description" text,
	"notes" text,
	"transaction_date" timestamp DEFAULT now() NOT NULL,
	"receipt_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_debts" (
	"id" text PRIMARY KEY NOT NULL,
	"vendor_id" text NOT NULL,
	"package_id" text,
	"description" text NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"paid_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"remaining_amount" numeric(15, 2),
	"due_date" timestamp,
	"status" text DEFAULT 'unpaid',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" text
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"jamaah_id" text NOT NULL,
	"package_id" text NOT NULL,
	"subtotal" numeric(15, 2) NOT NULL,
	"discount" numeric(15, 2) DEFAULT '0',
	"total" numeric(15, 2) NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"issue_date" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp,
	"paid_date" timestamp,
	"billing_address" text,
	"notes" text,
	"terms" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" text,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"user_email" text,
	"user_name" text,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"entity_name" text,
	"old_values" jsonb,
	"new_values" jsonb,
	"changes" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jamaah" ADD CONSTRAINT "jamaah_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jamaah" ADD CONSTRAINT "jamaah_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_jamaah_id_jamaah_id_fk" FOREIGN KEY ("jamaah_id") REFERENCES "public"."jamaah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_debts" ADD CONSTRAINT "vendor_debts_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_debts" ADD CONSTRAINT "vendor_debts_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_debts" ADD CONSTRAINT "vendor_debts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_jamaah_id_jamaah_id_fk" FOREIGN KEY ("jamaah_id") REFERENCES "public"."jamaah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;