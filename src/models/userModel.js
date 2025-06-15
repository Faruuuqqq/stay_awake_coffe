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
            const [rows] = await db.execute('SELECT user_id, username, email, role, phone_number, address FROM users WHERE user_id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Error fetching user by ID ${id} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch user by ID');
        }
    },

    /**
     * Mengambil pengguna berdasarkan email.
     * Mengembalikan semua kolom termasuk password_hash untuk tujuan verifikasi login.
     * @param {string} email - Email pengguna.
     * @returns {Promise<Object|null>} Objek pengguna lengkap jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findByEmail: async (email) => { // Mengganti getUserBymil menjadi findByEmail
        try {
            const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
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
            const [result] = await db.execute(
                'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
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
    updateProfile: async (id, { username, email, phone_number, address }) => { // Mengganti updateUserProfile menjadi updateProfile
        try {
            const [result] = await db.execute(
                'UPDATE users SET username = ?, email = ?, phone_number = ?, address = ? WHERE user_id = ?',
                [username, email, phone_number, address, id]
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
    updatePassword: async (id, hashedPassword) => { // Mengganti updateUserPassword menjadi updatePassword
        try {
            const [result] = await db.execute(
                'UPDATE users SET password_hash = ? WHERE user_id = ?',
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
    delete: async (id) => { // Mengganti deleteUser menjadi delete
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
    findAll: async () => { // Mengganti getAllUsers menjadi findAll
        try {
            const [rows] = await db.execute('SELECT user_id, username, email, role, phone_number, address FROM users ORDER BY user_id ASC');
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
