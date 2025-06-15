// src/services/shipmentService.js
const shipmentModel = require('../models/shipmentModel');
const orderModel = require('../models/orderModel'); // Diperlukan untuk memperbarui status order
const Joi = require('joi');
const { ApiError, BadRequestError, NotFoundError, ForbiddenError } = require('../utils/ApiError');

// Skema Validasi Joi
const createShipmentSchema = Joi.object({
    orderId: Joi.number().integer().positive().required().messages({
        'number.base': 'Order ID harus berupa angka.',
        'number.integer': 'Order ID harus berupa integer.',
        'number.positive': 'Order ID harus angka positif.',
        'any.required': 'Order ID wajib diisi.'
    }),
    courier: Joi.string().trim().min(2).max(100).required().messages({
        'string.base': 'Kurir harus berupa string.',
        'string.empty': 'Kurir tidak boleh kosong.',
        'string.min': 'Kurir minimal {#limit} karakter.',
        'string.max': 'Kurir maksimal {#limit} karakter.',
        'any.required': 'Kurir wajib diisi.'
    }),
    status: Joi.string().valid('packing', 'shipped', 'delivered', 'cancelled', 'returned').default('packing').messages({
        'string.base': 'Status harus berupa string.',
        'any.only': 'Status tidak valid.'
    })
});

const updateShipmentStatusSchema = Joi.object({
    status: Joi.string().valid('packing', 'shipped', 'delivered', 'cancelled', 'returned').required().messages({
        'string.base': 'Status harus berupa string.',
        'any.only': 'Status tidak valid.',
        'any.required': 'Status wajib diisi.'
    })
});

class ShipmentService {
    /**
     * Menciptakan catatan pengiriman baru untuk suatu pesanan.
     * Ini biasanya dipanggil setelah pesanan dibuat dan siap untuk dikirim.
     * @param {Object} shipmentData - Data pengiriman ({ orderId, courier, status }).
     * @returns {Promise<Object>} Objek berisi status, pesan, dan ID pengiriman yang baru.
     * @throws {BadRequestError} Jika data tidak valid, pesanan tidak ditemukan, atau pengiriman sudah ada.
     * @throws {ApiError} Untuk error internal server.
     */
    async createShipment(shipmentData) {
        const { error, value } = createShipmentSchema.validate(shipmentData);
        if (error) {
            throw new BadRequestError(`Data pengiriman tidak valid: ${error.details[0].message}`);
        }

        let connection;
        try {
            connection = await db.getConnection(); // Untuk transaksi
            await connection.beginTransaction();

            const order = await orderModel.findById(value.orderId);
            if (!order) {
                throw new NotFoundError('Pesanan tidak ditemukan.');
            }
            if (order.status === 'cancelled' || order.status === 'delivered') {
                throw new BadRequestError('Pesanan ini tidak dapat dibuatkan pengiriman.');
            }

            const existingShipment = await shipmentModel.findByOrderId(value.orderId);
            if (existingShipment) {
                throw new BadRequestError('Pengiriman untuk pesanan ini sudah ada.');
            }

            const newShipmentId = await shipmentModel.create({
                order_id: value.orderId,
                courier: value.courier,
                status: value.status
            });

            // Perbarui status pesanan menjadi 'processing' atau 'shipped'
            if (value.status === 'shipped') {
                await orderModel.updateStatus(value.orderId, 'shipped');
            } else if (order.status !== 'processing') { // Jangan downgrade status jika sudah processing
                await orderModel.updateStatus(value.orderId, 'processing');
            }


            await connection.commit();
            return {
                status: 'success',
                message: 'Pengiriman berhasil dibuat.',
                shipmentId: newShipmentId
            };
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error in ShipmentService.createShipment (transaction rolled back):', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal membuat pengiriman.');
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Mengambil detail pengiriman berdasarkan ID Pesanan (Order ID).
     * @param {number} orderId - ID pesanan.
     * @param {number} userId - ID pengguna (untuk verifikasi otorisasi).
     * @param {string} userRole - Peran pengguna (untuk otorisasi admin).
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data pengiriman.
     * @throws {BadRequestError} Jika ID pesanan tidak valid.
     * @throws {NotFoundError} Jika pengiriman tidak ditemukan.
     * @throws {ForbiddenError} Jika pengguna tidak memiliki izin untuk mengakses pengiriman.
     * @throws {ApiError} Untuk error internal server.
     */
    async getShipmentByOrderId(orderId, userId, userRole) {
        const { error: orderIdError } = Joi.number().integer().positive().required().validate(orderId);
        if (orderIdError) {
            throw new BadRequestError(`Invalid order ID: ${orderIdError.message}`);
        }
        // Validasi userId dan userRole opsional jika ingin lebih ketat
        // const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        // if (userIdError) { throw new BadRequestError(`Invalid user ID: ${userIdError.message}`); }
        // const { error: roleError } = Joi.string().valid('user', 'admin').required().validate(userRole);
        // if (roleError) { throw new BadRequestError(`Invalid user role: ${roleError.message}`); }


        try {
            const shipment = await shipmentModel.findByOrderId(orderId);
            if (!shipment) {
                throw new NotFoundError('Pengiriman tidak ditemukan untuk pesanan ini.');
            }

            // Otorisasi: Hanya pemilik pesanan atau admin yang bisa melihat pengiriman
            const order = await orderModel.findById(orderId); // Dapatkan detail order untuk user_id
            if (!order) { // Seharusnya tidak terjadi jika shipment ada
                throw new ApiError(500, 'Kesalahan internal: Pesanan terkait tidak ditemukan.');
            }

            if (order.user_id !== userId && userRole !== 'admin') {
                throw new ForbiddenError('Anda tidak memiliki izin untuk melihat pengiriman ini.');
            }

            return {
                status: 'success',
                message: 'Detail pengiriman berhasil diambil.',
                data: shipment
            };
        } catch (error) {
            console.error('Error in ShipmentService.getShipmentByOrderId:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengambil detail pengiriman.');
        }
    }

    /**
     * Memperbarui status pengiriman.
     * Ini biasanya dilakukan oleh admin atau webhook dari kurir.
     * @param {number} shipmentId - ID pengiriman yang akan diperbarui.
     * @param {Object} statusData - Objek berisi status baru ({ status }).
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika ID pengiriman atau status tidak valid.
     * @throws {NotFoundError} Jika pengiriman tidak ditemukan.
     * @throws {ApiError} Untuk error internal server.
     */
    async updateShipmentStatus(shipmentId, statusData) {
        const { error: idError } = Joi.number().integer().positive().required().validate(shipmentId);
        if (idError) {
            throw new BadRequestError(`Invalid shipment ID: ${idError.message}`);
        }

        const { error, value } = updateShipmentStatusSchema.validate(statusData);
        if (error) {
            throw new BadRequestError(`Data status pengiriman tidak valid: ${error.details[0].message}`);
        }

        let connection;
        try {
            connection = await db.getConnection(); // Untuk transaksi
            await connection.beginTransaction();

            const shipment = await shipmentModel.findById(shipmentId);
            if (!shipment) {
                throw new NotFoundError('Pengiriman tidak ditemukan.');
            }

            const updated = await shipmentModel.updateStatus(shipmentId, value.status);
            if (!updated) {
                // Ini mungkin terjadi jika status yang sama diupdate, tidak selalu error fatal
                console.warn(`Shipment ID ${shipmentId} status was already ${value.status} or no rows affected.`);
                // throw new ApiError(500, 'Gagal memperbarui status pengiriman.');
            }

            // Perbarui status pesanan terkait berdasarkan status pengiriman
            // Dapatkan order_id dari shipment
            const orderId = shipment.order_id;
            let orderNewStatus = shipment.status; // Default ke status shipment saat ini

            if (value.status === 'shipped') {
                orderNewStatus = 'shipped';
            } else if (value.status === 'delivered') {
                orderNewStatus = 'delivered';
            } else if (value.status === 'cancelled' || value.status === 'returned') {
                orderNewStatus = 'cancelled'; // Atau status 'returned' jika Anda memilikinya di tabel order
            }
            // else if (value.status === 'packing' && order.status !== 'processing') { // Hindari downgrade status
            //     orderNewStatus = 'processing';
            // }

            // Hanya update status order jika ada perubahan yang relevan
            if (orderNewStatus && orderNewStatus !== shipment.status) { // Pastikan orderNewStatus tidak undefined dan berbeda dari status shipment sebelumnya
                await orderModel.updateStatus(orderId, orderNewStatus);
            }

            await connection.commit();
            return {
                status: 'success',
                message: `Status pengiriman berhasil diperbarui menjadi ${value.status}.`
            };
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error in ShipmentService.updateShipmentStatus (transaction rolled back):', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal memperbarui status pengiriman.');
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = new ShipmentService();
