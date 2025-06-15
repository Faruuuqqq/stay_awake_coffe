// src/models/paymentModel.js
const db = require('../config/db');

/**
 * Helper function to format a Date object into MySQL datetime string.
 * @param {Date} dateObj - The Date object to format.
 * @returns {string|null} Formatted datetime string or null if invalid Date.
 */
const formatMysqlDatetime = (dateObj) => {
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return null; // Return null if not a valid Date object, so MySQL accepts NULL
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month starts from 0
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Objek Payment berisi semua fungsi interaksi database untuk pembayaran
const Payment = {
    /**
     * Creates a new payment record.
     * @param {Object} paymentData - Payment data ({ order_id, method, status, transaction_id, amount_paid, paid_at }).
     * @returns {Promise<number>} The ID of the newly created payment.
     * @throws {Error} If a database error occurs.
     */
    create: async ({ order_id, method, status, transaction_id, amount_paid, paid_at }) => {
        try {
            const formatted_paid_at = formatMysqlDatetime(paid_at); // Use the helper function

            const [result] = await db.execute(
                `INSERT INTO payments (order_id, method, status, transaction_id, amount_paid, paid_at)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [order_id, method, status, transaction_id, amount_paid, formatted_paid_at]
            );
            return result.insertId;
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
    findById: async (payment_id) => { // Renamed from getPaymentById
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
    findByOrderId: async (order_id) => { // Renamed from getPaymentByOrderId
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
    updateStatus: async (payment_id, status) => {
        try {
            const [result] = await db.execute(
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
