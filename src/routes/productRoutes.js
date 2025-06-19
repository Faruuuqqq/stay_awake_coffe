const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Rute Publik (siapa pun bisa melihat produk)
router.get('/', productController.getProductsPage);
router.get('/:id', productController.getProductById);

// Rute Admin (membutuhkan autentikasi dan otorisasi admin)
router.post('/', protect, adminMiddleware, productController.createProduct);
router.put('/:id', protect, adminMiddleware, productController.updateProduct);
router.delete('/:id', protect, adminMiddleware, productController.deleteProduct);

module.exports = router;