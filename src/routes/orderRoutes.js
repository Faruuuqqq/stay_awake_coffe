const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Rute Pengguna Biasa (Membutuhkan Autentikasi)
router.get('/checkout', protect, orderController.getCheckoutPage);
router.post('/', protect, orderController.createOrder);
router.get('/me', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrderDetail);

// Rute Admin (Membutuhkan Autentikasi dan Otorisasi Admin)
router.get('/', protect, adminMiddleware, orderController.getAllOrders);
router.get('/status', protect, adminMiddleware, orderController.getOrdersByStatus);
router.put('/:id/status', adminMiddleware, orderController.updateOrderStatus);

module.exports = router;