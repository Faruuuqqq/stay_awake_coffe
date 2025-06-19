// src/services/orderService.js
const db = require('../config/db');
const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel'); // Untuk mengurangi stok
const addressModel = require('../models/addressModel'); // Untuk memvalidasi alamat
const Joi = require('joi');
const { ApiError, BadRequestError, NotFoundError, ForbiddenError } = require('../utils/ApiError');

// Skema Validasi Joi
const createOrderSchema = Joi.object({
    addressId: Joi.number().integer().positive().required().messages({
        'number.base': 'Address ID harus berupa angka.',
        'number.integer': 'Address ID harus berupa integer.',
        'number.positive': 'Address ID harus angka positif.',
        'any.required': 'Address ID wajib diisi.'
    })
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required().messages({
        'string.base': 'Status harus berupa string.',
        'any.only': 'Status tidak valid.',
        'any.required': 'Status wajib diisi.'
    })
});

class OrderService {
    /**
     * Membuat pesanan baru dari keranjang pengguna.
     * Mengurangi stok produk dan mengosongkan keranjang setelah pesanan berhasil dibuat.
     * @param {number} userId - ID pengguna.
     * @param {Object} orderData - Data pesanan ({ addressId }).
     * @returns {Promise<Object>} Objek berisi status, pesan, dan ID pesanan baru.
     * @throws {BadRequestError} Jika data tidak valid, keranjang kosong, stok tidak cukup, atau alamat tidak valid/bukan milik pengguna.
     * @throws {ApiError} Untuk error internal server.
     */
    async createOrderFromCart(userId, orderData) {
        // Validasi input
        const { error } = Joi.object({
            addressId: Joi.number().integer().positive().required()
        }).validate({ addressId: orderData.addressId });
        
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }

        const connection = await db.getConnection(); // Dapatkan koneksi dari pool
        await connection.beginTransaction(); // Mulai transaksi

        try {
            // 1. Verifikasi alamat & dapatkan keranjang
            const address = await addressModel.findByIdAndUserId(orderData.addressId, userId);
            if (!address) {
                throw new NotFoundError('Alamat pengiriman tidak ditemukan atau bukan milik Anda.');
            }

            const cart = await cartModel.findByUserId(userId);
            if (!cart) {
                throw new NotFoundError('Keranjang tidak ditemukan.');
            }
            
            const items = await cartModel.findItemsByCartId(cart.cart_id);
            if (items.length === 0) {
                throw new BadRequestError('Keranjang Anda kosong.');
            }
            
            // 2. Hitung total harga & siapkan data pesanan
            let totalPrice = 0;
            for (const item of items) {
                // Verifikasi stok produk
                if (item.quantity > item.stock) {
                    throw new BadRequestError(`Stok untuk produk "${item.name}" tidak mencukupi.`);
                }
                totalPrice += item.quantity * item.price;
            }

            const orderPayload = {
                user_id: userId,
                address_id: orderData.addressId,
                total_price: totalPrice,
                status: 'pending' // Status awal pesanan
            };

            // 3. Buat pesanan utama di tabel 'orders'
            const newOrder = await orderModel.create(orderPayload, connection);
            const orderId = newOrder.order_id;
            
            // 4. Pindahkan item dari keranjang ke 'order_items' & kurangi stok
            for (const item of items) {
                const itemTotalPrice = item.quantity * item.price;

                await orderModel.addOrderItem({
                    order_id: orderId,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    total_price: itemTotalPrice
                }, connection);
                
                await productModel.decreaseStock(item.product_id, item.quantity, connection);
            }
            
            // 5. Kosongkan keranjang
            await cartModel.clear(cart.cart_id, connection);
            
            // 6. Jika semua berhasil, commit transaksi
            await connection.commit();
            connection.release(); // Lepaskan koneksi kembali ke pool

            return {
                status: 'success',
                message: 'Pesanan berhasil dibuat.',
                data: { orderId: orderId }
            };

        } catch (error) {
            // Jika terjadi error, batalkan semua perubahan (rollback)
            await connection.rollback();
            connection.release();
            console.error('Error in OrderService.createOrderFromCart (transaction rolled back):', error.message);
            
            // Teruskan error asli jika itu adalah ApiError, atau buat yang baru
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal membuat pesanan.');
        }
    }

    /**
     * Mengambil riwayat pesanan untuk pengguna tertentu.
     * @param {number} userId - ID pengguna.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data array pesanan.
     * @throws {BadRequestError} Jika ID pengguna tidak valid.
     * @throws {ApiError} Untuk error internal server.
     */
    async getMyOrders(userId) {
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        try {
            const orders = await orderModel.findByUserId(userId);
            return {
                status: 'success',
                message: 'Riwayat pesanan berhasil diambil.',
                data: orders
            };
        } catch (error) {
            console.error('Error in OrderService.getMyOrders:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengambil riwayat pesanan.');
        }
    }

    /**
     * Mengambil detail pesanan berdasarkan ID, memastikan pesanan milik pengguna.
     * @param {number} orderId - ID pesanan.
     * @param {number} userId - ID pengguna (untuk verifikasi kepemilikan).
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data pesanan.
     * @throws {BadRequestError} Jika ID tidak valid.
     * @throws {NotFoundError} Jika pesanan tidak ditemukan.
     * @throws {ForbiddenError} Jika pesanan bukan milik pengguna.
     * @throws {ApiError} Untuk error internal server.
     */
    async getOrderDetail(orderId, userId) {
        const { error: orderIdError } = Joi.number().integer().positive().required().validate(orderId);
        if (orderIdError) {
            throw new BadRequestError(`Invalid order ID: ${orderIdError.message}`);
        }
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        try {
            const order = await orderModel.findById(orderId);
            if (!order) {
                throw new NotFoundError('Pesanan tidak ditemukan.');
            }

            console.log(order.user_id);
            console.log(userId);
            const orders = await orderModel.findByUserId(userId);
            // Pastikan pesanan ini milik pengguna yang sedang login
            // if (parseInt(order.user_id) !== userId) {
            //     throw new ForbiddenError('Anda tidak memiliki izin untuk mengakses pesanan ini.');
            // }

            return {
                status: 'success',
                message: 'Detail pesanan berhasil diambil.',
                data: order
            };
        } catch (error) {
            console.error('Error in OrderService.getOrderDetail:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengambil detail pesanan.');
        }
    }

    /**
     * Memperbarui status pesanan (hanya untuk admin).
     * @param {number} orderId - ID pesanan.
     * @param {Object} statusData - Objek berisi status baru.
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika ID pesanan atau status tidak valid.
     * @throws {NotFoundError} Jika pesanan tidak ditemukan.
     * @throws {ApiError} Untuk error internal server.
     */
    async updateOrderStatus(orderId, statusData) {
        const { error: orderIdError } = Joi.number().integer().positive().required().validate(orderId);
        if (orderIdError) {
            throw new BadRequestError(`Invalid order ID: ${orderIdError.message}`);
        }

        const { error, value } = updateOrderStatusSchema.validate(statusData);
        if (error) {
            throw new BadRequestError(`Data status tidak valid: ${error.details[0].message}`);
        }

        try {
            const updated = await orderModel.updateStatus(orderId, value.status);
            if (!updated) {
                throw new NotFoundError('Pesanan tidak ditemukan.');
            }
            return {
                status: 'success',
                message: `Status pesanan berhasil diperbarui menjadi ${value.status}.`
            };
        } catch (error) {
            console.error('Error in OrderService.updateOrderStatus:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal memperbarui status pesanan.');
        }
    }

    /**
     * Mengambil semua pesanan (untuk admin).
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data array pesanan.
     * @throws {ApiError} Untuk error internal server.
     */
    async getAllOrders() {
        try {
            const orders = await orderModel.findAll();
            return {
                status: 'success',
                message: 'Daftar semua pesanan berhasil diambil.',
                data: orders
            };
        } catch (error) {
            console.error('Error in OrderService.getAllOrders:', error.message);
            throw new ApiError(500, 'Gagal mengambil semua pesanan.');
        }
    }

    /**
     * Mengambil pesanan berdasarkan status (untuk admin).
     * @param {string} status - Status pesanan yang dicari.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data array pesanan.
     * @throws {BadRequestError} Jika status tidak valid.
     * @throws {ApiError} Untuk error internal server.
     */
    async getOrdersByStatus(status) {
        const { error, value } = updateOrderStatusSchema.validate({ status }); // Gunakan schema yang sama
        if (error) {
            throw new BadRequestError(`Status tidak valid: ${error.details[0].message}`);
        }

        try {
            const orders = await orderModel.findByStatus(value.status);
            return {
                status: 'success',
                message: `Daftar pesanan dengan status '${value.status}' berhasil diambil.`,
                data: orders
            };
        } catch (error) {
            console.error('Error in OrderService.getOrdersByStatus:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengambil pesanan berdasarkan status.');
        }
    }
}

module.exports = new OrderService();
