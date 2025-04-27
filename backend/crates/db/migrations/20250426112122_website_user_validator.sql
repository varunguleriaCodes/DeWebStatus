--WebsiteStatus enum
CREATE TYPE WebsiteStatus AS ENUM ('Good', 'Bad');

-- User table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    password TEXT NOT NULL
);

-- Website table
CREATE TABLE website (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    user_id UUID NOT NULL,
    disabled BOOLEAN DEFAULT FALSE
);

-- Validator table
CREATE TABLE validator (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_key TEXT NOT NULL,
    location TEXT NOT NULL,
    ip TEXT NOT NULL,
    pending_payouts INT DEFAULT 0
);

-- WebsiteTick table
CREATE TABLE website_tick (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL,
    validator_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    status WebsiteStatus NOT NULL,
    latency FLOAT8 NOT NULL,
    CONSTRAINT fk_website FOREIGN KEY (website_id) REFERENCES website(id) ON DELETE CASCADE,
    CONSTRAINT fk_validator FOREIGN KEY (validator_id) REFERENCES validator(id) ON DELETE CASCADE
);

-- Indexers
CREATE INDEX idx_website_user_id ON website (user_id);
CREATE INDEX idx_website_tick_website_id ON website_tick (website_id);
CREATE INDEX idx_website_tick_validator_id ON website_tick (validator_id);
