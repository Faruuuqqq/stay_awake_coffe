// src/models/paymentModel.js
const db = require('../config/db');

/**
 * Helper function to format a Date object into MySQL datetime string.
 * @param {Date} dateObj - The Date object to format.
 * @returns {string|null} Formatted datetime string or null if invalid Date.
 */
const formatMysqlDatetime = (dateObj) => {
    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return null; // Kembalikan null jika tanggal tidak valid
    }
    return dateObj.toISOString().slice(0, 19).replace('T', ' ');
};

// Objek Payment berisi semua fungsi interaksi database untuk pembayaran
const Payment = {
    /**
     * Creates a new payment record.
     * @param {Object} paymentData - Payment data ({ order_id, method, status, transaction_id, amount_paid, paid_at }).
     * @returns {Promise<number>} The ID of the newly created payment.
     * @throws {Error} If a database error occurs.
     */
    create: async (paymentData, connection) => { // Terima 'connection'
        const conn = connection || db; // Gunakan koneksi transaksi jika ada
        try {
            const { orderId, method, status, transactionId, amountPaid, paidAt } = paymentData;
            const formatted_paid_at = new Date(); // Biarkan MySQL menangani format

            const [result] = await conn.execute(
                `INSERT INTO payments (order_id, method, status, transaction_id, amount_paid, paid_at) VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, method, status, transactionId, amountPaid, formatted_paid_at]
            );
            return { paymentId: result.insertId, ...paymentData };
        } catch (error) {
            console.error('Error creating payment in DB:', error.message);
            throw new Error('Database error: Failed to create payment');
        }
    },

    /**
     * Fetches a payment record by its ID.
     * @param {number} payment_id - The ID of the payment.
     * @returns {Promise<Object|null>} The payment object if found, null otherwise.
     * @throws {Error} If a database error occurs.
     */
    findById: async (payment_id) => {
        try {
            const [rows] = await db.execute(`SELECT * FROM payments WHERE payment_id = ?`, [payment_id]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Error fetching payment by ID ${payment_id} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch payment by ID');
        }
    },

    /**
     * Fetches a payment record by its associated order ID.
     * @param {number} order_id - The ID of the order.
     * @returns {Promise<Object|null>} The payment object if found, null otherwise.
     * @throws {Error} If a database error occurs.
     */
    findByOrderId: async (order_id) => {
        try {
            const [rows] = await db.execute(`SELECT * FROM payments WHERE order_id = ?`, [order_id]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Error fetching payment by order ID ${order_id} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch payment by order ID');
        }
    },

    /**
     * Fetches all payment records associated with a specific user ID.
     * This query joins with the 'orders' table to link payments to users.
     * @param {number} user_id - The ID of the user.
     * @returns {Promise<Array>} An array of payment objects.
     * @throws {Error} If a database error occurs.
     */
    findByUserId: async (user_id) => { // Renamed from getPaymentByUserId
        try {
            const [rows] = await db.execute(`
                SELECT p.*
                FROM payments p
                JOIN orders o ON p.order_id = o.order_id
                WHERE o.user_id = ?`, [user_id]
            );
            return rows;
        } catch (error) {
            console.error(`Error fetching payments by user ID ${user_id} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch payments by user ID');
        }
    },

    /**
     * Updates the status of a payment.
     * @param {number} payment_id - The ID of the payment to update.
     * @param {string} status - The new status of the payment.
     * @returns {Promise<boolean>} True if the payment was updated, false otherwise.
     * @throws {Error} If a database error occurs.
     */
    updateStatus: async (payment_id, status, connection) => {
        const conn = connection || db;
        try {
            const [result] = await conn.execute(
                `UPDATE payments SET status = ? WHERE payment_id = ?`,
                [status, payment_id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating payment status for ID ${payment_id} in DB:`, error.message);
            throw new Error('Database error: Failed to update payment status');
        }
    },

    /**
     * Updates payment details.
     * @param {number} payment_id - The ID of the payment to update.
     * @param {Object} updateData - Data to update ({ method, status, transaction_id, amount_paid, paid_at }).
     * @returns {Promise<boolean>} True if the payment was updated, false otherwise.
     * @throws {Error} If a database error occurs.
     */
    update: async (payment_id, { method, status, transaction_id, amount_paid, paid_at }) => {
        try {
            const formatted_paid_at = formatMysqlDatetime(paid_at);
            const [result] = await db.execute(
                `UPDATE payments SET method = ?, status = ?, transaction_id = ?, amount_paid = ?, paid_at = ?
                 WHERE payment_id = ?`,
                [method, status, transaction_id, amount_paid, formatted_paid_at, payment_id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating payment ID ${payment_id} in DB:`, error.message);
            throw new Error('Database error: Failed to update payment');
        }
    }
};

module.exports = Payment;
