// src/controllers/cartController.js
const cartService = require('../services/cartService');
const { getCommonRenderData } = require('../utils/renderHelpers');
const { ApiError } = require('../utils/ApiError'); // Pastikan ApiError diimpor

const cartController = {
    /**
     * Mendapatkan keranjang pengguna.
     * Fungsi ini sekarang bisa merender halaman HTML atau mengirim data JSON
     * tergantung pada URL yang diakses (/carts atau /api/carts).
     */
    getCart: async (req, res, next) => {
        try {
            // Middleware 'protect' sudah memastikan req.userId ada.
            const result = await cartService.getCartItems(req.userId);

            // Cek apakah ini permintaan API atau permintaan halaman
            if (req.originalUrl.startsWith('/api/')) {
                // Jika ya, kirim balasan JSON
                return res.status(200).json(result);
            } else {
                // Jika tidak, render halaman EJS seperti biasa
                const commonData = await getCommonRenderData(req.userId, { title: 'Keranjang Belanja' });
                return res.render('cart', { ...commonData, cart: result.data });
            }
        } catch (error) {
            console.error('Error in cartController.getCart:', error.message);
            next(error);
        }
    },

    /**
     * Menambahkan item ke keranjang. Selalu merespons dengan JSON.
     */
    addItemToCart: async (req, res, next) => {
        try {
            const { productId, quantity } = req.body;
            const result = await cartService.addOrUpdateCartItem(req.userId, { productId, quantity });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in cartController.addItemToCart:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui kuantitas item di keranjang. Selalu merespons dengan JSON.
     */
    updateCartItemQuantity: async (req, res, next) => {
        try {
            const { productId, quantity } = req.body;
            const result = await cartService.updateCartItemQuantity(req.userId, productId, quantity );
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in cartController.updateCartItemQuantity:', error.message);
            next(error);
        }
    },

    /**
     * Menghapus item dari keranjang. Selalu merespons dengan JSON.
     */
    removeCartItem: async (req, res, next) => {
        try {
            const { productId } = req.params;
            const result = await cartService.removeCartItem(req.userId, productId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in cartController.removeCartItem:', error.message);
            next(error);
        }
    },

    /**
     * Mengosongkan keranjang. Selalu merespons dengan JSON.
     */
    clearCart: async (req, res, next) => {
        try {
            const result = await cartService.clearCart(req.userId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in cartController.clearCart:', error.message);
            next(error);
        }
    }
};

module.exports = cartController;