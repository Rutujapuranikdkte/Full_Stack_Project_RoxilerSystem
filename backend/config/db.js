const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'manager',
  database: process.env.DB_NAME || 'store_rating_portal',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('✅ Connected to MySQL database pool successfully.');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to MySQL database pool:', err.message);
  });

module.exports = pool;
