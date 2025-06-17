// src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware'); // <-- Perubahan di sini
const adminMiddleware = require('../middlewares/adminMiddleware');

// Semua rute di sini setidaknya memerlukan login
router.use(protect); // <-- Perubahan di sini

// Rute Pengguna Biasa
router.post('/', orderController.createOrder);
router.get('/me', orderController.getMyOrders);
router.get('/:id', orderController.getOrderDetail);

// Rute Admin (membutuhkan otorisasi admin tambahan)
router.get('/', adminMiddleware, orderController.getAllOrders);
router.get('/status', adminMiddleware, orderController.getOrdersByStatus);
router.put('/:id/status', adminMiddleware, orderController.updateOrderStatus);

module.exports = router;