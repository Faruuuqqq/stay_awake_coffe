const reviewService = require('../services/reviewService');

const reviewController = {
    /**
     * Membuat ulasan baru.
     * @param {Object} req - Objek request Express (req.userId dari authMiddleware, req.body).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    createReview: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const reviewData = req.body;
            const result = await reviewService.createReview(req.userId, reviewData);
            res.status(201).json(result); // Status 201 Created
        } catch (error) {
            console.error('Error in reviewController.createReview:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil semua ulasan untuk produk tertentu.
     * @param {Object} req - Objek request Express (req.params.productId).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getReviewsByProductId: async (req, res, next) => {
        const { productId } = req.params;
        try {
            const result = await reviewService.getReviewsByProductId(productId);
            res.status(200).json(result);
            // Jika ingin merender bagian ulasan di halaman produk:
            // res.render('product-reviews-partial', { reviews: result.data, averageRating: result.averageRating });
        } catch (error) {
            console.error('Error in reviewController.getReviewsByProductId:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui ulasan.
     * @param {Object} req - Objek request Express (req.params.id, req.userId, req.body).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    updateReview: async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const result = await reviewService.updateReview(id, req.userId, updateData);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in reviewController.updateReview:', error.message);
            next(error);
        }
    },

    /**
     * Menghapus ulasan.
     * @param {Object} req - Objek request Express (req.params.id, req.userId, req.user.role).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    deleteReview: async (req, res, next) => {
        const { id } = req.params;
        try {
            if (!req.userId || !req.user || !req.user.role) {
                return next(new ApiError(401, 'Unauthorized: User ID or role not found in request.'));
            }
            const result = await reviewService.deleteReview(id, req.userId, req.user.role);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in reviewController.deleteReview:', error.message);
            next(error);
        }
    }
};

module.exports = reviewController;
