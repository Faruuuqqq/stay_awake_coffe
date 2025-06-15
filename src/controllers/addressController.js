// src/controllers/addressController.js
const addressService = require('../services/addressService');
const { getCommonRenderData } = require('../utils/renderHelpers'); // Untuk  data render umum

const addressController = {
    /**
     * Membuat alamat baru untuk pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.userId dari authMiddleware, req.body).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    createAddress: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const addressData = req.body;
            const result = await addressService.createAddress(req.userId, addressData);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error in addressController.createAddress:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil semua alamat untuk pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.userId dari authMiddleware).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getAllMyAddresses: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const result = await addressService.getAddressesByUserId(req.userId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in addressController.getAllMyAddresses:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil detail alamat tertentu untuk pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.params.id, req.userId).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getAddressById: async (req, res, next) => {
        const { id } = req.params;
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const result = await addressService.getAddressById(id, req.userId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in addressController.getAddressById:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui alamat tertentu untuk pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.params.id, req.userId, req.body).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    updateAddress: async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const result = await addressService.updateAddress(id, req.userId, updateData);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in addressController.updateAddress:', error.message);
            next(error);
        }
    },

    /**
     * Menghapus alamat tertentu untuk pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.params.id, req.userId).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    deleteAddress: async (req, res, next) => {
        const { id } = req.params;
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const result = await addressService.deleteAddress(id, req.userId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in addressController.deleteAddress:', error.message);
            next(error);
        }
    }
};

module.exports = addressController;
