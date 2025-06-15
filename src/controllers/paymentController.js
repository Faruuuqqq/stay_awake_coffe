// src/controllers/paymentController.js
const paymentService = require('../services/paymentService');
const { getCommonRenderData } = require('../utils/renderHelpers'); // Untuk data render umum

const paymentController = {
    /**
     * Mencatat pembayaran baru.
     * Endpoint ini biasanya dipanggil oleh gateway pembayaran (webhook) atau oleh frontend setelah konfirmasi pembayaran.
     * @param {Object} req - Objek request Express (req.body berisi data pembayaran).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    createPayment: async (req, res, next) => {
        try {
            const paymentData = req.body; // { orderId, method, status, transactionId, amountPaid, paidAt }
            const result = await paymentService.createPayment(paymentData);
            res.status(201).json(result); // Status 201 Created
        } catch (error) {
            console.error('Error in paymentController.createPayment:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil detail pembayaran berdasarkan ID (hanya untuk Admin atau pemilik pembayaran).
     * @param {Object} req - Objek request Express (req.params.id).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getPaymentById: async (req, res, next) => {
        const { id } = req.params;
        try {
            // Logika otorisasi bisa ditambahkan di sini atau di middleware:
            // if (req.user.role !== 'admin' && payment.data.user_id !== req.userId) {
            //    throw new ForbiddenError('Anda tidak memiliki izin untuk melihat pembayaran ini.');
            // }
            const result = await paymentService.getPaymentById(id);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in paymentController.getPaymentById:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil pembayaran berdasarkan ID pesanan (Order ID).
     * @param {Object} req - Objek request Express (req.params.orderId).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getPaymentByOrderId: async (req, res, next) => {
        const { orderId } = req.params;
        try {
            const result = await paymentService.getPaymentByOrderId(orderId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in paymentController.getPaymentByOrderId:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil riwayat pembayaran untuk pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.userId dari authMiddleware).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getMyPayments: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const result = await paymentService.getPaymentsByUserId(req.userId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in paymentController.getMyPayments:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui status pembayaran (hanya untuk Admin atau webhook dari payment gateway).
     * @param {Object} req - Objek request Express (req.params.id, req.body.status).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    updatePaymentStatus: async (req, res, next) => {
        const { id } = req.params; // payment_id
        const { status } = req.body;
        try {
            const result = await paymentService.updatePaymentStatus(id, { status });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in paymentController.updatePaymentStatus:', error.message);
            next(error);
        }
    }
};

module.exports = paymentController;
