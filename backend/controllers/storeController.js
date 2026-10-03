const pool = require('../config/db');

// GET /api/stores
// Allows normal users and guests to view stores with search by name & address, sorting,
// and shows user's own submitted rating if authenticated
const getAllStores = async (req, res) => {
  try {
    const { search, name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    const allowedSortFields = {
      name: 's.name',
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
        ROUND(AVG(r.rating), 1) AS overall_rating,
        COUNT(r.id) AS total_ratings
    `;

    const params = [];

    if (currentUserId) {
      query += `, (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id LIMIT 1) AS user_rating `;
      params.push(currentUserId);
    } else {
      query += `, NULL AS user_rating `;
    }

    query += `
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;

    // General search or specific name/address filters
    if (search) {
      query += ' AND (s.name LIKE ? OR s.address LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name.trim()}%`);
    }

    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address.trim()}%`);
    }

    query += `
      GROUP BY s.id
      ORDER BY ${sortColumn} ${direction}
    `;

    const [rows] = await pool.query(query, params);

    const stores = rows.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      overallRating: s.overall_rating !== null ? parseFloat(s.overall_rating) : null,
      totalRatings: s.total_ratings,
      userRating: s.user_rating !== null ? parseInt(s.user_rating, 10) : null
    }));

    return res.status(200).json({
      success: true,
      count: stores.length,
      stores
    });
  } catch (error) {
    console.error('Error fetching stores for users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch stores.'
    });
  }
};

module.exports = {
  getAllStores
};
