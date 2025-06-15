// src/models/cartModel.js
const db = require('../config/db');

// Objek Cart berisi semua fungsi interaksi database untuk keranjang belanja dan item keranjang
const Cart = {
    /**
     * Mengambil keranjang berdasarkan ID pengguna.
     * Tidak akan membuat keranjang baru jika tidak ditemukan, itu adalah tugas service layer.
     * @param {number} userId - ID pengguna.
     * @returns {Promise<Object|null>} Objek keranjang jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findByUserId: async (userId) => {
        try {
            const [carts] = await db.execute('SELECT * FROM carts WHERE user_id = ?', [userId]);
            return carts[0] || null;
        } catch (error) {
            console.error(`Error fetching cart by user ID ${userId} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch cart by user ID');
        }
    },

    /**
     * Membuat keranjang baru untuk pengguna.
     * @param {number} userId - ID pengguna.
     * @returns {Promise<Object>} Objek keranjang yang baru dibuat (berisi cart_id dan user_id).
     * @throws {Error} Jika terjadi kesalahan database.
     */
    create: async (userId) => {
        try {
            const [result] = await db.execute(`INSERT INTO carts (user_id) VALUES (?)`, [userId]);
            return { cart_id: result.insertId, user_id: userId };
        } catch (error) {
            console.error(`Error creating cart for user ID ${userId} in DB:`, error.message);
            throw new Error('Database error: Failed to create cart');
        }
    },

    /**
     * Mengambil semua item dalam keranjang tertentu dengan detail produk.
     * @param {number} cartId - ID keranjang.
     * @returns {Promise<Array>} Array objek item keranjang dengan detail produk.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findItemsByCartId: async (cartId) => { // Mengganti getCartItems menjadi findItemsByCartId
        try {
            const [items] = await db.execute(
                `SELECT ci.product_id, ci.quantity, p.name, p.price, p.image, p.stock
                 FROM cart_items ci
                 JOIN products p ON ci.product_id = p.product_id
                 WHERE ci.cart_id = ?`,
                [cartId]
            );
            return items;
        } catch (error) {
            console.error(`Error fetching cart items for cart ID ${cartId} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch cart items');
        }
    },

    /**
     * Mengambil item keranjang tertentu berdasarkan ID keranjang dan ID produk.
     * @param {number} cartId - ID keranjang.
     * @param {number} productId - ID produk.
     * @returns {Promise<Object|null>} Objek item keranjang jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findCartItem: async (cartId, productId) => { // Mengganti getCartItemByProductId menjadi findCartItem
        try {
            const [item] = await db.execute(
                `SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?`,
                [cartId, productId]
            );
            return item[0] || null;
        } catch (error) {
            console.error(`Error finding cart item for cart ID ${cartId}, product ID ${productId} from DB:`, error.message);
            throw new Error('Database error: Failed to find cart item');
        }
    },

    /**
     * Menambahkan item baru ke keranjang.
     * @param {number} cartId - ID keranjang.
     * @param {number} productId - ID produk.
     * @param {number} quantity - Jumlah produk.
     * @returns {Promise<boolean>} True jika item berhasil ditambahkan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    addItem: async (cartId, productId, quantity) => { // Mengganti addOrUpdateCartItem (bagian insert) menjadi addItem
        try {
            const [result] = await db.execute(
                `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
                [cartId, productId, quantity]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error adding item to cart ID ${cartId}, product ID ${productId} in DB:`, error.message);
            throw new Error('Database error: Failed to add cart item');
        }
    },

    /**
     * Memperbarui jumlah item dalam keranjang.
     * @param {number} cartId - ID keranjang.
     * @param {number} productId - ID produk.
     * @param {number} quantity - Jumlah baru produk.
     * @returns {Promise<boolean>} True jika item berhasil diperbarui, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    updateItemQuantity: async (cartId, productId, quantity) => { // Mengganti updateCartItem menjadi updateItemQuantity
        try {
            const [result] = await db.execute(
                `UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?`,
                [quantity, cartId, productId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating quantity for cart ID ${cartId}, product ID ${productId} in DB:`, error.message);
            throw new Error('Database error: Failed to update cart item quantity');
        }
    },

    /**
     * Menghapus item dari keranjang.
     * @param {number} cartId - ID keranjang.
     * @param {number} productId - ID produk.
     * @returns {Promise<boolean>} True jika item berhasil dihapus, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    removeItem: async (cartId, productId) => { // Mengganti removeCartItem menjadi removeItem
        try {
            const [result] = await db.execute(
                `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`,
                [cartId, productId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error removing item from cart ID ${cartId}, product ID ${productId} from DB:`, error.message);
            throw new Error('Database error: Failed to remove cart item');
        }
    },

    /**
     * Mengosongkan keranjang (menghapus semua item dari keranjang).
     * @param {number} cartId - ID keranjang.
     * @returns {Promise<boolean>} True jika keranjang berhasil dikosongkan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    clear: async (cartId) => { // Mengganti clearCart menjadi clear
        try {
            const [result] = await db.execute(
                `DELETE FROM cart_items WHERE cart_id = ?`,
                [cartId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error clearing cart ID ${cartId} from DB:`, error.message);
            throw new Error('Database error: Failed to clear cart');
        }
    }
};

module.exports = Cart;
