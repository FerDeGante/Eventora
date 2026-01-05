-- Bloom Database Initialization Script
-- Este script se ejecuta automáticamente cuando el contenedor de Postgres se crea por primera vez

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema if not exists (Prisma usa 'public' por defecto)
CREATE SCHEMA IF NOT EXISTS public;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO bloom;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bloom;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bloom;

-- Set default permissions for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bloom;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bloom;

-- Create a function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE '✅ Bloom database initialized successfully';
    RAISE NOTICE '📊 User: bloom';
    RAISE NOTICE '🗄️  Database: bloom_dev';
    RAISE NOTICE '🔧 Extensions: uuid-ossp, pgcrypto';
END $$;
