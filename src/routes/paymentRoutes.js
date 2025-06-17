// src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware'); // <-- Perubahan di sini
const adminMiddleware = require('../middlewares/adminMiddleware');

// Rute yang mungkin publik (misal: webhook dari payment gateway)
router.post('/', paymentController.createPayment);

// Rute Pengguna Biasa (Membutuhkan Autentikasi)
router.get('/me', protect, paymentController.getMyPayments); // <-- Perubahan di sini
router.get('/orders/:orderId', protect, paymentController.getPaymentByOrderId); // <-- Perubahan di sini

// Rute Admin (Membutuhkan Autentikasi dan Otorisasi Admin)
router.get('/:id', protect, adminMiddleware, paymentController.getPaymentById); // <-- Perubahan di sini
router.put('/:id/status', protect, adminMiddleware, paymentController.updatePaymentStatus); // <-- Perubahan di sini

module.exports = router;