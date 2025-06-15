// src/controllers/authController.js
const userService = require('../services/userService'); // Mengimpor userService yang baru
const { getCommonRenderData } = require('../utils/renderHelpers');

const authController = {
    /**
     * Menampilkan halaman login.
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getLoginPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Login' });
            res.render('login', { ...commonData });
        } catch (error) {
            console.error('Error rendering login page:', error.message);
            next(error);
        }
    },

    /**
     * Menampilkan halaman register.
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getRegisterPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Register' });
            res.render('register', { ...commonData });
        } catch (error) {
            console.error('Error rendering register page:', error.message);
            next(error);
        }
    },

    /**
     * Melakukan proses registrasi pengguna.
     * @param {Object} req - Objek request Express (req.body berisi username, email, password).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    register: async (req, res, next) => {
        const { username, email, password } = req.body;
        try {
            const result = await userService.register({ username, email, password });
            res.status(201).json(result);
        } catch (error) {
            console.error('Error in authController.register:', error.message);
            next(error); // Meneruskan error ke middleware error global
        }
    },

    /**
     * Melakukan proses login pengguna.
     * @param {Object} req - Objek request Express (req.body berisi email, password).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    login: async (req, res, next) => {
        const { email, password } = req.body;
        try {
            const result = await userService.login({ email, password });
            // Anda mungkin ingin mengatur token di cookie di sini jika menggunakan server-side rendering/cookies
            // res.cookie('jwt', result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in authController.login:', error.message);
            next(error); // Meneruskan error ke middleware error global
        }
    },

    /**
     * Logout pengguna.
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    logout: (req, res, next) => {
        try {
            // Hapus token dari cookie atau sisi klien
            res.clearCookie('jwt'); // Jika menggunakan cookie
            res.status(200).json({ status: 'success', message: 'Berhasil logout.' });
        } catch (error) {
            console.error('Error during logout:', error.message);
            next(error);
        }
    }
};

module.exports = authController;
