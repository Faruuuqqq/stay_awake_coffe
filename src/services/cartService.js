// src/services/cartService.js
const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel'); // Diperlukan untuk memeriksa stok produk
const Joi = require('joi');
const { ApiError, BadRequestError, NotFoundError, ForbiddenError } = require('../utils/ApiError');

// Skema Validasi Joi
const addToCartSchema = Joi.object({
    productId: Joi.number().integer().positive().required().messages({
        'number.base': 'Product ID harus berupa angka.',
        'number.integer': 'Product ID harus berupa integer.',
        'number.positive': 'Product ID harus angka positif.',
        'any.required': 'Product ID wajib diisi.'
    }),
    quantity: Joi.number().integer().min(1).required().messages({
        'number.base': 'Kuantitas harus berupa angka.',
        'number.integer': 'Kuantitas harus berupa integer.',
        'number.min': 'Kuantitas minimal 1.',
        'any.required': 'Kuantitas wajib diisi.'
    })
});

const updateCartItemSchema = Joi.object({
    productId: Joi.number().integer().positive().required().messages({
        'number.base': 'Product ID harus berupa angka.',
        'number.integer': 'Product ID harus berupa integer.',
        'number.positive': 'Product ID harus angka positif.',
        'any.required': 'Product ID wajib diisi.'
    }),
    quantity: Joi.number().integer().min(0).required().messages({ // Quantity bisa 0 untuk menghapus
        'number.base': 'Kuantitas harus berupa angka.',
        'number.integer': 'Kuantitas harus berupa integer.',
        'number.min': 'Kuantitas minimal 0.',
        'any.required': 'Kuantitas wajib diisi.'
    })
});

class CartService {
    /**
     * Mendapatkan atau membuat keranjang belanja untuk pengguna.
     * @param {number} userId - ID pengguna.
     * @returns {Promise<Object>} Objek keranjang (cart_id, user_id).
     * @throws {BadRequestError} Jika ID pengguna tidak valid.
     * @throws {ApiError} Untuk error internal server.
     */
    async getOrCreateCart(userId) {
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        try {
            let cart = await cartModel.findByUserId(userId);
            if (!cart) {
                cart = await cartModel.create(userId);
            }
            return cart;
        } catch (error) {
            console.error('Error in CartService.getOrCreateCart:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengambil atau membuat keranjang.');
        }
    }

    /**
     * Mendapatkan semua item dalam keranjang pengguna.
     * @param {number} userId - ID pengguna.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan array item keranjang.
     * @throws {BadRequestError} Jika ID pengguna tidak valid.
     * @throws {ApiError} Untuk error internal server.
     */
    async getCartItems(userId) {
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        try {
            const cart = await this.getOrCreateCart(userId); // Pastikan keranjang ada
            const items = await cartModel.findItemsByCartId(cart.cart_id);

            // Hitung subtotal dan total keseluruhan
            let subtotal = 0;
            for (const item of items) {
                item.totalPrice = item.price * item.quantity;
                subtotal += item.totalPrice;
            }

            return {
                status: 'success',
                message: 'Item keranjang berhasil diambil.',
                data: {
                    cartId: cart.cart_id,
                    items: items,
                    subtotal: subtotal
                }
            };
        } catch (error) {
            console.error('Error in CartService.getCartItems:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengambil item keranjang.');
        }
    }

    /**
     * Menambahkan produk ke keranjang atau memperbarui kuantitas jika sudah ada.
     * @param {number} userId - ID pengguna.
     * @param {Object} itemData - Data item (productId, quantity).
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika data tidak valid, produk tidak ditemukan, atau stok tidak cukup.
     * @throws {ApiError} Untuk error internal server.
     */
    async addOrUpdateCartItem(userId, itemData) {
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        const { error, value } = addToCartSchema.validate(itemData);
        if (error) {
            throw new BadRequestError(`Data item tidak valid: ${error.details[0].message}`);
        }

        try {
            const cart = await this.getOrCreateCart(userId);
            const product = await productModel.findById(value.productId);

            if (!product) {
                throw new NotFoundError('Produk tidak ditemukan.');
            }

            // Temukan item keranjang yang sudah ada untuk produk ini
            const existingCartItem = await cartModel.findCartItem(cart.cart_id, value.productId);
            let newQuantity = value.quantity;

            if (existingCartItem) {
                // Jika item sudah ada, tambahkan kuantitas ke kuantitas yang sudah ada
                newQuantity += existingCartItem.quantity;
            }

            // Periksa stok yang tersedia
            if (product.stock < newQuantity) {
                throw new BadRequestError(`Stok produk tidak mencukupi. Hanya tersedia ${product.stock} unit.`);
            }

            let result;
            if (existingCartItem) {
                result = await cartModel.updateItemQuantity(cart.cart_id, value.productId, newQuantity);
            } else {
                result = await cartModel.addItem(cart.cart_id, value.productId, newQuantity);
            }

            if (!result) {
                throw new ApiError(500, 'Gagal menambahkan atau memperbarui item keranjang.');
            }

            return {
                status: 'success',
                message: 'Item keranjang berhasil diperbarui.'
            };
        } catch (error) {
            console.error('Error in CartService.addOrUpdateCartItem:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal menambahkan atau memperbarui item keranjang.');
        }
    }

    /**
     * Memperbarui kuantitas item tertentu dalam keranjang pengguna.
     * @param {number} userId - ID pengguna.
     * @param {number} productId - ID produk.
     * @param {number} quantity - Kuantitas baru.
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika data tidak valid, produk tidak ditemukan, atau stok tidak cukup.
     * @throws {NotFoundError} Jika item keranjang tidak ditemukan.
     * @throws {ApiError} Untuk error internal server.
     */
    async updateCartItemQuantity(userId, productId, quantity) {
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        const { error, value } = updateCartItemSchema.validate({ productId, quantity });
        if (error) {
            throw new BadRequestError(`Data update item tidak valid: ${error.details[0].message}`);
        }
        
        try {
            const cart = await this.getOrCreateCart(userId);
            const product = await productModel.findById(value.productId);

            if (!product) {
                throw new NotFoundError('Produk tidak ditemukan.');
            }

            const existingCartItem = await cartModel.findCartItem(cart.cart_id, value.productId);
            if (!existingCartItem) {
                throw new NotFoundError('Item keranjang tidak ditemukan.');
            }

            // Jika kuantitas baru adalah 0, hapus item
            if (value.quantity === 0) {
                const removed = await cartModel.removeItem(cart.cart_id, value.productId);
                if (!removed) {
                    throw new ApiError(500, 'Gagal menghapus item dari keranjang.');
                }
                return {
                    status: 'success',
                    message: 'Item keranjang berhasil dihapus.'
                };
            }

            // Periksa stok yang tersedia
            if (product.stock < value.quantity) {
                throw new BadRequestError(`Stok produk tidak mencukupi. Hanya tersedia ${product.stock} unit.`);
            }

            const updated = await cartModel.updateItemQuantity(cart.cart_id, value.productId, value.quantity);
            if (!updated) {
                throw new ApiError(500, 'Gagal memperbarui kuantitas item keranjang.');
            }

            return {
                status: 'success',
                message: 'Kuantitas item keranjang berhasil diperbarui.'
            };
        } catch (error) {
            console.error('Error in CartService.updateCartItemQuantity:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal memperbarui kuantitas item keranjang.');
        }
    }

    /**
     * Menghapus item tertentu dari keranjang pengguna.
     * @param {number} userId - ID pengguna.
     * @param {number} productId - ID produk yang akan dihapus.
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika ID tidak valid.
     * @throws {NotFoundError} Jika item keranjang tidak ditemukan.
     * @throws {ApiError} Untuk error internal server.
     */
    async removeCartItem(userId, productId) {
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }
        const { error: productIdError } = Joi.number().integer().positive().required().validate(productId);
        if (productIdError) {
            throw new BadRequestError(`Invalid product ID: ${productIdError.message}`);
        }

        try {
            const cart = await this.getOrCreateCart(userId);
            const existingCartItem = await cartModel.findCartItem(cart.cart_id, productId);
            if (!existingCartItem) {
                throw new NotFoundError('Item keranjang tidak ditemukan.');
            }

            const removed = await cartModel.removeItem(cart.cart_id, productId);
            if (!removed) {
                throw new ApiError(500, 'Gagal menghapus item dari keranjang.');
            }

            return {
                status: 'success',
                message: 'Item keranjang berhasil dihapus.'
            };
        } catch (error) {
            console.error('Error in CartService.removeCartItem:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal menghapus item keranjang.');
        }
    }

    /**
     * Mengosongkan seluruh keranjang pengguna.
     * @param {number} userId - ID pengguna.
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika ID pengguna tidak valid.
     * @throws {ApiError} Untuk error internal server.
     */
    async clearCart(userId) {
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        try {
            const cart = await this.getOrCreateCart(userId);
            const cleared = await cartModel.clear(cart.cart_id);
            if (!cleared) { // Ini bisa false jika tidak ada item di keranjang untuk dihapus, tapi secara operasional tidak selalu error
                console.warn(`Cart ID ${cart.cart_id} was already empty or no items were affected.`);
            }
            return {
                status: 'success',
                message: 'Keranjang berhasil dikosongkan.'
            };
        } catch (error) {
            console.error('Error in CartService.clearCart:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengosongkan keranjang.');
        }
    }
}

module.exports = new CartService();
