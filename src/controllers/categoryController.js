// src/controllers/categoryController.js
const categoryService = require('../services/categoryService'); // Import service layer
const { getCommonRenderData } = require('../utils/renderHelpers'); // Untuk data render umum

const categoryController = {
    /**
     * Mengambil dan menampilkan semua kategori (untuk halaman web atau API JSON).
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getAllCategories: async (req, res, next) => {
        try {
            const result = await categoryService.getAllCategories();
            // Anda bisa memilih untuk merender halaman atau mengembalikan JSON
            // Jika ini adalah endpoint API:
            res.status(200).json(result);

            // Jika ini untuk merender halaman kategori:
            // const commonData = await getCommonRenderData(req.userId, { title: 'Manage Categories' });
            // res.render('admin/categories', { ...commonData, categories: result.data });

        } catch (error) {
            console.error('Error in categoryController.getAllCategories:', error.message);
            next(error); // Meneruskan error ke middleware error global
        }
    },

    /**
     * Mengambil dan menampilkan detail kategori berdasarkan ID.
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getCategoryById: async (req, res, next) => {
        const { id } = req.params;
        try {
            const result = await categoryService.getCategoryById(id);
            res.status(200).json(result); // Mengembalikan JSON detail kategori
        } catch (error) {
            console.error('Error in categoryController.getCategoryById:', error.message);
            next(error); // Meneruskan error ke middleware error global
        }
    },

    /**
     * Membuat kategori baru (hanya untuk admin).
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    createCategory: async (req, res, next) => {
        const { name, image } = req.body;
        try {
            const result = await categoryService.createCategory({ name, image });
            res.status(201).json(result); // Status 201 Created
        } catch (error) {
            console.error('Error in categoryController.createCategory:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui kategori yang sudah ada (hanya untuk admin).
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    updateCategory: async (req, res, next) => {
        const { id } = req.params;
        const { name, image } = req.body;
        try {
            const result = await categoryService.updateCategory(id, { name, image });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in categoryController.updateCategory:', error.message);
            next(error);
        }
    },

    /**
     * Menghapus kategori (hanya untuk admin).
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    deleteCategory: async (req, res, next) => {
        const { id } = req.params;
        try {
            const result = await categoryService.deleteCategory(id);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in categoryController.deleteCategory:', error.message);
            next(error);
        }
    }
};

module.exports = categoryController;
