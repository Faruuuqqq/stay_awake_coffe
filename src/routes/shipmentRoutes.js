// src/routes/shipmentRoutes.js
const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { protect } = require('../middlewares/authMiddleware'); // <-- Perubahan di sini
const adminMiddleware = require('../middlewares/adminMiddleware');

// Semua rute di sini memerlukan login
router.use(protect); // <-- Perubahan di sini

// Rute Pengguna Biasa
router.get('/order/:orderId', shipmentController.getShipmentByOrderId);

// Rute Admin (membutuhkan otorisasi admin tambahan)
router.post('/', adminMiddleware, shipmentController.createShipment);
router.put('/:id/status', adminMiddleware, shipmentController.updateShipmentStatus);

module.exports = router;