-- Initial database setup for ARG Finance
-- This file runs automatically when the PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE arg_finance TO postgres;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'ARG Finance database initialized successfully!';
END $$;
