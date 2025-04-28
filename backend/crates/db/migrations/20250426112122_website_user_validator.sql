-- Create WebsiteStatus enum
CREATE TYPE "WebsiteStatus" AS ENUM ('Good', 'Bad');

-- Create Users table
CREATE TABLE users (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    CONSTRAINT "users_email_unique" UNIQUE ("email")
);

-- Create Websites table
CREATE TABLE websites (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "fk_websites_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create Validators table
CREATE TABLE validators (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "public_key" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "pending_payouts" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "validators_public_key_unique" UNIQUE ("public_key")
);

-- Create WebsiteTicks table
CREATE TABLE website_ticks (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "validator_id" UUID NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "status" "WebsiteStatus" NOT NULL,
    "latency" FLOAT NOT NULL,
    CONSTRAINT "fk_website_ticks_website_id" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_website_ticks_validator_id" FOREIGN KEY ("validator_id") REFERENCES "validators"("id") ON DELETE CASCADE
);

-- Create indexes for common queries and foreign keys
CREATE INDEX "idx_websites_user_id" ON "websites"("user_id");
CREATE INDEX "idx_website_ticks_website_id" ON "website_ticks"("website_id");
CREATE INDEX "idx_website_ticks_validator_id" ON "website_ticks"("validator_id");
CREATE INDEX "idx_website_ticks_created_at" ON "website_ticks"("created_at");