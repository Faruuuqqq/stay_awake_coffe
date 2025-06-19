const shipmentService = require('../services/shipmentService');

const shipmentController = {
    /**
     * Menciptakan pengiriman baru untuk suatu pesanan (hanya untuk Admin).
     * @param {Object} req - Objek request Express (req.body berisi orderId, courier, status).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    createShipment: async (req, res, next) => {
        try {
            const shipmentData = req.body; // { orderId, courier, status }
            const result = await shipmentService.createShipment(shipmentData);
            res.status(201).json(result); // Status 201 Created
        } catch (error) {
            console.error('Error in shipmentController.createShipment:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil detail pengiriman berdasarkan ID Pesanan.
     * Bisa diakses oleh pemilik pesanan atau admin.
     * @param {Object} req - Objek request Express (req.params.orderId, req.userId, req.user.role).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getShipmentByOrderId: async (req, res, next) => {
        const { orderId } = req.params;
        try {
            if (!req.userId || !req.user || !req.user.role) {
                return next(new ApiError(401, 'Unauthorized: User ID or role not found in request.'));
            }
            const result = await shipmentService.getShipmentByOrderId(orderId, req.userId, req.user.role);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in shipmentController.getShipmentByOrderId:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui status pengiriman (hanya untuk Admin atau webhook dari kurir).
     * @param {Object} req - Objek request Express (req.params.id, req.body.status).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    updateShipmentStatus: async (req, res, next) => {
        const { id } = req.params; // shipment_id
        const { status } = req.body;
        try {
            const result = await shipmentService.updateShipmentStatus(id, { status });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in shipmentController.updateShipmentStatus:', error.message);
            next(error);
        }
    }
};

module.exports = shipmentController;
