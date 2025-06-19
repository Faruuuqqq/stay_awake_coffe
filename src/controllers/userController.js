const userService = require('../services/userService');
const { getCommonRenderData } = require('../utils/renderHelpers');
const { ApiError } = require('../utils/ApiError');

const userController = {
    /**
     * Mengambil daftar semua pengguna (hanya untuk Admin).
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getAllUsers: async (req, res, next) => {
        try {
            const result = await userService.getAllUsers();
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in userController.getAllUsers:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil detail profil pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.userId dari authMiddleware).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getMyProfile: async (req, res, next) => {
        try {
            // req.userId harus disediakan oleh authMiddleware
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const result = await userService.getUserProfile(req.userId);
            // Anda bisa memilih untuk merender halaman profil atau mengembalikan JSON
            // res.status(200).json(result);

            // Contoh render halaman:
            const commonData = await getCommonRenderData(req.userId, { title: 'My Profile' });
            res.render('account', { 
                ...commonData,
                user: result.data,
                addresses: result.addresses,
                orders: result.orders
            });
        } catch (error) {
            console.error('Error in userController.getMyProfile:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil detail profil pengguna tertentu berdasarkan ID (untuk Admin).
     * @param {Object} req - Objek request Express (req.params.id).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getUserProfileById: async (req, res, next) => {
        const { id } = req.params;
        try {
            const result = await userService.getUserProfile(id);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in userController.getUserProfileById:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui profil pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.userId dari authMiddleware, req.body).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    updateMyProfile: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const updateData = req.body;
            const result = await userService.updateProfile(req.userId, updateData);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in userController.updateMyProfile:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui profil pengguna tertentu berdasarkan ID (untuk Admin).
     * @param {Object} req - Objek request Express (req.params.id, req.body).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    updateUserProfileById: async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;
        try {
            const result = await userService.updateProfile(id, updateData);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in userController.updateUserProfileById:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui password pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.userId dari authMiddleware, req.body).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    updateMyPassword: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const passwordData = req.body; // { oldPassword, newPassword }
            const result = await userService.updatePassword(req.userId, passwordData);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in userController.updateMyPassword:', error.message);
            next(error);
        }
    },

    /**
     * Menghapus pengguna yang sedang login.
     * @param {Object} req - Objek request Express (req.userId dari authMiddleware).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    deleteMyAccount: async (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new ApiError(401, 'Unauthorized: User ID not found in request.'));
            }
            const result = await userService.deleteUser(req.userId);
            // Opsional: invalidate JWT atau hapus cookie setelah delete akun
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in userController.deleteMyAccount:', error.message);
            next(error);
        }
    },

    /**
     * Menghapus pengguna tertentu berdasarkan ID (hanya untuk Admin).
     * @param {Object} req - Objek request Express (req.params.id).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    deleteUserById: async (req, res, next) => {
        const { id } = req.params;
        try {
            const result = await userService.deleteUser(id);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in userController.deleteUserById:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui peran pengguna tertentu (hanya untuk Admin).
     * @param {Object} req - Objek request Express (req.params.id, req.body.role).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    updateUserRole: async (req, res, next) => {
        const { id } = req.params;
        const { role } = req.body;
        try {
            const result = await userService.updateRole(id, { role });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in userController.updateUserRole:', error.message);
            next(error);
        }
    }
};

module.exports = userController;
