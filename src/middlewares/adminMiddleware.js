const { ApiError, UnauthorizedError, ForbiddenError } = require('../utils/ApiError');

/**
 * Middleware untuk memverifikasi apakah pengguna yang terautentikasi adalah seorang admin.
 * Middleware ini harus dijalankan SETELAH authMiddleware, karena ia bergantung pada req.user.
 */
const adminMiddleware = (req, res, next) => {
    // Pastikan req.user ada, yang seharusnya sudah disetel oleh authMiddleware
    if (!req.user) {
        // Jika req.user tidak ada, berarti authMiddleware mungkin tidak berjalan atau gagal.
        // Melemparkan UnauthorizedError karena tidak ada informasi pengguna.
        console.warn('AdminMiddleware: req.user not found. Authentication might be missing or failed.');
        return next(new UnauthorizedError('Akses ditolak. Autentikasi diperlukan.'));
    }

    // Periksa apakah peran pengguna adalah 'admin'
    if (req.user.role === 'admin') {
        return next(); // Jika admin, lanjutkan ke handler berikutnya
    } else {
        // Jika bukan admin, lemparkan ForbiddenError
        console.warn(`AdminMiddleware: User ID ${req.userId} (Role: ${req.user.role}) attempted to access admin route.`);
        return next(new ForbiddenError('Akses ditolak. Hanya admin yang diizinkan.'));
    }
};

module.exports = adminMiddleware;
