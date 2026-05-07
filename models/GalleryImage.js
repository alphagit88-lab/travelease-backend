const pool = require('../config/database');

class GalleryImage {
  static async findAll({ activeOnly = false } = {}) {
    const where = activeOnly ? 'WHERE is_active = TRUE' : '';
    const result = await pool.query(
      `SELECT g.id, g.title, g.description, g.image_url, g.sort_order,
              g.is_active, g.uploaded_by, g.created_at, g.updated_at,
              u.name AS uploaded_by_name
       FROM gallery_images g
       LEFT JOIN users u ON g.uploaded_by = u.id
       ${where}
       ORDER BY g.sort_order ASC, g.created_at DESC`
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT g.id, g.title, g.description, g.image_url, g.sort_order,
              g.is_active, g.uploaded_by, g.created_at, g.updated_at,
              u.name AS uploaded_by_name
       FROM gallery_images g
       LEFT JOIN users u ON g.uploaded_by = u.id
       WHERE g.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async create({ title, description, image_url, sort_order = 0, is_active = true, uploaded_by }) {
    const result = await pool.query(
      `INSERT INTO gallery_images (title, description, image_url, sort_order, is_active, uploaded_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [title || null, description || null, image_url, sort_order, is_active, uploaded_by || null]
    );
    return result.rows[0];
  }

  static async update(id, { title, description, sort_order, is_active }) {
    const updates = [];
    const values = [];
    let p = 1;

    if (title !== undefined)      { updates.push(`title = $${p++}`);      values.push(title); }
    if (description !== undefined){ updates.push(`description = $${p++}`);values.push(description); }
    if (sort_order !== undefined)  { updates.push(`sort_order = $${p++}`); values.push(sort_order); }
    if (is_active !== undefined)   { updates.push(`is_active = $${p++}`);  values.push(is_active); }

    if (updates.length === 0) return this.findById(id);

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE gallery_images SET ${updates.join(', ')} WHERE id = $${p} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      `DELETE FROM gallery_images WHERE id = $1 RETURNING id, image_url`,
      [id]
    );
    return result.rows[0];
  }

  // Bulk reorder — expects [{ id, sort_order }, ...]
  static async reorder(items) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        await client.query(
          `UPDATE gallery_images SET sort_order = $1, updated_at = NOW() WHERE id = $2`,
          [item.sort_order, item.id]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = GalleryImage;
