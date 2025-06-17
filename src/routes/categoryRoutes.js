// src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middlewares/authMiddleware'); // <-- Perubahan di sini
const adminMiddleware = require('../middlewares/adminMiddleware'); // Asumsi admin middleware juga ada

// Rute Publik (siapa pun bisa melihat kategori)
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Rute Admin (membutuhkan autentikasi dan otorisasi admin)
router.post('/', protect, adminMiddleware, categoryController.createCategory); // <-- Perubahan di sini
router.put('/:id', protect, adminMiddleware, categoryController.updateCategory); // <-- Perubahan di sini
router.delete('/:id', protect, adminMiddleware, categoryController.deleteCategory); // <-- Perubahan di sini

module.exports = router;