// src/controllers/orderController.js
const orderService = require('../services/orderService');
const { getCommonRenderData } = require('../utils/renderHelpers'); // Untuk data render umum
const userModel = require('../models/userModel'); // Untuk mengambil data user jika diperlukan di render

const orderController = {
    /**
     * Membuat pesanan baru dari keranjang pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.userId dari authMiddleware, req.body: { addressId }).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    createOrder: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const { addressId } = req.body;
            const result = await orderService.createOrderFromCart(req.userId, { addressId });
            res.status(201).json(result); // Status 201 Created
        } catch (error) {
            console.error('Error in orderController.createOrder:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil riwayat pesanan untuk pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.userId dari authMiddleware).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getMyOrders: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const result = await orderService.getMyOrders(req.userId);
            res.status(200).json(result);
            // Jika ingin merender halaman riwayat pesanan:
            // const commonData = await getCommonRenderData(req.userId, { title: 'My Orders' });
            // res.render('user-orders', { ...commonData, orders: result.data });
        } catch (error) {
            console.error('Error in orderController.getMyOrders:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil detail pesanan tertentu untuk pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.params.id, req.userId).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getOrderDetail: async (req, res, next) => {
        const { id } = req.params;
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const result = await orderService.getOrderDetail(id, req.userId);
            res.status(200).json(result);
            // Jika ingin merender halaman detail pesanan:
            // const commonData = await getCommonRenderData(req.userId, { title: 'Order Details' });
            // res.render('order-detail', { ...commonData, order: result.data });
        } catch (error) {
            console.error('Error in orderController.getOrderDetail:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil semua pesanan (hanya untuk Admin).
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getAllOrders: async (req, res, next) => {
        try {
            const result = await orderService.getAllOrders();
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in orderController.getAllOrders:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil pesanan berdasarkan status (hanya untuk Admin).
     * @param {Object} req - Objek request Express (req.query.status).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getOrdersByStatus: async (req, res, next) => {
        const { status } = req.query; // Ambil status dari query params
        try {
            const result = await orderService.getOrdersByStatus(status);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in orderController.getOrdersByStatus:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui status pesanan (hanya untuk Admin).
     * @param {Object} req - Objek request Express (req.params.id, req.body.status).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    updateOrderStatus: async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;
        try {
            const result = await orderService.updateOrderStatus(id, { status });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in orderController.updateOrderStatus:', error.message);
            next(error);
        }
    }
};

module.exports = orderController;
