const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/admin/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const [[usersCount]] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [[storesCount]] = await pool.query('SELECT COUNT(*) as count FROM stores');
    const [[ratingsCount]] = await pool.query('SELECT COUNT(*) as count FROM ratings');

    // Role breakdown
    const [roles] = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    const roleStats = { ADMIN: 0, USER: 0, OWNER: 0 };
    roles.forEach(r => {
      roleStats[r.role] = r.count;
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: usersCount.count,
        totalStores: storesCount.count,
        totalRatings: ratingsCount.count,
        roleStats
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.' });
  }
};

// POST /api/admin/users (Add new user: Admin, User, or Owner)
const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const userRole = role ? role.toUpperCase() : 'USER';

    if (!['ADMIN', 'USER', 'OWNER'].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be ADMIN, USER, or OWNER.'
      });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), password_hash, address.trim(), userRole]
    );

    return res.status(201).json({
      success: true,
      message: `${userRole} user created successfully!`,
      user: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        role: userRole
      }
    });
  } catch (error) {
    console.error('Error creating user by admin:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
};

// POST /api/admin/stores (Add new store)
const addStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A store with this email address already exists.'
      });
    }

    let validOwnerId = null;
    if (owner_id) {
      const [ownerRows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [owner_id]);
      if (ownerRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Selected store owner does not exist.'
        });
      }
      validOwnerId = ownerRows[0].id;
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), address.trim(), validOwnerId]
    );

    return res.status(201).json({
      success: true,
      message: 'Store added successfully!',
      store: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        owner_id: validOwnerId
      }
    });
  } catch (error) {
    console.error('Error creating store:', error);
    return res.status(500).json({ success: false, message: 'Failed to add store.' });
  }
};

// GET /api/admin/users
// Supports filtering by name, email, address, role
// Supports sorting by name, email, address, role, rating
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      rating: 'store_rating',
      created_at: 'u.created_at'
    };

    const sortColumn = allowedSortFields[sortBy.toLowerCase()] || 'u.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.created_at,
        s.id AS store_id,
        s.name AS store_name,
        ROUND(AVG(r.rating), 1) AS store_rating,
        COUNT(r.id) AS store_rating_count
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;

    const params = [];

    if (name) {
      query += ' AND u.name LIKE ?';
      params.push(`%${name.trim()}%`);
    }

    if (email) {
      query += ' AND u.email LIKE ?';
      params.push(`%${email.trim()}%`);
    }

    if (address) {
      query += ' AND u.address LIKE ?';
      params.push(`%${address.trim()}%`);
    }

    if (role && ['ADMIN', 'USER', 'OWNER'].includes(role.toUpperCase())) {
      query += ' AND u.role = ?';
      params.push(role.toUpperCase());
    }

    query += `
      GROUP BY u.id, s.id
      ORDER BY ${sortColumn} ${direction}
    `;

    const [rows] = await pool.query(query, params);

    const formattedUsers = rows.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      address: u.address,
      role: u.role,
      createdAt: u.created_at,
      store: u.role === 'OWNER' && u.store_id ? {
        id: u.store_id,
        name: u.store_name,
        rating: u.store_rating !== null ? parseFloat(u.store_rating) : null,
        ratingCount: u.store_rating_count
      } : null,
      rating: u.role === 'OWNER' ? (u.store_rating !== null ? parseFloat(u.store_rating) : 'No Ratings Yet') : null
    }));

    return res.status(200).json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// GET /api/admin/stores
// Supports filtering by name, email, address
// Supports sorting by name, email, address, rating
const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'overall_rating',
      created_at: 's.created_at'
    };

    const sortColumn = allowedSortFields[sortBy.toLowerCase()] || 's.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.created_at,
        u.id AS owner_id,
        u.name AS owner_name,
        u.email AS owner_email,
        ROUND(AVG(r.rating), 1) AS overall_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;

    const params = [];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name.trim()}%`);
    }

    if (email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${email.trim()}%`);
    }

    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address.trim()}%`);
    }

    query += `
      GROUP BY s.id, u.id
      ORDER BY ${sortColumn} ${direction}
    `;

    const [rows] = await pool.query(query, params);

    const formattedStores = rows.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      createdAt: s.created_at,
      overallRating: s.overall_rating !== null ? parseFloat(s.overall_rating) : null,
      totalRatings: s.total_ratings,
      owner: s.owner_id ? {
        id: s.owner_id,
        name: s.owner_name,
        email: s.owner_email
      } : null
    }));

    return res.status(200).json({
      success: true,
      stores: formattedStores
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch stores.' });
  }
};

// GET /api/admin/store-owners
const getStoreOwners = async (req, res) => {
  try {
    const [owners] = await pool.query(
      'SELECT id, name, email FROM users WHERE role = "OWNER" ORDER BY name ASC'
    );

    return res.status(200).json({
      success: true,
      owners
    });
  } catch (error) {
    console.error('Error fetching store owners:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch store owners.' });
  }
};

module.exports = {
  getDashboardStats,
  addUser,
  addStore,
  getUsers,
  getStores,
  getStoreOwners
};
