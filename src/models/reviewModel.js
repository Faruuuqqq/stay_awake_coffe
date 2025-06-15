// src/models/reviewModel.js
const db = require('../config/db');

// Objek Review berisi semua fungsi interaksi database untuk ulasan
const Review = {
    /**
     * Menciptakan ulasan baru.
     * @param {Object} reviewData - Data ulasan ({ user_id, product_id, rating, comment }).
     * @returns {Promise<number>} ID ulasan yang baru dibuat.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    create: async ({ user_id, product_id, rating, comment }) => { // Renamed from createReview
        try {
            const [result] = await db.query(
                'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
                [user_id, product_id, rating, comment]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating review in DB:', error.message);
            throw new Error('Database error: Failed to create review');
        }
    },

    /**
     * Mengambil ulasan berdasarkan ID produk.
     * @param {number} productId - ID produk.
     * @returns {Promise<Array>} Array objek ulasan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findByProductId: async (productId) => { // Renamed from getReviewsByProductId
        try {
            const [rows] = await db.query(
                `SELECT r.*, u.username as user_name, u.email as user_email
                FROM reviews r
                JOIN users u ON r.user_id = u.user_id
                WHERE r.product_id = ?
                ORDER BY r.created_at DESC`,
                [productId]
            );
            return rows;
        } catch (error) {
            console.error(`Error fetching reviews for product ID ${productId} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch reviews by product ID');
        }
    },

    /**
     * Menghapus ulasan berdasarkan ID.
     * @param {number} reviewId - ID ulasan.
     * @returns {Promise<boolean>} True jika ulasan berhasil dihapus, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    delete: async (reviewId) => { // Renamed from deleteReview
        try {
            const [result] = await db.query(
                `DELETE FROM reviews WHERE review_id = ?`,
                [reviewId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error deleting review ID ${reviewId} from DB:`, error.message);
            throw new Error('Database error: Failed to delete review');
        }
    },

    /**
     * Mengambil ulasan berdasarkan ID.
     * @param {number} reviewId - ID ulasan.
     * @returns {Promise<Object|null>} Objek ulasan jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findById: async (reviewId) => { // Retained or added as findById
        try {
            const [rows] = await db.query(
                `SELECT * FROM reviews WHERE review_id = ?`,
                [reviewId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error(`Error finding review by ID ${reviewId} from DB:`, error.message);
            throw new Error('Database error: Failed to find review by ID');
        }
    },

    /**
     * Mengambil ulasan berdasarkan ID pengguna dan ID produk.
     * Berguna untuk memastikan pengguna hanya dapat memberikan satu ulasan per produk, atau memperbarui ulasan yang sudah ada.
     * @param {number} userId - ID pengguna.
     * @param {number} productId - ID produk.
     * @returns {Promise<Object|null>} Objek ulasan jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findByUserAndProduct: async (userId, productId) => {
        try {
            const [rows] = await db.query(
                `SELECT * FROM reviews WHERE user_id = ? AND product_id = ?`,
                [userId, productId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error(`Error finding review by user ID ${userId} and product ID ${productId} from DB:`, error.message);
            throw new Error('Database error: Failed to find review by user and product');
        }
    },

    /**
     * Memperbarui ulasan yang sudah ada.
     * @param {number} reviewId - ID ulasan yang akan diperbarui.
     * @param {Object} updateData - Data yang akan diperbarui ({ rating, comment }).
     * @returns {Promise<boolean>} True jika ulasan berhasil diperbarui, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    update: async (reviewId, { rating, comment }) => {
        try {
            const [result] = await db.query(
                `UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ?`,
                [rating, comment, reviewId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating review ID ${reviewId} in DB:`, error.message);
            throw new Error('Database error: Failed to update review');
        }
    }
};

module.exports = Review;
