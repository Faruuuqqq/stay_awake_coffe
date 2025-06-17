// src/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/ApiError');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_fallback';

/**
 * Middleware BARU: identifyUser
 * Tugasnya hanya mengidentifikasi user dari cookie jika ada, tanpa memblokir request.
 * Akan digunakan secara global di app.js.
 */
const identifyUser = async (req, res, next) => {
    const token = req.cookies.authToken;
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await userModel.findById(decoded.userId);
            if (user) {
                req.userId = user.user_id;
                req.user = user;
            }
        } catch (error) {
            res.clearCookie('authToken');
            console.log('IdentifyUser Middleware: Invalid token found and cleared.');
        }
    }
    next();
};


/**
 * Middleware: protect
 * Tugasnya MEMBLOKIR akses jika user tidak login.
 * Digunakan untuk halaman spesifik seperti /profile, /checkout.
 */
const protect = (req, res, next) => {
    // Middleware ini berasumsi 'identifyUser' sudah berjalan sebelumnya.
    if (req.user) {
        // Jika user sudah teridentifikasi oleh identifyUser, lanjutkan.
        return next();
    }

    // Jika tidak ada user, tangani berdasarkan tipe request.
    if (req.originalUrl.startsWith('/api/')) {
        // Untuk request API, kirim balasan error JSON, JANGAN redirect.
        return res.status(401).json({
            status: 'error',
            message: 'Akses ditolak. Anda harus login untuk mengakses sumber daya ini.'
        });
    } else {
        // Untuk request HALAMAN, lakukan redirect ke halaman login.
        return res.redirect('/auth/login');
    }
};

module.exports = {
    identifyUser,
    protect
};