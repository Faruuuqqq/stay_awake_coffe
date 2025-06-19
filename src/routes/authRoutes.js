// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rute Autentikasi
router.get('/login', authController.getLoginPage);      // Menampilkan halaman login
router.post('/login', authController.login);            // Proses login
router.get('/register', authController.getRegisterPage);  // Menampilkan halaman register
router.post('/register', authController.register);      // Proses registrasi

router.get('/logout', authController.logout);           // Proses logout
router.get('/forgot-password', authController.getForgotPasswordPage);           // Proses logout

module.exports = router;