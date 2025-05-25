const db = require('../config/db');

exports.createReview = async ({ user_id, product_id, rating, comment }) => {
  try {
    const [result] = await db.query(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id, product_id, rating, comment]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Error creating review: ' + error.message);
  }
}

exports.getReviewsByProductId = async (product_id) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.product_id = ?
      ORDER By r.created_at DESC`,
      [product_id]
    );
    return rows;
  } catch (error) {
    throw new Error('Error fetching reviews: ' + error.message);
  }
};

exports.deleteReview = async (review_id) => {
  try {
    const [result] = await db.query(
      `DELETE FROM reviews WHERE review_id = ?`,
      [review_id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Error deleting review: ' + error.message);
  }
};

exports.findReviewById = async (review_id) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM reviews WHERE review_id = ?`,
      [review_id]
    );
    return rows[0] || null;
  } catch (error) {
    throw new Error('Error finding review: ' + error.message);
  }
};