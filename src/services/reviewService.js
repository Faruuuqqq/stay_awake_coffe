// src/services/reviewService.js
const reviewModel = require('../models/reviewModel');
const productModel = require('../models/productModel'); // Untuk memastikan produk ada
const orderModel = require('../models/orderModel'); // Untuk memverifikasi pembelian produk
const Joi = require('joi');
const { ApiError, BadRequestError, NotFoundError, ForbiddenError } = require('../utils/ApiError');

// Skema Validasi Joi
const createReviewSchema = Joi.object({
    productId: Joi.number().integer().positive().required().messages({
        'number.base': 'Product ID harus berupa angka.',
        'number.integer': 'Product ID harus berupa integer.',
        'number.positive': 'Product ID harus angka positif.',
        'any.required': 'Product ID wajib diisi.'
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
        'number.base': 'Rating harus berupa angka.',
        'number.integer': 'Rating harus berupa integer.',
        'number.min': 'Rating minimal 1.',
        'number.max': 'Rating maksimal 5.',
        'any.required': 'Rating wajib diisi.'
    }),
    comment: Joi.string().trim().max(1000).allow('').messages({ // Komentar opsional
        'string.base': 'Komentar harus berupa string.',
        'string.max': 'Komentar maksimal {#limit} karakter.'
    })
});

const updateReviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).messages({
        'number.base': 'Rating harus berupa angka.',
        'number.integer': 'Rating harus berupa integer.',
        'number.min': 'Rating minimal 1.',
        'number.max': 'Rating maksimal 5.'
    }),
    comment: Joi.string().trim().max(1000).allow('')
}).min(1).messages({ // Setidaknya satu field harus ada untuk update
    'object.min': 'Setidaknya satu field (rating atau comment) harus disediakan untuk update ulasan.'
});

class ReviewService {
    /**
     * Menciptakan ulasan baru untuk produk.
     * Memverifikasi apakah pengguna telah membeli produk ini dan belum mereviewnya.
     * @param {number} userId - ID pengguna yang membuat ulasan.
     * @param {Object} reviewData - Data ulasan ({ productId, rating, comment }).
     * @returns {Promise<Object>} Objek berisi status, pesan, dan ID ulasan yang baru.
     * @throws {BadRequestError} Jika data tidak valid, produk tidak ditemukan, atau pengguna belum membeli/sudah mereview produk.
     * @throws {ApiError} Untuk error internal server.
     */
    async createReview(userId, reviewData) {
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        const { error, value } = createReviewSchema.validate(reviewData);
        if (error) {
            throw new BadRequestError(`Data ulasan tidak valid: ${error.details[0].message}`);
        }

        const { productId, rating, comment } = value;

        try {
            // 1. Pastikan produk ada
            const product = await productModel.findById(productId);
            if (!product) {
                throw new NotFoundError('Produk tidak ditemukan.');
            }

            // 2. Pastikan pengguna telah membeli produk ini (ini adalah logika bisnis penting)
            // Asumsi: orderModel memiliki metode untuk mengecek apakah user_id dan product_id ada di order_items
            // Anda perlu mengimplementasikan method ini di orderModel jika belum ada.
            // Contoh implementasi di orderModel (bukan bagian dari file ini, hanya referensi):
            // exports.hasUserPurchasedProduct = async (userId, productId) => {
            //    const [rows] = await db.query(
            //        `SELECT COUNT(DISTINCT oi.order_item_id) AS count
            //         FROM orders o
            //         JOIN order_items oi ON o.order_id = oi.order_id
            //         WHERE o.user_id = ? AND oi.product_id = ? AND o.status IN ('completed', 'delivered')`,
            //        [userId, productId]
            //    );
            //    return rows[0].count > 0;
            // };
            const hasPurchased = await orderModel.hasUserPurchasedProduct(userId, productId);
            if (!hasPurchased) {
                throw new BadRequestError('Anda hanya bisa memberikan ulasan untuk produk yang telah Anda beli.');
            }

            // 3. Pastikan pengguna belum mereview produk ini sebelumnya
            const existingReview = await reviewModel.findByUserAndProduct(userId, productId);
            if (existingReview) {
                throw new BadRequestError('Anda sudah memberikan ulasan untuk produk ini. Harap perbarui ulasan yang sudah ada.');
            }

            const newReviewId = await reviewModel.create({ user_id: userId, product_id: productId, rating, comment });
            return {
                status: 'success',
                message: 'Ulasan berhasil dibuat.',
                reviewId: newReviewId
            };
        } catch (error) {
            console.error('Error in ReviewService.createReview:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal membuat ulasan.');
        }
    }

    /**
     * Mengambil semua ulasan untuk produk tertentu.
     * @param {number} productId - ID produk.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data array ulasan.
     * @throws {BadRequestError} Jika ID produk tidak valid.
     * @throws {NotFoundError} Jika produk tidak ditemukan.
     * @throws {ApiError} Untuk error internal server.
     */
    async getReviewsByProductId(productId) {
        const { error: productIdError } = Joi.number().integer().positive().required().validate(productId);
        if (productIdError) {
            throw new BadRequestError(`Invalid product ID: ${productIdError.message}`);
        }

        try {
            // Pastikan produk ada, meskipun tidak ada ulasan
            const product = await productModel.findById(productId);
            if (!product) {
                throw new NotFoundError('Produk tidak ditemukan.');
            }

            const reviews = await reviewModel.findByProductId(productId);
            // Anda mungkin ingin menghitung rating rata-rata di sini
            let averageRating = 0;
            if (reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                averageRating = (totalRating / reviews.length).toFixed(1); // Satu desimal
            }

            return {
                status: 'success',
                message: 'Ulasan produk berhasil diambil.',
                data: reviews,
                averageRating: parseFloat(averageRating),
                totalReviews: reviews.length
            };
        } catch (error) {
            console.error('Error in ReviewService.getReviewsByProductId:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengambil ulasan produk.');
        }
    }

    /**
     * Memperbarui ulasan yang sudah ada.
     * Memastikan ulasan tersebut milik pengguna yang sedang login.
     * @param {number} reviewId - ID ulasan yang akan diperbarui.
     * @param {number} userId - ID pengguna (untuk verifikasi kepemilikan).
     * @param {Object} updateData - Data yang akan diperbarui ({ rating, comment }).
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika data update tidak valid.
     * @throws {NotFoundError} Jika ulasan tidak ditemukan.
     * @throws {ForbiddenError} Jika ulasan bukan milik pengguna.
     * @throws {ApiError} Untuk error internal server.
     */
    async updateReview(reviewId, userId, updateData) {
        const { error: reviewIdError } = Joi.number().integer().positive().required().validate(reviewId);
        if (reviewIdError) {
            throw new BadRequestError(`Invalid review ID: ${reviewIdError.message}`);
        }
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        const { error, value } = updateReviewSchema.validate(updateData);
        if (error) {
            throw new BadRequestError(`Data update ulasan tidak valid: ${error.details[0].message}`);
        }

        try {
            const existingReview = await reviewModel.findById(reviewId);
            if (!existingReview) {
                throw new NotFoundError('Ulasan tidak ditemukan.');
            }

            // Memastikan ulasan ini milik pengguna yang sedang login
            if (existingReview.user_id !== userId) {
                throw new ForbiddenError('Anda tidak memiliki izin untuk memperbarui ulasan ini.');
            }

            const updated = await reviewModel.update(reviewId, value);
            if (!updated) {
                throw new ApiError(500, 'Gagal memperbarui ulasan.');
            }
            return {
                status: 'success',
                message: 'Ulasan berhasil diperbarui.'
            };
        } catch (error) {
            console.error('Error in ReviewService.updateReview:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal memperbarui ulasan.');
        }
    }

    /**
     * Menghapus ulasan.
     * Memastikan ulasan tersebut milik pengguna yang sedang login atau pengguna adalah admin.
     * @param {number} reviewId - ID ulasan yang akan dihapus.
     * @param {number} userId - ID pengguna (untuk verifikasi kepemilikan).
     * @param {string} userRole - Peran pengguna (untuk otorisasi admin).
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika ID ulasan tidak valid.
     * @throws {NotFoundError} Jika ulasan tidak ditemukan.
     * @throws {ForbiddenError} Jika tidak ada izin untuk menghapus ulasan.
     * @throws {ApiError} Untuk error internal server.
     */
    async deleteReview(reviewId, userId, userRole) {
        const { error: reviewIdError } = Joi.number().integer().positive().required().validate(reviewId);
        if (reviewIdError) {
            throw new BadRequestError(`Invalid review ID: ${reviewIdError.message}`);
        }
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }
        // Validasi role opsional jika ingin lebih ketat
        // const { error: roleError } = Joi.string().valid('user', 'admin').required().validate(userRole);
        // if (roleError) {
        //     throw new BadRequestError(`Invalid user role: ${roleError.message}`);
        // }

        try {
            const existingReview = await reviewModel.findById(reviewId);
            if (!existingReview) {
                throw new NotFoundError('Ulasan tidak ditemukan.');
            }

            // Otorisasi: Hanya pemilik ulasan atau admin yang bisa menghapus
            if (existingReview.user_id !== userId && userRole !== 'admin') {
                throw new ForbiddenError('Anda tidak memiliki izin untuk menghapus ulasan ini.');
            }

            const deleted = await reviewModel.delete(reviewId);
            if (!deleted) {
                throw new ApiError(500, 'Gagal menghapus ulasan.');
            }
            return {
                status: 'success',
                message: 'Ulasan berhasil dihapus.'
            };
        } catch (error) {
            console.error('Error in ReviewService.deleteReview:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal menghapus ulasan.');
        }
    }
}

module.exports = new ReviewService();
