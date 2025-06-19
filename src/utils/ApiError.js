// src/utils/ApiError.js

class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Anda bisa membuat error spesifik lainnya jika diperlukan, misalnya:
class NotFoundError extends ApiError {
    constructor(message = 'Resource not found', stack = '') {
        super(404, message, true, stack);
    }
}

class BadRequestError extends ApiError {
    constructor(message = 'Bad request', stack = '') {
        super(400, message, true, stack);
    }
}

class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized', stack = '') {
        super(401, message, true, stack);
    }
}

class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden', stack = '') {
        super(403, message, true, stack);
    }
}

module.exports = {
    ApiError,
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError
};