const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
require('dotenv').config();

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log('🔄 Starting TravelEase migrations...\n');

  for (const file of files) {
    try {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`📄 Running migration: ${file}`);
      await pool.query(sql);
      console.log(`✅ Completed: ${file}\n`);
    } catch (error) {
      console.error(`❌ Error running migration ${file}:`, error.message);
      process.exit(1);
    }
  }

  console.log('✨ All migrations completed successfully!');
  await pool.end();
}

runMigrations();
