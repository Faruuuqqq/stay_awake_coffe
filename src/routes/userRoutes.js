// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { identifyUser, protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Rute Pengguna Biasa (Membutuhkan Autentikasi)
router.get('/me', identifyUser, identifyUser, userController.getMyProfile); // Mendapatkan profil sendiri
router.put('/me', identifyUser, userController.updateMyProfile); // Memperbarui profil sendiri
router.put('/me/password', identifyUser, userController.updateMyPassword); // Memperbarui password sendiri
router.delete('/me', identifyUser, userController.deleteMyAccount); // Menghapus akun sendiri

// Rute Admin (Membutuhkan Autentikasi dan Otorisasi Admin)
// Catatan: Pastikan adminMiddleware Anda bekerja dengan benar dan ditempatkan setelah identifyUser
router.get('/', identifyUser, protect, adminMiddleware, userController.getAllUsers); // Mendapatkan semua pengguna
router.get('/:id', identifyUser,protect, adminMiddleware, userController.getUserProfileById); // Mendapatkan profil pengguna berdasarkan ID
router.put('/:id', identifyUser, protect, adminMiddleware, userController.updateUserProfileById); // Memperbarui profil pengguna berdasarkan ID
router.put('/:id/role', identifyUser, protect, adminMiddleware, userController.updateUserRole); // Memperbarui peran pengguna
router.delete('/:id', identifyUser, protect, adminMiddleware, userController.deleteUserById); // Menghapus pengguna berdasarkan ID

module.exports = router;

