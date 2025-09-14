require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const bcrypt = require('bcryptjs');

async function migrate() {
  try {
    console.log('Starting migration...');

    // Create tenants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        subscription_plan VARCHAR(50) DEFAULT 'free',
        notes_created_count INTEGER DEFAULT 0,
        trial_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        tenant_id INTEGER REFERENCES tenants(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        tenant_id INTEGER REFERENCES tenants(id),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create upgrade requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS upgrade_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        tenant_id INTEGER REFERENCES tenants(id),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add new columns if they don't exist
    await pool.query(`
      ALTER TABLE tenants 
      ADD COLUMN IF NOT EXISTS notes_created_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE
    `);

    // Seed tenants
    await pool.query(`
      INSERT INTO tenants (name, slug, subscription_plan, notes_created_count, trial_used) 
      VALUES 
        ('Acme Corp', 'acme', 'free', 0, FALSE),
        ('Globex Corporation', 'globex', 'free', 0, FALSE)
      ON CONFLICT (slug) DO NOTHING
    `);

    // Get tenant IDs
    const acmeResult = await pool.query('SELECT id FROM tenants WHERE slug = $1', ['acme']);
    const globexResult = await pool.query('SELECT id FROM tenants WHERE slug = $1', ['globex']);
    
    const acmeId = acmeResult.rows[0].id;
    const globexId = globexResult.rows[0].id;

    // Hash password
    const hashedPassword = await bcrypt.hash('password', 10);

    // Seed users
    await pool.query(`
      INSERT INTO users (email, password, role, tenant_id) 
      VALUES 
        ('admin@acme.test', $1, 'admin', $2),
        ('user@acme.test', $1, 'member', $2),
        ('admin@globex.test', $1, 'admin', $3),
        ('user@globex.test', $1, 'member', $3)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword, acmeId, globexId]);

    console.log('Migration completed successfully!');
    console.log('Test users created:');
    console.log('- admin@acme.test (password: password)');
    console.log('- user@acme.test (password: password)');
    console.log('- admin@globex.test (password: password)');
    console.log('- user@globex.test (password: password)');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;