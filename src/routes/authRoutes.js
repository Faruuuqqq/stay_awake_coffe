// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rute Autentikasi
router.get('/login', authController.getLoginPage);      // Menampilkan halaman login
router.post('/login', authController.login);            // Proses login
router.get('/register', authController.getRegisterPage);  // Menampilkan halaman register
router.post('/register', authController.register);      // Proses registrasi

// Mengubah logout menjadi GET untuk kemudahan akses via link
router.get('/logout', authController.logout);           // Proses logout

module.exports = router;