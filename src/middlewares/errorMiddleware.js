// src/middlewares/errorMiddleware.js
const { ApiError } = require('../utils/ApiError'); // Impor ApiError yang baru

const errorMiddleware = (err, req, res, next) => {
    let error = err;

    // Jika error bukan instance dari ApiError, buat ApiError baru
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, false, err.stack); // isOperational=false untuk error tak terduga
    }

    // Setel status dan body respons
    res.status(error.statusCode).json({
        status: 'error',
        code: error.statusCode,
        message: error.isOperational ? error.message : 'Something went wrong', // Sembunyikan detail error non-operasional
        // stack: process.env.NODE_ENV === 'development' ? error.stack : {} // Tampilkan stack trace hanya di dev
    });

    // Logging error yang tidak operasional (opsional, bisa pakai library logging seperti Winston)
    if (!error.isOperational) {
        console.error('Non-operational error:', error);
    }
};

module.exports = errorMiddleware;