// src/controllers/cartController.js
const cartService = require('../services/cartService');
const { getCommonRenderData } = require('../utils/renderHelpers'); // Untuk data render umum

const cartController = {
    /**
     * Mendapatkan semua item dalam keranjang pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.userId dari authMiddleware).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getCart: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const result = await cartService.getCartItems(req.userId);
            res.status(200).json(result);
            // Jika ingin merender halaman keranjang:
            // const commonData = await getCommonRenderData(req.userId, { title: 'Your Cart' });
            // res.render('cart', { ...commonData, cart: result.data });
        } catch (error) {
            console.error('Error in cartController.getCart:', error.message);
            next(error);
        }
    },

    /**
     * Menambahkan produk ke keranjang atau memperbarui kuantitasnya.
     * @param {Object} req - Objek request Express (req.userId, req.body: { productId, quantity }).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    addItemToCart: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const { productId, quantity } = req.body;
            const result = await cartService.addOrUpdateCartItem(req.userId, { productId, quantity });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in cartController.addItemToCart:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui kuantitas item tertentu dalam keranjang.
     * @param {Object} req - Objek request Express (req.userId, req.body: { productId, quantity }).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    updateCartItemQuantity: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const { productId, quantity } = req.body; // Ambil productId dari body
            const result = await cartService.updateCartItemQuantity(req.userId, productId, quantity);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in cartController.updateCartItemQuantity:', error.message);
            next(error);
        }
    },

    /**
     * Menghapus item tertentu dari keranjang.
     * @param {Object} req - Objek request Express (req.userId, req.params.productId).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    removeCartItem: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const { productId } = req.params; // Ambil productId dari params
            const result = await cartService.removeCartItem(req.userId, productId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in cartController.removeCartItem:', error.message);
            next(error);
        }
    },

    /**
     * Mengosongkan seluruh keranjang pengguna.
     * @param {Object} req - Objek request Express (req.userId).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    clearCart: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const result = await cartService.clearCart(req.userId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in cartController.clearCart:', error.message);
            next(error);
        }
    }
};

module.exports = cartController;
