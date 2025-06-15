// src/services/addressService.js
const addressModel = require('../models/addressModel');
const Joi = require('joi');
const { ApiError, BadRequestError, NotFoundError, ForbiddenError } = require('../utils/ApiError');

// Skema Validasi Joi untuk alamat
const addressSchema = Joi.object({
    phone: Joi.string().trim().pattern(/^[0-9]{10,15}$/).required().messages({
        'string.base': 'Nomor telepon harus berupa string.',
        'string.empty': 'Nomor telepon tidak boleh kosong.',
        'string.pattern.base': 'Nomor telepon harus berupa angka dan antara 10-15 digit.',
        'any.required': 'Nomor telepon wajib diisi.'
    }),
    address: Joi.string().trim().min(5).max(255).required().messages({
        'string.base': 'Alamat harus berupa string.',
        'string.empty': 'Alamat tidak boleh kosong.',
        'string.min': 'Alamat minimal {#limit} karakter.',
        'string.max': 'Alamat maksimal {#limit} karakter.',
        'any.required': 'Alamat wajib diisi.'
    }),
    city: Joi.string().trim().min(2).max(100).required().messages({
        'string.base': 'Kota harus berupa string.',
        'string.empty': 'Kota tidak boleh kosong.',
        'string.min': 'Kota minimal {#limit} karakter.',
        'string.max': 'Kota maksimal {#limit} karakter.',
        'any.required': 'Kota wajib diisi.'
    }),
    postal_code: Joi.string().trim().pattern(/^[0-9]{5}$/).required().messages({
        'string.base': 'Kode pos harus berupa string.',
        'string.empty': 'Kode pos tidak boleh kosong.',
        'string.pattern.base': 'Kode pos harus berupa 5 digit angka.',
        'any.required': 'Kode pos wajib diisi.'
    })
});

const updateAddressSchema = Joi.object({
    phone: Joi.string().trim().pattern(/^[0-9]{10,15}$/).messages({
        'string.base': 'Nomor telepon harus berupa string.',
        'string.pattern.base': 'Nomor telepon harus berupa angka dan antara 10-15 digit.'
    }),
    address: Joi.string().trim().min(5).max(255).messages({
        'string.base': 'Alamat harus berupa string.',
        'string.min': 'Alamat minimal {#limit} karakter.',
        'string.max': 'Alamat maksimal {#limit} karakter.'
    }),
    city: Joi.string().trim().min(2).max(100).messages({
        'string.base': 'Kota harus berupa string.',
        'string.min': 'Kota minimal {#limit} karakter.',
        'string.max': 'Kota maksimal {#limit} karakter.'
    }),
    postal_code: Joi.string().trim().pattern(/^[0-9]{5}$/).messages({
        'string.base': 'Kode pos harus berupa string.',
        'string.pattern.base': 'Kode pos harus berupa 5 digit angka.'
    })
}).min(1).messages({ // Setidaknya satu field harus ada untuk update
    'object.min': 'Setidaknya satu field (phone, address, city, atau postal_code) harus disediakan untuk update alamat.'
});

class AddressService {
    /**
     * Membuat alamat baru untuk pengguna tertentu.
     * @param {number} userId - ID pengguna yang memiliki alamat.
     * @param {Object} addressData - Data alamat yang akan dibuat.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan ID alamat yang baru.
     * @throws {BadRequestError} Jika data tidak valid.
     * @throws {ApiError} Untuk error internal server.
     */
    async createAddress(userId, addressData) {
        // Validasi userId
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        // Validasi data alamat menggunakan Joi
        const { error, value } = addressSchema.validate(addressData);
        if (error) {
            throw new BadRequestError(`Data alamat tidak valid: ${error.details[0].message}`);
        }

        try {
            const newAddressId = await addressModel.create({ user_id: userId, ...value });
            return {
                status: 'success',
                message: 'Alamat berhasil ditambahkan.',
                addressId: newAddressId
            };
        } catch (error) {
            console.error('Error in AddressService.createAddress:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal menambahkan alamat.');
        }
    }

    /**
     * Mengambil semua alamat untuk pengguna tertentu.
     * @param {number} userId - ID pengguna.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data array alamat.
     * @throws {BadRequestError} Jika ID pengguna tidak valid.
     * @throws {ApiError} Untuk error internal server.
     */
    async getAddressesByUserId(userId) {
        // Validasi userId
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        try {
            const addresses = await addressModel.findByUserId(userId);
            return {
                status: 'success',
                message: 'Daftar alamat berhasil diambil.',
                data: addresses
            };
        } catch (error) {
            console.error('Error in AddressService.getAddressesByUserId:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengambil daftar alamat.');
        }
    }

    /**
     * Mengambil detail alamat berdasarkan ID alamat, memastikan alamat tersebut milik pengguna.
     * @param {number} addressId - ID alamat.
     * @param {number} userId - ID pengguna (untuk verifikasi kepemilikan).
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data alamat.
     * @throws {BadRequestError} Jika ID alamat tidak valid.
     * @throws {NotFoundError} Jika alamat tidak ditemukan.
     * @throws {ForbiddenError} Jika alamat bukan milik pengguna.
     * @throws {ApiError} Untuk error internal server.
     */
    async getAddressById(addressId, userId) {
        // Validasi addressId
        const { error: addressIdError } = Joi.number().integer().positive().required().validate(addressId);
        if (addressIdError) {
            throw new BadRequestError(`Invalid address ID: ${addressIdError.message}`);
        }
        // Validasi userId
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        try {
            const address = await addressModel.findById(addressId);
            if (!address) {
                throw new NotFoundError('Alamat tidak ditemukan.');
            }

            // Memastikan alamat ini milik pengguna yang sedang login
            if (address.user_id !== userId) {
                throw new ForbiddenError('Anda tidak memiliki izin untuk mengakses alamat ini.');
            }

            return {
                status: 'success',
                message: 'Detail alamat berhasil diambil.',
                data: address
            };
        } catch (error) {
            console.error('Error in AddressService.getAddressById:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal mengambil detail alamat.');
        }
    }

    /**
     * Memperbarui alamat yang sudah ada, memastikan alamat tersebut milik pengguna.
     * @param {number} addressId - ID alamat yang akan diperbarui.
     * @param {number} userId - ID pengguna (untuk verifikasi kepemilikan).
     * @param {Object} updateData - Data yang akan diperbarui.
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika ID alamat atau data update tidak valid.
     * @throws {NotFoundError} Jika alamat tidak ditemukan.
     * @throws {ForbiddenError} Jika alamat bukan milik pengguna.
     * @throws {ApiError} Untuk error internal server.
     */
    async updateAddress(addressId, userId, updateData) {
        // Validasi addressId
        const { error: addressIdError } = Joi.number().integer().positive().required().validate(addressId);
        if (addressIdError) {
            throw new BadRequestError(`Invalid address ID: ${addressIdError.message}`);
        }
        // Validasi userId
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        // Validasi updateData
        const { error, value } = updateAddressSchema.validate(updateData);
        if (error) {
            throw new BadRequestError(`Data update alamat tidak valid: ${error.details[0].message}`);
        }

        try {
            const existingAddress = await addressModel.findById(addressId);
            if (!existingAddress) {
                throw new NotFoundError('Alamat tidak ditemukan.');
            }

            // Memastikan alamat ini milik pengguna yang sedang login
            if (existingAddress.user_id !== userId) {
                throw new ForbiddenError('Anda tidak memiliki izin untuk memperbarui alamat ini.');
            }

            const updated = await addressModel.update(addressId, value);
            if (!updated) {
                throw new ApiError(500, 'Gagal memperbarui alamat.');
            }
            return {
                status: 'success',
                message: 'Alamat berhasil diperbarui.'
            };
        } catch (error) {
            console.error('Error in AddressService.updateAddress:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal memperbarui alamat.');
        }
    }

    /**
     * Menghapus alamat, memastikan alamat tersebut milik pengguna.
     * @param {number} addressId - ID alamat yang akan dihapus.
     * @param {number} userId - ID pengguna (untuk verifikasi kepemilikan).
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {BadRequestError} Jika ID alamat tidak valid.
     * @throws {NotFoundError} Jika alamat tidak ditemukan.
     * @throws {ForbiddenError} Jika alamat bukan milik pengguna.
     * @throws {ApiError} Untuk error internal server.
     */
    async deleteAddress(addressId, userId) {
        // Validasi addressId
        const { error: addressIdError } = Joi.number().integer().positive().required().validate(addressId);
        if (addressIdError) {
            throw new BadRequestError(`Invalid address ID: ${addressIdError.message}`);
        }
        // Validasi userId
        const { error: userIdError } = Joi.number().integer().positive().required().validate(userId);
        if (userIdError) {
            throw new BadRequestError(`Invalid user ID: ${userIdError.message}`);
        }

        try {
            const existingAddress = await addressModel.findById(addressId);
            if (!existingAddress) {
                throw new NotFoundError('Alamat tidak ditemukan.');
            }

            // Memastikan alamat ini milik pengguna yang sedang login
            if (existingAddress.user_id !== userId) {
                throw new ForbiddenError('Anda tidak memiliki izin untuk menghapus alamat ini.');
            }

            const deleted = await addressModel.delete(addressId);
            if (!deleted) {
                throw new ApiError(500, 'Gagal menghapus alamat.');
            }
            return {
                status: 'success',
                message: 'Alamat berhasil dihapus.'
            };
        } catch (error) {
            console.error('Error in AddressService.deleteAddress:', error.message);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Gagal menghapus alamat.');
        }
    }
}

module.exports = new AddressService();
