// src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware'); // <-- Perubahan di sini
const adminMiddleware = require('../middlewares/adminMiddleware');

// Rute Publik (siapa pun bisa melihat ulasan produk)
router.get('/product/:productId', reviewController.getReviewsByProductId);

// Rute Pengguna Biasa (Membutuhkan Autentikasi)
router.post('/', protect, reviewController.createReview); // <-- Perubahan di sini
router.put('/:id', protect, reviewController.updateReview); // <-- Perubahan di sini

// Rute Admin (Membutuhkan otorisasi admin tambahan)
router.delete('/:id', protect, adminMiddleware, reviewController.deleteReview); // <-- Perubahan di sini

module.exports = router;