-- Migration 001: Create admin users table
-- Creates the users table with admin role support and seeds a default admin

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for role filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Seed default admin user if none exists
-- Password: Test@123  =>  bcrypt hash below
INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
SELECT
    'System Admin'     AS name,
    'admin@travelease.com' AS email,
    '$2b$10$gyaIpsIS1YQldLxRDRQcG.IOdVmYIxtOYWbYlQ4.zy4eQlFVA1gI6' AS password_hash,
    'admin'            AS role,
    NOW()              AS created_at,
    NOW()              AS updated_at
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'admin'
);
