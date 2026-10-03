const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initializeDatabase() {
  console.log('🔄 Initializing Store Rating Portal Database...');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'manager',
    multipleStatements: true,
  };

  try {
    // 1. Connect without database to ensure DB creation
    const rootConnection = await mysql.createConnection(dbConfig);
    const dbName = process.env.DB_NAME || 'store_rating_portal';
    
    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`✅ Database "${dbName}" checked/created.`);
    await rootConnection.end();

    // 2. Connect with database
    const connection = await mysql.createConnection({
      ...dbConfig,
      database: dbName,
    });

    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(60) NOT NULL,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`address\` VARCHAR(400) NOT NULL,
        \`role\` ENUM('ADMIN', 'USER', 'OWNER') NOT NULL DEFAULT 'USER',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_users_role\` (\`role\`),
        INDEX \`idx_users_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS \`stores\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(60) NOT NULL,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`address\` VARCHAR(400) NOT NULL,
        \`owner_id\` INT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_stores_owner\` (\`owner_id\`),
        CONSTRAINT \`fk_stores_owner\` 
          FOREIGN KEY (\`owner_id\`) REFERENCES \`users\` (\`id\`) 
          ON DELETE SET NULL 
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS \`ratings\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`store_id\` INT NOT NULL,
        \`rating\` TINYINT UNSIGNED NOT NULL CHECK (\`rating\` BETWEEN 1 AND 5),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_user_store\` (\`user_id\`, \`store_id\`),
        INDEX \`idx_ratings_store\` (\`store_id\`),
        INDEX \`idx_ratings_user\` (\`user_id\`),
        CONSTRAINT \`fk_ratings_user\` 
          FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) 
          ON DELETE CASCADE 
          ON UPDATE CASCADE,
        CONSTRAINT \`fk_ratings_store\` 
          FOREIGN KEY (\`store_id\`) REFERENCES \`stores\` (\`id\`) 
          ON DELETE CASCADE 
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tables users, stores, ratings ensured.');

    // Check if admin already exists
    const [existingAdmin] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@storerating.com']
    );

    if (existingAdmin.length === 0) {
      console.log('🌱 Seeding demo accounts and stores...');
      const adminPass = await bcrypt.hash('Admin@123', 10);
      const ownerPass = await bcrypt.hash('Owner@123', 10);
      const userPass = await bcrypt.hash('User@123', 10);

      // Seed Users
      const usersToInsert = [
        ['System Administrator Root', 'admin@storerating.com', adminPass, '742 Evergreen Terrace, Springfield, OR 97477', 'ADMIN'],
        ['Marcus Aurelius Montgomery', 'marcus.owner@storerating.com', ownerPass, '100 Ocean Avenue, Santa Monica, CA 90401', 'OWNER'],
        ['Sophia Isabella Harrington', 'sophia.owner@storerating.com', ownerPass, '456 Grand Avenue, Chicago, IL 60611', 'OWNER'],
        ['Alexandria Morgan Taylor', 'alexandria@storerating.com', userPass, '123 Pine Street, Seattle, WA 98101', 'USER'],
        ['Jonathan Edward Henderson', 'jonathan@storerating.com', userPass, '789 Maple Drive, Austin, TX 78701', 'USER'],
        ['Christopher David Robinson', 'christopher@storerating.com', userPass, '555 Elm Boulevard, Denver, CO 80202', 'USER']
      ];

      for (const u of usersToInsert) {
        await connection.query(
          'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
          u
        );
      }

      // Retrieve owner IDs
      const [marcus] = await connection.query('SELECT id FROM users WHERE email = ?', ['marcus.owner@storerating.com']);
      const [sophia] = await connection.query('SELECT id FROM users WHERE email = ?', ['sophia.owner@storerating.com']);
      const [alex] = await connection.query('SELECT id FROM users WHERE email = ?', ['alexandria@storerating.com']);
      const [jon] = await connection.query('SELECT id FROM users WHERE email = ?', ['jonathan@storerating.com']);
      const [chris] = await connection.query('SELECT id FROM users WHERE email = ?', ['christopher@storerating.com']);

      const marcusId = marcus[0]?.id || null;
      const sophiaId = sophia[0]?.id || null;

      // Seed Stores
      const storesToInsert = [
        ['Starlight Artisanal Bakery', 'contact@starlightbakery.com', '100 Ocean Avenue, Suite A, Santa Monica, CA 90401', marcusId],
        ['Apex Horizon Electronics Hub', 'support@apexhorizon.com', '456 Grand Avenue, Floor 2, Chicago, IL 60611', sophiaId],
        ['Green Meadows Organic Grocer', 'hello@greenmeadows.com', '880 Highland Park Blvd, Portland, OR 97201', null],
        ['Urban Velvet Fashion Boutique', 'orders@urbanvelvet.com', '312 Fifth Avenue, New York, NY 10001', null]
      ];

      for (const s of storesToInsert) {
        await connection.query(
          'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
          s
        );
      }

      // Retrieve store IDs
      const [bakery] = await connection.query('SELECT id FROM stores WHERE email = ?', ['contact@starlightbakery.com']);
      const [electronics] = await connection.query('SELECT id FROM stores WHERE email = ?', ['support@apexhorizon.com']);
      const [grocer] = await connection.query('SELECT id FROM stores WHERE email = ?', ['hello@greenmeadows.com']);

      const bId = bakery[0]?.id;
      const eId = electronics[0]?.id;
      const gId = grocer[0]?.id;

      if (bId && eId && gId && alex[0] && jon[0] && chris[0]) {
        const ratingsToInsert = [
          [alex[0].id, bId, 5],
          [jon[0].id, bId, 4],
          [chris[0].id, bId, 5],
          [alex[0].id, eId, 4],
          [jon[0].id, eId, 3],
          [chris[0].id, gId, 5]
        ];

        for (const r of ratingsToInsert) {
          await connection.query(
            'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating=VALUES(rating)',
            r
          );
        }
      }
      console.log('✅ Demo accounts, stores, and ratings seeded successfully!');
    } else {
      console.log('ℹ️ Admin user already exists. Seeding skipped.');
    }

    await connection.end();
    console.log('🚀 Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initializeDatabase;
