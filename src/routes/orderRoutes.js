// src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Rute Pengguna Biasa (Membutuhkan Autentikasi)

// Rute BARU untuk menampilkan halaman checkout
// Diletakkan di sini karena checkout adalah bagian dari alur pesanan (order)
router.get('/checkout', protect, orderController.getCheckoutPage);

// Rute yang sudah ada
router.post('/', protect, orderController.createOrder);
router.get('/me', protect, orderController.getMyOrders);

// Penting: Rute dengan parameter :id harus diletakkan setelah rute statis seperti /checkout
router.get('/:id', protect, orderController.getOrderDetail);

// Rute Admin (Membutuhkan Autentikasi dan Otorisasi Admin)
router.get('/', protect, adminMiddleware, orderController.getAllOrders);
router.get('/status', protect, adminMiddleware, orderController.getOrdersByStatus);
router.put('/:id/status', protect, adminMiddleware, orderController.updateOrderStatus);

module.exports = router;