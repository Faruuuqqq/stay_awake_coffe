// src/routes/addressRoutes.js
const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { protect } = require('../middlewares/authMiddleware');

// Semua rute di sini memerlukan otentikasi
router.use(protect);

// Rute untuk alamat pengguna yang sedang login
router.post('/', addressController.createAddress); // Membuat alamat baru
router.get('/', addressController.getAllMyAddresses); // Mendapatkan semua alamat pengguna
router.get('/:id', addressController.getAddressById); // Mendapatkan detail alamat berdasarkan ID
router.put('/:id', addressController.updateAddress); // Memperbarui alamat berdasarkan ID
router.delete('/:id', addressController.deleteAddress); // Menghapus alamat berdasarkan ID

module.exports = router;
