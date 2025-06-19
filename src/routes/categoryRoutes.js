// src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Rute Publik (siapa pun bisa melihat kategori)
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Rute Admin (membutuhkan autentikasi dan otorisasi admin)
router.post('/', protect, adminMiddleware, categoryController.createCategory);
router.put('/:id', protect, adminMiddleware, categoryController.updateCategory);
router.delete('/:id', protect, adminMiddleware, categoryController.deleteCategory);

module.exports = router;