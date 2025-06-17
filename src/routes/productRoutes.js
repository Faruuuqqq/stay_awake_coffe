// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware'); // <-- Perubahan di sini
const adminMiddleware = require('../middlewares/adminMiddleware');

// Rute Publik (siapa pun bisa melihat produk)
router.get('/', productController.getProductsPage);
router.get('/:id', productController.getProductById);

// Rute Admin (membutuhkan autentikasi dan otorisasi admin)
router.post('/', protect, adminMiddleware, productController.createProduct); // <-- Perubahan di sini
router.put('/:id', protect, adminMiddleware, productController.updateProduct); // <-- Perubahan di sini
router.delete('/:id', protect, adminMiddleware, productController.deleteProduct); // <-- Perubahan di sini

module.exports = router;