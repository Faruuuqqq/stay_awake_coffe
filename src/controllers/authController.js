// src/controllers/authController.js

const userService = require('../services/userService');
const { getCommonRenderData } = require('../utils/renderHelpers');

const authController = {
    /**
     * Menampilkan halaman login.
     */
    getLoginPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Login' });
            res.render('login-register', { ...commonData, page: 'login' });
        } catch (error) {
            console.error('Error rendering login page:', error.message);
            next(error);
        }
    },

    /**
     * Menampilkan halaman register.
     */
    getRegisterPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Register' });
            res.render('login-register', { ...commonData, page: 'register' });
        } catch (error) {
            console.error('Error rendering register page:', error.message);
            next(error);
        }
    },
    
    /**
     * Registrasi pengguna baru.
     */
    register: async (req, res, next) => {
        const { username, email, password } = req.body;
        try {
            const result = await userService.register({ username, email, password });
            res.status(201).json(result);
        } catch (error) {
            console.error('Error in authController.register:', error.message);
            next(error);
        }
    },

    /**
     * Login pengguna dan membuat HttpOnly Cookie.
     */
    login: async (req, res, next) => {
        const { email, password } = req.body;
        try {
            const result = await userService.login({ email, password });

            // 1. Buat cookie dengan nama 'authToken'
            res.cookie('authToken', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600 * 1000, // 1 jam
                path: '/'
            });

            // 2. Tentukan URL redirect berdasarkan peran pengguna
            const redirectUrl = result.role === 'admin' ? '/admin/dashboard' : '/';

            // 3. Kirim respons sukses beserta redirectUrl ke frontend
            res.status(200).json({
                status: 'success',
                message: 'Login berhasil.',
                redirectUrl: redirectUrl
            });

        } catch (error) {
            // Tangani error jika login gagal
            console.error('Error in authController.login:', error.message);
            next(error); 
        }
    },

    /**
     * Logout pengguna dengan menghapus cookie dan redirect.
     */
    logout: (req, res, next) => {
        try {
            res.clearCookie('authToken');
            res.redirect('/auth/login');
        } catch (error) {
            console.error('Error during logout:', error.message);
            next(error);
        }
    },

    /**
     * Menampilkan halaman forgot password.
     */
    getForgotPasswordPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Forgot Password' });
            res.render('forgot-password', { ...commonData, page: 'Forgot Password' });
        } catch (error) {
            console.error('Error rendering register page:', error.message);
            next(error);
        }
    },
};

module.exports = authController;