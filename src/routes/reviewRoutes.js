const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Rute Publik (siapa pun bisa melihat ulasan produk)
router.get('/product/:productId', reviewController.getReviewsByProductId);

// Rute Pengguna Biasa (Membutuhkan Autentikasi)
router.post('/', protect, reviewController.createReview);
router.put('/:id', protect, reviewController.updateReview);

// Rute Admin (Membutuhkan otorisasi admin tambahan)
router.delete('/:id', protect, adminMiddleware, reviewController.deleteReview);

module.exports = router;