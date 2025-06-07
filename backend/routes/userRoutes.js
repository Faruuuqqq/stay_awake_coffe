const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/login-register', (req, res) => {
  const successMsg = req.query.success || null;
  res.render('login-register', { error: null, success: successMsg, formData: {} });
});
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Forgot & Reset Password (public access)
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { error: null, success: null, formData: {} });
});

router.post('/forgot-password', authController.requestPasswordReset);
router.get('/reset-password/:token', authController.renderResetPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes (require authentication)
router.post('/change-password', authMiddleware, authController.changePassword);
router.get('/account', authMiddleware, authController.getAccountPage);

module.exports = router;