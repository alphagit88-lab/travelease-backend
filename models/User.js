const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const result = await pool.query(
      `SELECT id, name, email, role, password_hash, created_at, updated_at
       FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at, updated_at
       FROM users ORDER BY created_at DESC`
    );
    return result.rows;
  }

  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, $3, 'admin', NOW(), NOW())
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword]
    );
    return result.rows[0];
  }

  static async update(id, { name, email }) {
    const updates = [];
    const values = [];
    let p = 1;

    if (name !== undefined) { updates.push(`name = $${p++}`); values.push(name); }
    if (email !== undefined) { updates.push(`email = $${p++}`); values.push(email); }

    if (updates.length === 0) return this.findById(id);

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${p}
       RETURNING id, name, email, role, created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  static async updatePassword(id, hashedPassword) {
    await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [hashedPassword, id]
    );
  }

  static async delete(id) {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0];
  }

  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }
}

module.exports = User;
