const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Simulasi buat pembayaran order
router.post('/', authMiddleware, paymentController.createPayment);
router.get('/', authMiddleware, paymentController.getPaymentPage);

// Lihat pembayaran berdasarkan ID payment
router.get('/:id', authMiddleware, paymentController.getPaymentById);

// Lihat pembayaran berdasarkan ID order
router.get('/order/:id', authMiddleware, paymentController.getPaymentByOrderId);

module.exports = router;
