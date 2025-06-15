// src/models/addressModel.js
const db = require('../config/db');

// Objek Address berisi semua fungsi interaksi database untuk alamat
const Address = {
    /**
     * Membuat alamat baru.
     * @param {Object} addressData - Data alamat ({ user_id, phone, address, city, postal_code }).
     * @returns {Promise<number>} ID alamat yang baru dibuat.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    create: async ({ user_id, phone, address, city, postal_code }) => {
        try {
            const [result] = await db.query(
                `INSERT INTO addresses (user_id, phone, address, city, postal_code) VALUES (?, ?, ?, ?, ?)`,
                [user_id, phone, address, city, postal_code]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating address in DB:', error.message);
            throw new Error('Database error: Failed to create address');
        }
    },

    /**
     * Mengambil alamat berdasarkan ID.
     * Nama fungsi diubah menjadi `findById` untuk konsistensi.
     * @param {number} address_id - ID alamat.
     * @returns {Promise<Object|null>} Objek alamat jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findById: async (address_id) => {
        try {
            const [rows] = await db.query(
                `SELECT * FROM addresses WHERE address_id = ?`,
                [address_id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error(`Error fetching address by ID ${address_id} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch address by ID');
        }
    },

    /**
     * Mengambil semua alamat berdasarkan ID pengguna.
     * Nama fungsi diubah menjadi `findByUserId` untuk konsistensi.
     * @param {number} user_id - ID pengguna.
     * @returns {Promise<Array>} Array objek alamat.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findByUserId: async (user_id) => { // Mengganti getAddressesByUserId menjadi findByUserId
        try {
            const [rows] = await db.query(
                `SELECT * FROM addresses WHERE user_id = ?`,
                [user_id]
            );
            return rows;
        } catch (error) {
            console.error(`Error fetching addresses for user ID ${user_id} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch addresses by user ID');
        }
    },

    /**
     * Memperbarui alamat yang sudah ada.
     * @param {number} address_id - ID alamat yang akan diperbarui.
     * @param {Object} updateData - Data yang akan diperbarui ({ phone, address, city, postal_code }).
     * @returns {Promise<boolean>} True jika alamat berhasil diperbarui, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    update: async (address_id, { phone, address, city, postal_code }) => {
        try {
            const [result] = await db.query(
                `UPDATE addresses SET phone = ?, address = ?, city = ?, postal_code = ? WHERE address_id = ?`,
                [phone, address, city, postal_code, address_id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating address ID ${address_id} in DB:`, error.message);
            throw new Error('Database error: Failed to update address');
        }
    },

    /**
     * Menghapus alamat berdasarkan ID.
     * @param {number} address_id - ID alamat yang akan dihapus.
     * @returns {Promise<boolean>} True jika alamat berhasil dihapus, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    delete: async (address_id) => {
        try {
            const [result] = await db.query(
                `DELETE FROM addresses WHERE address_id = ?`,
                [address_id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error deleting address ID ${address_id} from DB:`, error.message);
            throw new Error('Database error: Failed to delete address');
        }
    }
};

module.exports = Address;
