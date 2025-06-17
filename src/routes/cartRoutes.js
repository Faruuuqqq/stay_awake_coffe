// src/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware'); // <-- Perubahan di sini

// Semua rute di sini memerlukan otentikasi
router.use(protect); // <-- Perubahan di sini

// Rute untuk keranjang belanja pengguna yang sedang login
router.get('/', cartController.getCart);
router.post('/', cartController.addItemToCart);
router.put('/', cartController.updateCartItemQuantity);
router.delete('/:productId', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;