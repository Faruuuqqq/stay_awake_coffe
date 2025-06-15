// src/services/userService.js
const userModel = require('../models/userModel');
const argon2 = require('argon2');
const Joi = require('joi');
const jwt = require('jsonwebtoken'); // Untuk membuat JWT
const { ApiError, BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } = require('../utils/ApiError');

// Ambil secret key dari environment variables (pastikan ini ada di .env Anda)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Ganti dengan secret key yang kuat dan aman

// Skema Validasi Joi
const registerSchema = Joi.object({
    username: Joi.string().trim().min(3).max(50).required().messages({
        'string.base': 'Username harus berupa string.',
        'string.empty': 'Username tidak boleh kosong.',
        'string.min': 'Username minimal {#limit} karakter.',
        'string.max': 'Username maksimal {#limit} karakter.',
        'any.required': 'Username wajib diisi.'
    }),
    email: Joi.string().trim().email().required().messages({
        'string.base': 'Email harus berupa string.',
        'string.empty': 'Email tidak boleh kosong.',
        'string.email': 'Format email tidak valid.',
        'any.required': 'Email wajib diisi.'
    }),
    password: Joi.string().min(8).max(30).required().messages({
        'string.base': 'Password harus berupa string.',
        'string.empty': 'Password tidak boleh kosong.',
        'string.min': 'Password minimal {#limit} karakter.',
        'string.max': 'Password maksimal {#limit} karakter.',
        'any.required': 'Password wajib diisi.'
    }),
    role: Joi.string().valid('user', 'admin').default('user').messages({
        'any.only': 'Role tidak valid.'
    })
});

const loginSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        'string.base': 'Email harus berupa string.',
        'string.empty': 'Email tidak boleh kosong.',
        'string.email': 'Format email tidak valid.',
        'any.required': 'Email wajib diisi.'
    }),
    password: Joi.string().required().messages({
        'string.base': 'Password harus berupa string.',
        'string.empty': 'Password tidak boleh kosong.',
        'any.required': 'Password wajib diisi.'
    })
});

const updateProfileSchema = Joi.object({
    username: Joi.string().trim().min(3).max(50),
    email: Joi.string().trim().email(),
    phone_number: Joi.string().trim().pattern(/^[0-9]{10,15}$/).allow('').messages({
        'string.pattern.base': 'Nomor telepon harus berupa angka dan antara 10-15 digit.'
    }),
    address: Joi.string().trim().max(255).allow('')
}).min(1).messages({ // Setidaknya satu field harus ada untuk update
    'object.min': 'Setidaknya satu field (username, email, phone_number, atau address) harus disediakan untuk update profil.'
});


const updatePasswordSchema = Joi.object({
    oldPassword: Joi.string().required().messages({
        'string.empty': 'Password lama tidak boleh kosong.',
        'any.required': 'Password lama wajib diisi.'
    }),
    newPassword: Joi.string().min(8).max(30).required().messages({
        'string.base': 'Password baru harus berupa string.',
        'string.empty': 'Password baru tidak boleh kosong.',
        'string.min': 'Password baru minimal {#limit} karakter.',
        'string.max': 'Password baru maksimal {#limit} karakter.',
        'any.required': 'Password baru wajib diisi.'
    })
});

const updateRoleSchema = Joi.object({
    role: Joi.string().valid('user', 'admin').required().messages({
        'any.only': 'Role tidak valid.',
        'any.required': 'Role wajib diisi.'
    })
});

class UserService {
    /**
     * Mendaftarkan pengguna baru.
     * @param {Object} userData - Data pengguna untuk registrasi.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan ID pengguna.
     * @throws {BadRequestError} Jika data tidak valid atau email sudah terdaftar.
     * @throws {ApiError} Untuk error internal server.
     */
    async register(userData) {
        const { error, value } = registerSchema.validate(userData);
        if (error) {
            throw new BadRequestError(`Data registrasi tidak valid: ${error.details[0].message}`);
        }

        try {
            const existingUser = await userModel.findByEmail(value.email);
            if (existingUser) {
                throw new BadRequestError('Email sudah terdaftar.');
            }

            const hashedPassword = await argon2.hash(value.password);
            const newUserId = await userModel.create({
                username: value.username,
                email: value.email,
                hashedPassword: hashedPassword,
                role: value.role
            });

            return {
                status: 'success',
                message: 'Pendaftaran berhasil.',
                userId: newUserId
            };
        } catch (error) {
            console.error('Error in UserService.register:', error.message);
            // Jika error sudah dari ApiError (misal BadRequestError dari atas), re-throw
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mendaftar pengguna.');
        }
    }

    /**
     * Melakukan login pengguna.
     * @param {Object} credentials - Kredensial login (email, password).
     * @returns {Promise<Object>} Objek berisi status, pesan, token, dan data pengguna.
     * @throws {UnauthorizedError} Jika email/password salah.
     * @throws {BadRequestError} Jika kredensial tidak valid.
     * @throws {ApiError} Untuk error internal server.
     */
    async login(credentials) {
        const { error, value } = loginSchema.validate(credentials);
        if (error) {
            throw new BadRequestError(`Kredensial login tidak valid: ${error.details[0].message}`);
        }

        try {
            const user = await userModel.findByEmail(value.email);
            if (!user) {
                throw new UnauthorizedError('Email atau password salah.');
            }

            const isPasswordValid = await argon2.verify(user.password_hash, value.password);
            if (!isPasswordValid) {
                throw new UnauthorizedError('Email atau password salah.');
            }

            // Buat token JWT
            const token = jwt.sign(
                { userId: user.user_id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '1h' } // Token berlaku 1 jam
            );

            // Jangan kirim hash password ke frontend
            const userData = {
                userId: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role,
                phone_number: user.phone_number,
                address: user.address
            };

            return {
                status: 'success',
                message: 'Login berhasil.',
                token: token,
                user: userData
            };
        } catch (error) {
            console.error('Error in UserService.login:', error.message);
            if (error instanceof ApiError) throw error; // Re-throw custom errors
            throw new ApiError(500, 'Gagal login.');
        }
    }

    /**
     * Mengambil semua pengguna (hanya untuk admin).
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data array pengguna.
     * @throws {ApiError} Untuk error internal server.
     */
    async getAllUsers() {
        try {
            const users = await userModel.findAll();
            return {
                status: 'success',
                message: 'Daftar pengguna berhasil diambil.',
                data: users
            };
        } catch (error) {
            console.error('Error in UserService.getAllUsers:', error.message);
            throw new ApiError(500, 'Gagal mengambil daftar pengguna.');
        }
    }

    /**
     * Mengambil detail profil pengguna berdasarkan ID.
     * @param {number} userId - ID pengguna.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data pengguna.
     * @throws {BadRequestError} Jika ID pengguna tidak valid.
     * @throws {NotFoundError} Jika pengguna tidak ditemukan.
     * @throws {ApiError} Untuk error internal server.
     */
    async getUserProfile(userId) {
        const { error: idError } = Joi.number().integer().positive().required().validate(userId);
        if (idError) {
            throw new BadRequestError(`ID pengguna tidak valid: ${idError.message}`);
        }

        try {
            const user = await userModel.findById(userId);
            if (!user) {
                throw new NotFoundError('Pengguna tidak ditemukan.');
            }
            return {
                status: 'success',
                message: 'Profil pengguna berhasil diambil.',
                data: user
            };
        } catch (error) {
            console.error('Error in UserService.getUserProfile:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengambil profil pengguna.');
        }
    }

    /**
     * Memperbarui profil pengguna.
     * @param {number} userId - ID pengguna yang akan diperbarui.
     * @param {Object} updateData - Data profil yang akan diperbarui.
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika data update tidak valid atau email sudah terdaftar.
     * @throws {NotFoundError} Jika pengguna tidak ditemukan.
     * @throws {ApiError} Untuk error internal server.
     */
    async updateProfile(userId, updateData) {
        const { error: idError } = Joi.number().integer().positive().required().validate(userId);
        if (idError) {
            throw new BadRequestError(`ID pengguna tidak valid: ${idError.message}`);
        }

        const { error, value } = updateProfileSchema.validate(updateData);
        if (error) {
            throw new BadRequestError(`Data update profil tidak valid: ${error.details[0].message}`);
        }

        try {
            // Jika email akan diubah, cek duplikasi email
            if (value.email) {
                const existingUser = await userModel.findByEmail(value.email);
                if (existingUser && existingUser.user_id !== userId) { // Pastikan bukan pengguna itu sendiri
                    throw new BadRequestError('Email sudah terdaftar untuk pengguna lain.');
                }
            }

            const updated = await userModel.updateProfile(userId, value);
            if (!updated) {
                throw new NotFoundError('Pengguna tidak ditemukan.');
            }
            return {
                status: 'success',
                message: 'Profil pengguna berhasil diperbarui.'
            };
        } catch (error) {
            console.error('Error in UserService.updateProfile:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal memperbarui profil pengguna.');
        }
    }

    /**
     * Memperbarui password pengguna.
     * @param {number} userId - ID pengguna.
     * @param {Object} passwordData - Data password (oldPassword, newPassword).
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika password tidak valid atau password lama salah.
     * @throws {NotFoundError} Jika pengguna tidak ditemukan.
     * @throws {ApiError} Untuk error internal server.
     */
    async updatePassword(userId, passwordData) {
        const { error: idError } = Joi.number().integer().positive().required().validate(userId);
        if (idError) {
            throw new BadRequestError(`ID pengguna tidak valid: ${idError.message}`);
        }

        const { error, value } = updatePasswordSchema.validate(passwordData);
        if (error) {
            throw new BadRequestError(`Data password tidak valid: ${error.details[0].message}`);
        }

        try {
            const user = await userModel.findById(userId); // Ambil data user lengkap termasuk hash password
            if (!user) {
                throw new NotFoundError('Pengguna tidak ditemukan.');
            }

            const isOldPasswordValid = await argon2.verify(user.password_hash, value.oldPassword);
            if (!isOldPasswordValid) {
                throw new BadRequestError('Password lama salah.');
            }
            if (value.oldPassword === value.newPassword) {
                throw new BadRequestError('Password baru tidak boleh sama dengan password lama.');
            }

            const newHashedPassword = await argon2.hash(value.newPassword);
            const updated = await userModel.updatePassword(userId, newHashedPassword);
            if (!updated) {
                throw new ApiError(500, 'Gagal memperbarui password pengguna.');
            }
            return {
                status: 'success',
                message: 'Password berhasil diperbarui.'
            };
        } catch (error) {
            console.error('Error in UserService.updatePassword:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal memperbarui password.');
        }
    }

    /**
     * Menghapus pengguna berdasarkan ID.
     * @param {number} userId - ID pengguna.
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika ID pengguna tidak valid.
     * @throws {NotFoundError} Jika pengguna tidak ditemukan.
     * @throws {ApiError} Untuk error internal server.
     */
    async deleteUser(userId) {
        const { error: idError } = Joi.number().integer().positive().required().validate(userId);
        if (idError) {
            throw new BadRequestError(`ID pengguna tidak valid: ${idError.message}`);
        }

        try {
            const deleted = await userModel.delete(userId);
            if (!deleted) {
                throw new NotFoundError('Pengguna tidak ditemukan.');
            }
            return {
                status: 'success',
                message: 'Pengguna berhasil dihapus.'
            };
        } catch (error) {
            console.error('Error in UserService.deleteUser:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal menghapus pengguna.');
        }
    }

    /**
     * Memperbarui peran pengguna (hanya admin).
     * @param {number} userId - ID pengguna yang akan diperbarui perannya.
     * @param {Object} roleData - Objek berisi role baru.
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika ID pengguna atau role tidak valid.
     * @throws {NotFoundError} Jika pengguna tidak ditemukan.
     * @throws {ApiError} Untuk error internal server.
     */
    async updateRole(userId, roleData) {
        const { error: idError } = Joi.number().integer().positive().required().validate(userId);
        if (idError) {
            throw new BadRequestError(`ID pengguna tidak valid: ${idError.message}`);
        }

        const { error, value } = updateRoleSchema.validate(roleData);
        if (error) {
            throw new BadRequestError(`Data role tidak valid: ${error.details[0].message}`);
        }

        try {
            const updated = await userModel.updateRole(userId, value.role);
            if (!updated) {
                throw new NotFoundError('Pengguna tidak ditemukan.');
            }
            return {
                status: 'success',
                message: `Peran pengguna berhasil diperbarui menjadi ${value.role}.`
            };
        } catch (error) {
            console.error('Error in UserService.updateRole:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal memperbarui peran pengguna.');
        }
    }
}

module.exports = new UserService();