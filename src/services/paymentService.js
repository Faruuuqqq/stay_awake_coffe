// src/services/paymentService.js
const paymentModel = require('../models/paymentModel');
const orderModel = require('../models/orderModel'); // Diperlukan untuk memperbarui status order
const db = require('../config/db');
const Joi = require('joi');
const { ApiError, BadRequestError, NotFoundError, ForbiddenError } = require('../utils/ApiError');

const createPaymentSchema = Joi.object({
    orderId: Joi.number().required(),
    method: Joi.string().required(),
    status: Joi.string().required(),
    amountPaid: Joi.number().required(),
    transactionId: Joi.string().allow('', null)
});

const updatePaymentStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').required().messages({
        'string.base': 'Status pembayaran harus berupa string.',
        'any.only': 'Status pembayaran tidak valid.',
        'any.required': 'Status pembayaran wajib diisi.'
    })
});

class PaymentService {
    /**
     * Membuat (mencatat) pembayaran baru untuk sebuah pesanan.
     * @param {number} userId - ID pengguna yang melakukan pembayaran (untuk validasi).
     * @param {Object} paymentData - Data pembayaran dari frontend.
     */
    async createPayment(userId, paymentData) {
        const { error, value } = createPaymentSchema.validate(paymentData);
        if (error) throw new BadRequestError(`Data pembayaran tidak valid: ${error.details[0].message}`);

        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            const order = await orderModel.findById(value.orderId, connection);
            if (!order) throw new NotFoundError('Pesanan tidak ditemukan.');
            
            // TODO: Aktifkan kembali pengecekan keamanan ini setelah fungsionalitas utama berjalan
            // Pengecekan ini dinonaktifkan sementara sesuai permintaan Anda.
            /*
            if (parseInt(order.user_id) !== parseInt(userId)) {
                throw new ForbiddenError('Anda tidak diizinkan membayar pesanan ini.');
            }
            */

            if (parseFloat(order.total_price) !== parseFloat(value.amountPaid)) {
                throw new BadRequestError('Jumlah pembayaran tidak sesuai dengan total tagihan.');
            }

            const newPayment = await paymentModel.create(value, connection);
            await orderModel.updateStatus(value.orderId, 'processing', connection);
            
            await connection.commit();
            return { status: 'success', message: 'Pembayaran berhasil dicatat.', data: newPayment };
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error in PaymentService.createPayment:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mencatat pembayaran.');
        } finally {
            if (connection) connection.release();
        }
    }
    
    /**
     * Mengambil detail pembayaran berdasarkan ID pembayaran.
     * @param {number} paymentId - ID pembayaran.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data pembayaran.
     * @throws {BadRequestError} Jika ID pembayaran tidak valid.
     * @throws {NotFoundError} Jika pembayaran tidak ditemukan.
     * @throws {ApiError} Untuk error internal server.
     */
    async getPaymentById(paymentId) {
        const { error: idError } = Joi.number().integer().positive().required().validate(paymentId);
        if (idError) {
            throw new BadRequestError(`ID pembayaran tidak valid: ${idError.message}`);
        }

        try {
            const payment = await paymentModel.findById(paymentId);
            if (!payment) {
                throw new NotFoundError('Pembayaran tidak ditemukan.');
            }
            return {
                status: 'success',
                message: 'Detail pembayaran berhasil diambil.',
                data: payment
            };
        } catch (error) {
            console.error('Error in PaymentService.getPaymentById:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengambil detail pembayaran.');
        }
    }

    /**
     * Mengambil pembayaran berdasarkan ID pesanan (Order ID).
     * @param {number} orderId - ID pesanan.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data pembayaran.
     * @throws {BadRequestError} Jika ID pesanan tidak valid.
     * @throws {NotFoundError} Jika pembayaran tidak ditemukan.
     * @throws {ApiError} Untuk error internal server.
     */
    async getPaymentByOrderId(orderId) {
        const { error: idError } = Joi.number().integer().positive().required().validate(orderId);
        if (idError) {
            throw new BadRequestError(`ID pesanan tidak valid: ${idError.message}`);
        }

        try {
            const payment = await paymentModel.findByOrderId(orderId);
            if (!payment) {
                throw new NotFoundError('Pembayaran untuk pesanan ini tidak ditemukan.');
            }
            return {
                status: 'success',
                message: 'Detail pembayaran berhasil diambil.',
                data: payment
            };
        } catch (error) {
            console.error('Error in PaymentService.getPaymentByOrderId:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengambil detail pembayaran berdasarkan pesanan.');
        }
    }

    /**
     * Mengambil semua pembayaran untuk pengguna tertentu (riwayat pembayaran).
     * @param {number} userId - ID pengguna.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data array pembayaran.
     * @throws {BadRequestError} Jika ID pengguna tidak valid.
     * @throws {ApiError} Untuk error internal server.
     */
    async getPaymentsByUserId(userId) {
        const { error: idError } = Joi.number().integer().positive().required().validate(userId);
        if (idError) {
            throw new BadRequestError(`ID pengguna tidak valid: ${idError.message}`);
        }

        try {
            const payments = await paymentModel.findByUserId(userId);
            return {
                status: 'success',
                message: 'Riwayat pembayaran berhasil diambil.',
                data: payments
            };
        } catch (error) {
            console.error('Error in PaymentService.getPaymentsByUserId:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengambil riwayat pembayaran.');
        }
    }

    /**
     * Memperbarui status pembayaran.
     * Ini bisa dipanggil oleh sistem gateway pembayaran (webhook) atau admin.
     * @param {number} paymentId - ID pembayaran yang akan diperbarui.
     * @param {Object} statusData - Objek berisi status baru ({ status }).
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika ID pembayaran atau status tidak valid.
     * @throws {NotFoundError} Jika pembayaran tidak ditemukan.
     * @throws {ApiError} Untuk error internal server.
     */
    async updatePaymentStatus(paymentId, statusData) {
        const { error: idError } = Joi.number().integer().positive().required().validate(paymentId);
        if (idError) {
            throw new BadRequestError(`ID pembayaran tidak valid: ${idError.message}`);
        }

        const { error, value } = updatePaymentStatusSchema.validate(statusData);
        if (error) {
            throw new BadRequestError(`Data status tidak valid: ${error.details[0].message}`);
        }

        let connection;
        try {
            connection = await db.getConnection(); // Untuk transaksi
            await connection.beginTransaction();

            const updated = await paymentModel.updateStatus(paymentId, value.status);
            if (!updated) {
                throw new NotFoundError('Pembayaran tidak ditemukan.');
            }

            // Dapatkan kembali detail pembayaran untuk mengambil order_id
            const payment = await paymentModel.findById(paymentId);
            if (!payment) { // Seharusnya tidak terjadi jika updated=true
                throw new ApiError(500, 'Gagal mengambil detail pembayaran setelah update status.');
            }

            // Perbarui status order yang terkait jika pembayaran menjadi 'completed'
            if (value.status === 'completed') {
                await orderModel.updateStatus(payment.order_id, 'processing');
            } else if (value.status === 'failed' || value.status === 'refunded') {
                // Pertimbangkan untuk memperbarui status order menjadi 'cancelled' atau 'failed'
                // tergantung pada alur bisnis Anda jika pembayaran gagal/dikembalikan
                await orderModel.updateStatus(payment.order_id, 'failed');
            }

            await connection.commit();
            return {
                status: 'success',
                message: `Status pembayaran berhasil diperbarui menjadi ${value.status}.`
            };
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error in PaymentService.updatePaymentStatus (transaction rolled back):', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal memperbarui status pembayaran.');
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = new PaymentService();
