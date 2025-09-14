require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to database successfully!');
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();