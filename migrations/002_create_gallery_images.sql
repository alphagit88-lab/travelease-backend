-- Migration 002: Create gallery_images table
-- Stores images uploaded by admin for the home page slider/gallery

CREATE TABLE IF NOT EXISTS gallery_images (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for active images ordered by sort_order (used in home slider query)
CREATE INDEX IF NOT EXISTS idx_gallery_images_active ON gallery_images(is_active, sort_order);
