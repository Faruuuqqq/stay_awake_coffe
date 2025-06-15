// src/models/shipmentModel.js
const db = require('../config/db');

// Objek Shipment berisi semua fungsi interaksi database untuk pengiriman
const Shipment = {
    /**
     * Menciptakan catatan pengiriman baru.
     * @param {Object} shipmentData - Data pengiriman ({ order_id, courier, status }).
     * @returns {Promise<number>} ID pengiriman yang baru dibuat.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    create: async ({ order_id, courier, status = 'packing' }) => { // Renamed from createShipment
        try {
            const [result] = await db.execute(
                `INSERT INTO shipment (order_id, courier, status)
                VALUES (?, ?, ?)`,
                [order_id, courier, status]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating shipment in DB:', error.message);
            throw new Error('Database error: Failed to create shipment');
        }
    },

    /**
     * Mengambil catatan pengiriman berdasarkan ID Pesanan (Order ID).
     * @param {number} orderId - ID pesanan.
     * @returns {Promise<Object|null>} Objek pengiriman jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findByOrderId: async (orderId) => { // Renamed from getShipmentByOrderId
        try {
            const [rows] = await db.execute(
                `SELECT * FROM shipment WHERE order_id = ?`,
                [orderId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error(`Error fetching shipment by order ID ${orderId} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch shipment by order ID');
        }
    },

    /**
     * Memperbarui status pengiriman.
     * @param {number} shipmentId - ID pengiriman.
     * @param {string} status - Status pengiriman baru.
     * @returns {Promise<boolean>} True jika status berhasil diperbarui, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    updateStatus: async (shipmentId, status) => { // Renamed from updateShipmentStatus
        try {
            const [result] = await db.execute(
                `UPDATE shipment SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE shipment_id = ?`,
                [status, shipmentId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating shipment status for ID ${shipmentId} in DB:`, error.message);
            throw new Error('Database error: Failed to update shipment status');
        }
    },

    /**
     * Mengambil catatan pengiriman berdasarkan ID pengiriman.
     * Ini akan berguna untuk update status.
     * @param {number} shipmentId - ID pengiriman.
     * @returns {Promise<Object|null>} Objek pengiriman jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findById: async (shipmentId) => {
        try {
            const [rows] = await db.execute(`SELECT * FROM shipment WHERE shipment_id = ?`, [shipmentId]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Error fetching shipment by ID ${shipmentId} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch shipment by ID');
        }
    }
};

module.exports = Shipment;
