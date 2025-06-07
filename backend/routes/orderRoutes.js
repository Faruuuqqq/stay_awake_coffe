const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// Buat order (checkout)
router.post('/', authMiddleware, orderController.createOrder);

// Lihat semua order milik user (protected)
router.get('/user', authMiddleware, orderController.getOrdersByUser);

// Detail order by ID (protected)
router.get('/:id', authMiddleware, orderController.getOrderById);

// Update status order (misal admin approve, batalkan, dsb)
router.put('/:id', authMiddleware, orderController.updateOrderStatus);

module.exports = router;
