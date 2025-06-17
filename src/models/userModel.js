// src/models/userModel.js
const db = require('../config/db');
const argon2 = require('argon2'); // Argon2 sudah digunakan, sangat bagus untuk hashing password

// Objek User berisi semua fungsi interaksi database untuk pengguna
const User = {
    /**
     * Mengambil pengguna berdasarkan ID.
     * @param {number} id - ID pengguna.
     * @returns {Promise<Object|null>} Objek pengguna tanpa hash password jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findById: async (id) => {
        try {
            // FIX: Menghapus phone_number dan address karena tidak ada di tabel users
            const [rows] = await db.execute('SELECT user_id, name, email, role FROM users WHERE user_id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Error fetching user by ID ${id} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch user by ID');
        }
    },

    /**
     * Mengambil pengguna berdasarkan email.
     * Mengembalikan semua kolom termasuk password untuk tujuan verifikasi login.
     * @param {string} email - Email pengguna.
     * @returns {Promise<Object|null>} Objek pengguna lengkap jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findByEmail: async (email) => {
        try {
            // FIX: Menghapus phone_number dan address karena tidak ada di tabel users
            // FIX: Memastikan kolom 'password' dipilih untuk verifikasi hash
            const [rows] = await db.execute('SELECT user_id, name, email, role, password FROM users WHERE email = ?', [email]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Error fetching user by email ${email} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch user by email');
        }
    },

    /**
     * Membuat pengguna baru.
     * Password akan di-hash di layer service sebelum dipanggil ke model ini.
     * @param {Object} userData - Data pengguna (username, email, hashedPassword, role).
     * @returns {Promise<number>} ID pengguna yang baru dibuat.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    create: async ({ username, email, hashedPassword, role = 'user' }) => {
        try {
            // Menggunakan 'name' dan 'password' sesuai skema terbaru
            const [result] = await db.execute(
                `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
                [username, email, hashedPassword, role]
            );
            return result.insertId;
        } catch (error) {
            console.error(`Error creating user '${email}' in DB:`, error.message);
            throw new Error('Database error: Failed to create user');
        }
    },

    /**
     * Memperbarui profil pengguna (tidak termasuk password dan role).
     * @param {number} id - ID pengguna.
     * @param {Object} updateData - Data yang akan diperbarui (username, email, phone_number, address).
     * @returns {Promise<boolean>} True jika pengguna berhasil diperbarui, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    updateProfile: async (id, { username, email }) => { // FIX: Menghapus phone_number dan address dari parameter update
        try {
            // FIX: Menghapus phone_number dan address dari query UPDATE karena tidak ada di tabel users
            // Asumsi hanya username dan email yang diupdate di tabel users
            const [result] = await db.execute(
                'UPDATE users SET name = ?, email = ? WHERE user_id = ?',
                [username, email, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating user profile ID ${id} in DB:`, error.message);
            throw new Error('Database error: Failed to update user profile');
        }
    },

    /**
     * Memperbarui password pengguna.
     * Password baru harus sudah di-hash sebelum dipanggil ke model ini.
     * @param {number} id - ID pengguna.
     * @param {string} hashedPassword - Password baru yang sudah di-hash.
     * @returns {Promise<boolean>} True jika password berhasil diperbarui, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    updatePassword: async (id, hashedPassword) => {
        try {
            // Menggunakan 'password' sesuai skema
            const [result] = await db.execute(
                'UPDATE users SET password = ? WHERE user_id = ?',
                [hashedPassword, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating user password ID ${id} in DB:`, error.message);
            throw new Error('Database error: Failed to update user password');
        }
    },

    /**
     * Menghapus pengguna berdasarkan ID.
     * @param {number} id - ID pengguna.
     * @returns {Promise<boolean>} True jika pengguna berhasil dihapus, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    delete: async (id) => {
        try {
            const [result] = await db.execute('DELETE FROM users WHERE user_id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error deleting user ID ${id} from DB:`, error.message);
            throw new Error('Database error: Failed to delete user');
        }
    },

    /**
     * Mengambil semua pengguna (untuk admin).
     * @returns {Promise<Array>} Array objek pengguna tanpa hash password.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findAll: async () => {
        try {
            // FIX: Menghapus phone_number dan address karena tidak ada di tabel users
            const [rows] = await db.execute('SELECT user_id, name, email, role FROM users ORDER BY user_id ASC');
            return rows;
        } catch (error) {
            console.error('Error fetching all users from DB:', error.message);
            throw new Error('Database error: Failed to fetch all users');
        }
    },

    /**
     * Memperbarui peran pengguna (untuk admin).
     * @param {number} id - ID pengguna.
     * @param {string} role - Peran baru (misalnya 'admin', 'user').
     * @returns {Promise<boolean>} True jika peran berhasil diperbarui, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    updateRole: async (id, role) => {
        try {
            const [result] = await db.execute(
                'UPDATE users SET role = ? WHERE user_id = ?',
                [role, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating user role ID ${id} in DB:`, error.message);
            throw new Error('Database error: Failed to update user role');
        }
    }
};

module.exports = User;
