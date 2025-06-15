// src/services/orderService.js
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
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        const { error, value } = createOrderSchema.validate(orderData);
        if (error) {
            throw new BadRequestError(`Data pesanan tidak valid: ${error.details[0].message}`);
        }

        const { addressId } = value;

        let connection; // Untuk transaksi database
        try {
            connection = await db.getConnection(); // Dapatkan koneksi untuk transaksi
            await connection.beginTransaction(); // Mulai transaksi

            // 1. Dapatkan keranjang dan item-itemnya
            const cart = await cartModel.findByUserId(userId);
            if (!cart) {
                throw new NotFoundError('Keranjang tidak ditemukan.'); // Seharusnya tidak terjadi jika getOrCreateCart selalu dipanggil
            }
            const cartItems = await cartModel.findItemsByCartId(cart.cart_id);

            if (!cartItems || cartItems.length === 0) {
                throw new BadRequestError('Keranjang belanja kosong.');
            }

            // 2. Validasi alamat pengiriman dan pastikan itu milik pengguna
            const address = await addressModel.findById(addressId);
            if (!address || address.user_id !== userId) {
                throw new BadRequestError('Alamat pengiriman tidak valid atau bukan milik Anda.');
            }

            // 3. Verifikasi stok dan hitung total harga
            let totalPrice = 0;
            const productUpdates = []; // Untuk melacak produk yang perlu diperbarui stoknya

            for (const item of cartItems) {
                const product = await productModel.findById(item.product_id);
                if (!product) {
                    throw new NotFoundError(`Produk '${item.name}' tidak ditemukan lagi.`);
                }
                if (product.stock < item.quantity) {
                    throw new BadRequestError(`Stok produk '${item.name}' tidak mencukupi. Tersedia: ${product.stock}, diminta: ${item.quantity}.`);
                }
                totalPrice += item.price * item.quantity;
                productUpdates.push({ productId: item.product_id, newStock: product.stock - item.quantity });
            }

            // 4. Buat pesanan di tabel 'orders'
            const orderId = await orderModel.create(userId, addressId, totalPrice);

            // 5. Tambahkan item-item keranjang ke tabel 'order_items'
            const orderItemsToCreate = cartItems.map(item => ({
                order_id: orderId,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price // Simpan harga saat ini ke order_items
            }));
            await orderModel.addItems(orderId, orderItemsToCreate);

            // 6. Kurangi stok produk
            for (const update of productUpdates) {
                // Perlu updateStock method di productModel atau productModel.update
                // Untuk kesederhanaan, asumsikan productModel.update bisa digunakan
                await productModel.update(update.productId, { stock: update.newStock });
            }

            // 7. Kosongkan keranjang setelah pesanan berhasil
            await cartModel.clear(cart.cart_id);

            await connection.commit(); // Commit transaksi
            return {
                status: 'success',
                message: 'Pesanan berhasil dibuat.',
                orderId: orderId
            };
        } catch (error) {
            if (connection) await connection.rollback(); // Rollback transaksi jika ada error
            console.error('Error in OrderService.createOrderFromCart (transaction rolled back):', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal membuat pesanan.');
        } finally {
            if (connection) connection.release(); // Pastikan koneksi dilepaskan
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

            // Pastikan pesanan ini milik pengguna yang sedang login
            if (order.user_id !== userId) {
                throw new ForbiddenError('Anda tidak memiliki izin untuk mengakses pesanan ini.');
            }

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
