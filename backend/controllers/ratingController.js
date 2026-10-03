const pool = require('../config/db');

// POST /api/ratings (Submit or Modify Rating by Normal User)
const submitOrUpdateRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required.'
      });
    }

    // Verify store exists
    const [stores] = await pool.query('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.'
      });
    }

    // Check if user already submitted a rating
    const [existing] = await pool.query(
      'SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    const isUpdate = existing.length > 0;

    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP`,
      [userId, storeId, rating]
    );

    // Fetch updated store overall rating
    const [[stats]] = await pool.query(
      'SELECT ROUND(AVG(rating), 1) AS overall_rating, COUNT(id) AS total_ratings FROM ratings WHERE store_id = ?',
      [storeId]
    );

    return res.status(200).json({
      success: true,
      message: isUpdate ? 'Rating updated successfully!' : 'Rating submitted successfully!',
      rating,
      overallRating: stats.overall_rating !== null ? parseFloat(stats.overall_rating) : null,
      totalRatings: stats.total_ratings
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit rating.'
    });
  }
};

// GET /api/ratings/owner-dashboard (Store Owner Dashboard)
// Displays average rating and list of users who rated their store
const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { userName, userEmail, sortBy = 'date', sortOrder = 'DESC' } = req.query;

    // Fetch store owned by this user
    const [stores] = await pool.query(
      'SELECT id, name, email, address, created_at FROM stores WHERE owner_id = ?',
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        hasStore: false,
        message: 'No store has been assigned to your account yet. Please contact the administrator.',
        store: null,
        stats: { averageRating: 0, totalRatings: 0 },
        ratings: []
      });
    }

    const store = stores[0];

    // Compute store overall rating
    const [[stats]] = await pool.query(
      'SELECT ROUND(AVG(rating), 1) AS averageRating, COUNT(id) AS totalRatings FROM ratings WHERE store_id = ?',
      [store.id]
    );

    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      rating: 'r.rating',
      date: 'r.updated_at'
    };

    const sortColumn = allowedSortFields[sortBy.toLowerCase()] || 'r.updated_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let query = `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.address AS user_address
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = ?
    `;

    const params = [store.id];

    if (userName) {
      query += ' AND u.name LIKE ?';
      params.push(`%${userName.trim()}%`);
    }

    if (userEmail) {
      query += ' AND u.email LIKE ?';
      params.push(`%${userEmail.trim()}%`);
    }

    query += ` ORDER BY ${sortColumn} ${direction}`;

    const [ratings] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address
      },
      stats: {
        averageRating: stats.averageRating !== null ? parseFloat(stats.averageRating) : 0,
        totalRatings: stats.totalRatings || 0
      },
      ratings: ratings.map(r => ({
        id: r.id,
        rating: r.rating,
        submittedAt: r.created_at,
        updatedAt: r.updated_at,
        user: {
          id: r.user_id,
          name: r.user_name,
          email: r.user_email,
          address: r.user_address
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching owner dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch store dashboard.'
    });
  }
};

module.exports = {
  submitOrUpdateRating,
  getOwnerDashboard
};
