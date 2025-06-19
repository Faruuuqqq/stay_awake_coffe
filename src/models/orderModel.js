// src/models/orderModel.js
const db = require('../config/db');

// Objek Order berisi semua fungsi interaksi database untuk pesanan dan item pesanan
const Order = {
    /**
     * Membuat pesanan baru.
     * @param {number} userId - ID pengguna yang membuat pesanan.
     * @param {number} addressId - ID alamat pengiriman.
     * @param {number} totalPrice - Total harga pesanan.
     * @returns {Promise<number>} ID pesanan yang baru dibuat.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    create: async (orderData, connection) => {
        // Fungsi create sudah benar, tidak perlu diubah
        const conn = connection || db;
        try {
            const { user_id, address_id, total_price, status } = orderData;
            const [result] = await conn.execute(
                `INSERT INTO orders (user_id, address_id, total_price, status) VALUES (?, ?, ?, ?)`,
                [user_id, address_id, total_price, status || 'pending']
            );
            return { order_id: result.insertId, ...orderData };
        } catch (error) {
            console.error('Error creating order in DB:', error.message);
            throw new Error('Database error: Failed to create order');
        }
    },

    /**
     * PERBAIKAN DI SINI: Menyimpan satu item pesanan ke database.
     * Menggunakan variabel 'total_price' yang benar.
     */
    addOrderItem: async (itemData, connection) => {
        const conn = connection || db;
        try {
            // PERUBAHAN: Mengambil 'total_price' dari itemData, bukan 'price'
            const { order_id, product_id, quantity, total_price } = itemData;

            if ([order_id, product_id, quantity, total_price].includes(undefined)) {
                throw new Error('Attempted to insert an order item with undefined values.');
            }

            // Menggunakan variabel 'total_price' di query
            await conn.execute(
                `INSERT INTO order_items (order_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)`,
                [order_id, product_id, quantity, total_price]
            );
        } catch (error) {
            console.error('Error adding order item in DB:', error.message);
            throw new Error('Database error: Failed to add order item');
        }
    },
    
    /**
     * Mengambil detail pesanan berdasarkan ID, termasuk alamat pengiriman, informasi pembayaran, dan item pesanan.
     * @param {number} orderId - ID pesanan.
     * @returns {Promise<Object|null>} Objek pesanan lengkap jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findById: async (orderId) => {
        try {
            const [orders] = await db.execute(
                `SELECT o.*,
                        a.phone AS address_phone, a.address AS shipping_address_street, a.city AS shipping_address_city, a.postal_code AS shipping_address_postal_code,
                        p.method AS payment_method, p.status AS payment_status, p.transaction_id AS payment_transaction_id, p.amount_paid AS payment_amount_paid, p.paid_at AS payment_paid_at
                 FROM orders o
                 JOIN addresses a ON o.address_id = a.address_id
                 LEFT JOIN payments p ON o.order_id = p.order_id -- LEFT JOIN jika order mungkin belum dibayar
                 WHERE o.order_id = ?`,
                [orderId]
            );
            if (orders.length === 0) return null;

            const order = orders[0];
            const [items] = await db.execute(
                `SELECT oi.*, prod.name, prod.image
                 FROM order_items oi
                 JOIN products prod ON oi.product_id = prod.product_id
                 WHERE oi.order_id = ?`,
                [orderId]
            );
            order.items = items;
            return order;
        } catch (error) {
            console.error(`Error fetching order by ID ${orderId} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch order by ID');
        }
    },

    /**
     * Mengambil semua pesanan berdasarkan ID pengguna, termasuk alamat, informasi pembayaran, dan item pesanan.
     * @param {number} userId - ID pengguna.
     * @returns {Promise<Array>} Array objek pesanan lengkap.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findByUserId: async (userId) => { // Mengganti getOrdersByUserId menjadi findByUserId
        try {
            const [orders] = await db.execute(
                `SELECT o.*,
                        a.phone AS address_phone, a.address AS shipping_address_street, a.city AS shipping_address_city, a.postal_code AS shipping_address_postal_code,
                        p.method AS payment_method, p.status AS payment_status, p.transaction_id AS payment_transaction_id, p.amount_paid AS payment_amount_paid, p.paid_at AS payment_paid_at
                 FROM orders o
                 JOIN addresses a ON o.address_id = a.address_id
                 LEFT JOIN payments p ON o.order_id = p.order_id
                 WHERE o.user_id = ?
                 ORDER BY o.created_at DESC`,
                [userId]
            );

            // Memuat item untuk setiap order secara efisien
            const ordersWithItems = await Promise.all(orders.map(async (order) => {
                const [items] = await db.execute(
                    `SELECT oi.*, prod.name, prod.image
                     FROM order_items oi
                     JOIN products prod ON oi.product_id = prod.product_id
                     WHERE oi.order_id = ?`,
                    [order.order_id]
                );
                order.items = items;
                return order;
            }));

            return ordersWithItems;
        } catch (error) {
            console.error(`Error fetching orders for user ID ${userId} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch orders by user ID');
        }
    },

    /**
     * Memperbarui status pesanan.
     * @param {number} orderId - ID pesanan.
     * @param {string} status - Status pesanan baru (e.g., 'pending', 'processing', 'shipped', 'delivered', 'cancelled').
     * @returns {Promise<boolean>} True jika status berhasil diperbarui, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    updateStatus: async (orderId, status) => { // Mengganti updateOrderStatus menjadi updateStatus
        try {
            const [result] = await db.execute(
                'UPDATE orders SET status = ? WHERE order_id = ?',
                [status, orderId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating order status for order ID ${orderId} in DB:`, error.message);
            throw new Error('Database error: Failed to update order status');
        }
    },

    /**
     * Mengambil semua pesanan (untuk admin).
     * @returns {Promise<Array>} Array objek pesanan lengkap.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findAll: async () => {
        try {
            const [orders] = await db.execute(
                `SELECT o.*,
                        u.username AS user_username, u.email AS user_email,
                        a.phone AS address_phone, a.address AS shipping_address_street, a.city AS shipping_address_city, a.postal_code AS shipping_address_postal_code,
                        p.method AS payment_method, p.status AS payment_status, p.transaction_id AS payment_transaction_id, p.amount_paid AS payment_amount_paid, p.paid_at AS payment_paid_at
                 FROM orders o
                 JOIN users u ON o.user_id = u.user_id
                 JOIN addresses a ON o.address_id = a.address_id
                 LEFT JOIN payments p ON o.order_id = p.order_id
                 ORDER BY o.created_at DESC`
            );

            // Memuat item untuk setiap order secara efisien
            const ordersWithItems = await Promise.all(orders.map(async (order) => {
                const [items] = await db.execute(
                    `SELECT oi.*, prod.name, prod.image
                     FROM order_items oi
                     JOIN products prod ON oi.product_id = prod.product_id
                     WHERE oi.order_id = ?`,
                    [order.order_id]
                );
                order.items = items;
                return order;
            }));

            return ordersWithItems;
        } catch (error) {
            console.error('Error fetching all orders from DB:', error.message);
            throw new Error('Database error: Failed to fetch all orders');
        }
    },

    /**
     * Mengambil pesanan berdasarkan status (untuk admin).
     * @param {string} status - Status pesanan.
     * @returns {Promise<Array>} Array objek pesanan lengkap.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findByStatus: async (status) => {
        try {
            const [orders] = await db.execute(
                `SELECT o.*,
                        u.username AS user_username, u.email AS user_email,
                        a.phone AS address_phone, a.address AS shipping_address_street, a.city AS shipping_address_city, a.postal_code AS shipping_address_postal_code,
                        p.method AS payment_method, p.status AS payment_status, p.transaction_id AS payment_transaction_id, p.amount_paid AS payment_amount_paid, p.paid_at AS payment_paid_at
                 FROM orders o
                 JOIN users u ON o.user_id = u.user_id
                 JOIN addresses a ON o.address_id = a.address_id
                 LEFT JOIN payments p ON o.order_id = p.order_id
                 WHERE o.status = ?
                 ORDER BY o.created_at DESC`,
                [status]
            );

            const ordersWithItems = await Promise.all(orders.map(async (order) => {
                const [items] = await db.execute(
                    `SELECT oi.*, prod.name, prod.image
                     FROM order_items oi
                     JOIN products prod ON oi.product_id = prod.product_id
                     WHERE oi.order_id = ?`,
                    [order.order_id]
                );
                order.items = items;
                return order;
            }));

            return ordersWithItems;
        } catch (error) {
            console.error(`Error fetching orders by status '${status}' from DB:`, error.message);
            throw new Error('Database error: Failed to fetch orders by status');
        }
    },
    
    /**
     * Mengecek apakah seorang pengguna telah membeli produk tertentu.
     * Digunakan untuk memvalidasi apakah pengguna berhak memberikan ulasan.
     * @param {number} userId - ID pengguna.
     * @param {number} productId - ID produk.
     * @returns {Promise<boolean>} True jika pengguna telah membeli produk, false jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    hasUserPurchasedProduct: async (userId, productId) => {
        try {
            const [rows] = await db.execute(
                `SELECT COUNT(DISTINCT oi.order_item_id) AS count
                 FROM orders o
                 JOIN order_items oi ON o.order_id = oi.order_id
                 WHERE o.user_id = ? AND oi.product_id = ? AND o.status IN ('completed', 'delivered', 'shipped')`, // Mempertimbangkan status order yang relevan
                [userId, productId]
            );
            return rows[0].count > 0;
        } catch (error) {
            console.error(`Error checking if user ID ${userId} purchased product ID ${productId} in DB:`, error.message);
            throw new Error('Database error: Failed to check user purchase history');
        }
    }
};

module.exports = Order;
