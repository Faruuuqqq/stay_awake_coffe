// src/models/addressModel.js
const db = require('../config/db');

// Objek Address berisi semua fungsi interaksi database untuk alamat
const Address = {
    /**
     * Membuat alamat baru.
     */
    create: async ({ user_id, phone, address, city, postal_code }) => {
        try {
            const [result] = await db.query(
                `INSERT INTO addresses (user_id, phone, address, city, postal_code) VALUES (?, ?, ?, ?, ?)`,
                [user_id, phone, address, city, postal_code]
            );
            // Kembalikan objek lengkap dari alamat yang baru dibuat
            return { address_id: result.insertId, user_id, phone, address, city, postal_code };
        } catch (error) {
            console.error('Error creating address in DB:', error.message);
            throw new Error('Database error: Failed to create address');
        }
    },

    /**
     * Mengambil semua alamat berdasarkan ID pengguna.
     */
    findByUserId: async (userId) => {
        try {
            const [rows] = await db.query('SELECT * FROM addresses WHERE user_id = ? ', [userId]);
            return rows;
        } catch (error) {
            console.error(`Error fetching addresses by user ID ${userId} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch addresses by user ID');
        }
    },

    /**
     * Mengambil satu alamat berdasarkan ID-nya.
     */
    findById: async (address_id) => {
        try {
            const [rows] = await db.query('SELECT * FROM addresses WHERE address_id = ?', [address_id]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Error fetching address by ID ${address_id} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch address by ID');
        }
    },

    /**
     * FUNGSI BARU: Mengambil alamat berdasarkan ID alamat DAN ID pengguna.
     * Ini penting untuk memastikan pengguna tidak menggunakan alamat orang lain.
     */
    findByIdAndUserId: async (address_id, user_id) => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM addresses WHERE address_id = ? AND user_id = ?',
                [address_id, user_id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error(`Error fetching address ID ${address_id} for user ID ${user_id} from DB:`, error.message);
            throw new Error('Database error: Failed to verify and fetch address');
        }
    },


    /**
     * Memperbarui alamat berdasarkan ID.
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