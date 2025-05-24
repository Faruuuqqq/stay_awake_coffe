const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post('/', authMiddleware, orderController.createOrder);

router.get('/user', authMiddleware, orderController.getOrdersByUser);

router.get('/:id', authMiddleware, orderController.getOrderById);

router.put('/:id', authMiddleware, orderController.updateOrderStatus);

module.exports = router;