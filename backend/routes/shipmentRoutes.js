const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Buat shipment (biasanya admin)
router.post('/', authMiddleware, adminMiddleware, shipmentController.createShipment);

// Cek status shipment berdasar order_id
router.get('/order/:id', authMiddleware, shipmentController.getShipmentByOrderId);

// Update status shipment (admin)
router.put('/:id', authMiddleware, adminMiddleware, shipmentController.updateShipmentStatus);

module.exports = router;
