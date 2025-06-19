// src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Rute BARU untuk menampilkan halaman pembayaran
// Harus diproteksi karena hanya pengguna yang login yang bisa bayar
router.get('/', protect, paymentController.getPaymentPage);

// Rute untuk mencatat pembayaran via AJAX dari halaman pembayaran
router.post('/', protect, paymentController.createPayment);

// Rute Pengguna Biasa lainnya
router.get('/me', protect, paymentController.getMyPayments);
router.get('/orders/:orderId', protect, paymentController.getPaymentByOrderId);

// Rute Admin
router.get('/:id', protect, adminMiddleware, paymentController.getPaymentById);
router.put('/:id/status', protect, adminMiddleware, paymentController.updatePaymentStatus);

module.exports = router;