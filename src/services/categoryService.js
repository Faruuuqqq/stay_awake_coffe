// src/services/categoryService.js
const categoryModel = require('../models/categoryModel');
const Joi = require('joi');
const { ApiError, NotFoundError, BadRequestError } = require('../utils/ApiError');

// Schema validasi Joi untuk membuat kategori baru
const createCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(255).required().messages({
        'string.base': 'Category name must be a string.',
        'string.empty': 'Category name cannot be empty.',
        'string.min': 'Category name must be at least {#limit} characters long.',
        'string.max': 'Category name cannot exceed {#limit} characters.',
        'any.required': 'Category name is required.'
    }),
    image: Joi.string().trim().uri().allow('').messages({ // Image URL is optional
        'string.base': 'Image URL must be a string.',
        'string.uri': 'Image must be a valid URL.'
    })
});

// Schema validasi Joi untuk memperbarui kategori (semua field opsional)
const updateCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(255),
    image: Joi.string().trim().uri().allow('')
});

class CategoryService {
    /**
     * Mengambil semua kategori beserta jumlah produk terkait.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data kategori.
     */
    async getAllCategories() {
        try {
            const categories = await categoryModel.getAllCategories();
            return {
                status: 'success',
                message: 'Categories retrieved successfully',
                data: categories
            };
        } catch (error) {
            console.error('Error in CategoryService.getAllCategories:', error.message);
            throw new ApiError(500, 'Failed to retrieve categories');
        }
    }

    /**
     * Mengambil kategori berdasarkan ID.
     * @param {number} categoryId - ID kategori.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data kategori.
     * @throws {NotFoundError} Jika kategori tidak ditemukan.
     * @throws {BadRequestError} Jika ID kategori tidak valid.
     */
    async getCategoryById(categoryId) {
        // Validasi input ID kategori
        const { error: idError } = Joi.number().integer().positive().required().validate(categoryId);
        if (idError) {
            throw new BadRequestError(`Invalid category ID: ${idError.message}`);
        }

        try {
            const category = await categoryModel.findById(categoryId);
            if (!category) {
                throw new NotFoundError('Category not found');
            }
            return {
                status: 'success',
                message: 'Category retrieved successfully',
                data: category
            };
        } catch (error) {
            console.error('Error in CategoryService.getCategoryById:', error.message);
            throw error; // Re-throw the original error (NotFoundError or BadRequestError)
        }
    }

    /**
     * Membuat kategori baru.
     * @param {Object} categoryData - Data kategori yang akan dibuat (nama, image).
     * @returns {Promise<Object>} Objek berisi status, pesan, dan ID kategori yang baru.
     * @throws {BadRequestError} Jika data kategori tidak valid atau nama sudah ada.
     */
    async createCategory(categoryData) {
        // Validasi data kategori menggunakan Joi
        const { error, value } = createCategorySchema.validate(categoryData);
        if (error) {
            throw new BadRequestError(`Invalid category data: ${error.details[0].message}`);
        }

        try {
            // Cek apakah nama kategori sudah ada
            const existingCategory = await categoryModel.findByName(value.name);
            if (existingCategory) {
                throw new BadRequestError('Category with this name already exists.');
            }

            const newCategoryId = await categoryModel.create(value.name, value.image);
            return {
                status: 'success',
                message: 'Category created successfully',
                categoryId: newCategoryId
            };
        } catch (error) {
            console.error("Error in CategoryService.createCategory:", error.message);
            throw error;
        }
    }

    /**
     * Memperbarui kategori yang sudah ada.
     * @param {number} categoryId - ID kategori yang akan diperbarui.
     * @param {Object} updateData - Data yang akan diperbarui (nama, image).
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {NotFoundError} Jika kategori tidak ditemukan.
     * @throws {BadRequestError} Jika data pembaruan tidak valid atau nama sudah ada.
     */
    async updateCategory(categoryId, updateData) {
        // Validasi input ID kategori
        const { error: idError } = Joi.number().integer().positive().required().validate(categoryId);
        if (idError) {
            throw new BadRequestError(`Invalid category ID: ${idError.message}`);
        }

        // Validasi data pembaruan menggunakan Joi
        const { error, value } = updateCategorySchema.validate(updateData);
        if (error) {
            throw new BadRequestError(`Invalid update data: ${error.details[0].message}`);
        }

        // Jika nama kategori akan diubah, cek duplikasi nama
        if (value.name) {
            const existingCategory = await categoryModel.findByName(value.name);
            if (existingCategory && existingCategory.category_id !== categoryId) {
                throw new BadRequestError('Category with this name already exists.');
            }
        }

        try {
            // Ambil kategori saat ini untuk mendapatkan nama dan image yang ada
            const currentCategory = await categoryModel.findById(categoryId);
            if (!currentCategory) {
                throw new NotFoundError('Category not found');
            }

            // Gunakan nama dan image dari updateData, jika tidak ada, gunakan yang dari currentCategory
            const nameToUpdate = value.name !== undefined ? value.name : currentCategory.name;
            const imageToUpdate = value.image !== undefined ? value.image : currentCategory.image;


            const updated = await categoryModel.update(categoryId, nameToUpdate, imageToUpdate);
            if (!updated) {
                // Ini seharusnya tidak terjadi jika kategori ditemukan sebelumnya,
                // tetapi sebagai fallback untuk kasus edge
                throw new ApiError(500, 'Failed to update category');
            }
            return {
                status: 'success',
                message: 'Category updated successfully'
            };
        } catch (error) {
            console.error("Error in CategoryService.updateCategory:", error.message);
            throw error;
        }
    }

    /**
     * Menghapus kategori.
     * @param {number} categoryId - ID kategori yang akan dihapus.
     * @returns {Promise<Object>} Objek berisi status dan pesan.
     * @throws {NotFoundError} Jika kategori tidak ditemukan.
     * @throws {BadRequestError} Jika ID kategori tidak valid.
     */
    async deleteCategory(categoryId) {
        // Validasi input ID kategori
        const { error: idError } = Joi.number().integer().positive().required().validate(categoryId);
        if (idError) {
            throw new BadRequestError(`Invalid category ID: ${idError.message}`);
        }

        try {
            // Sebelum menghapus kategori, Anda mungkin ingin memeriksa apakah ada produk yang terkait.
            // Jika ada, Anda bisa melempar error atau menghapus produk terkait juga (cascade delete di DB lebih baik).
            // Untuk saat ini, kita asumsikan database sudah menangani relasi dengan benar (misal: CASCADE DELETE di product_categories)
            // Jika Anda ingin mencegah penghapusan jika ada produk:
            // const productsInCategory = await productModel.findProductsByCategoryId(categoryId); // Asumsi ada method ini
            // if (productsInCategory && productsInCategory.length > 0) {
            //     throw new BadRequestError('Cannot delete category with associated products.');
            // }

            const deleted = await categoryModel.delete(categoryId);
            if (!deleted) {
                throw new NotFoundError('Category not found');
            }
            return {
                status: 'success',
                message: 'Category deleted successfully'
            };
        } catch (error) {
            console.error("Error in CategoryService.deleteCategory:", error.message);
            throw error;
        }
    }
}

module.exports = new CategoryService();
