// src/services/productService.js
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const Joi = require('joi');
const { ApiError, NotFoundError, BadRequestError } = require('../utils/ApiError');

// Skema validasi Joi untuk produk (tetap ada untuk create/update)
const productSchema = Joi.object({
    name: Joi.string().trim().min(3).max(255).required().messages({
        'string.base': 'Product name must be a string.',
        'string.empty': 'Product name cannot be empty.',
        'string.min': 'Product name must be at least {#limit} characters long.',
        'string.max': 'Product name cannot exceed {#limit} characters.',
        'any.required': 'Product name is required.'
    }),
    description: Joi.string().trim().allow('').max(1000).messages({
        'string.base': 'Description must be a string.',
        'string.max': 'Description cannot exceed {#limit} characters.'
    }),
    price: Joi.number().positive().precision(2).required().messages({
        'number.base': 'Price must be a number.',
        'number.positive': 'Price must be a positive number.',
        'number.precision': 'Price must have at most {#limit} decimal places.',
        'any.required': 'Price is required.'
    }),
    image: Joi.string().trim().uri().allow('').messages({
        'string.base': 'Image URL must be a string.',
        'string.uri': 'Image must be a valid URL.'
    }),
    stock: Joi.number().integer().min(0).required().messages({
        'number.base': 'Stock must be an integer.',
        'number.integer': 'Stock must be an integer.',
        'number.min': 'Stock cannot be negative.',
        'any.required': 'Stock is required.'
    }),
});

const updateProductSchema = Joi.object({
    name: Joi.string().trim().min(3).max(255),
    description: Joi.string().trim().allow('').max(1000),
    price: Joi.number().positive().precision(2),
    image: Joi.string().trim().uri().allow(''),
    stock: Joi.number().integer().min(0),
});


class ProductService {
    /**
     * Mengambil produk untuk halaman produk.
     * Sekarang tidak menggunakan filter/pagination di model, hanya mengambil semua data.
     * @param {Object} filters - Objek filter (dari controller, digunakan untuk validasi Joi).
     * @param {number} userId - ID pengguna (tidak digunakan di sini).
     * @returns {Promise<Object>} Objek berisi produk, kategori, dan informasi pagination dasar.
     */
    async getAllProductsForPage(filters, userId) {
        // Validasi filter Joi tetap ada di service untuk membersihkan input,
        // meskipun model tidak akan menggunakan semua parameter filter ini saat ini.
        const filterSchema = Joi.object({
            search: Joi.string().trim().allow(''),
            category: Joi.number().integer().positive().allow(''),
            priceMin: Joi.number().min(0).default(0),
            priceMax: Joi.number().min(0).default(999999999),
            sort: Joi.string().valid('price_asc', 'price_desc', 'rating_desc', 'newest_desc', '').default(''),
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).default(12)
        });

        const { error: filterError, value: validatedFilters } = filterSchema.validate(filters);
        if (filterError) {
            throw new BadRequestError(`Invalid filter parameters: ${filterError.details[0].message}`);
        }

        try {
            // FIX: Mengirim objek kosong ke model karena filter/pagination di kueri SQL telah dihapus
            const productsResult = await productModel.getProductsWithFilter({}); 
            const categories = await categoryModel.getAllCategories();
            
            return {
                products: productsResult.products,
                categories: categories,
                filters: validatedFilters, // Tetap teruskan filters yang divalidasi untuk frontend UI
                totalPages: productsResult.totalPages, // Model akan mengembalikan ini (saat ini selalu 1)
                currentPage: productsResult.currentPage
            };
        } catch (error) {
            console.error('Error in ProductService.getAllProductsForPage:', error.message);
            throw error;
        }
    }

    async getProductDetail(productId, userId) {
        const { error: idError } = Joi.number().integer().positive().required().validate(productId);
        if (idError) {
            throw new BadRequestError(`Invalid product ID: ${idError.message}`);
        }

        try {
            const product = await productModel.getProductByIdWithRatings(productId);
            if (!product) {
                throw new NotFoundError('Produk tidak ditemukan');
            }

            const categories = product.categories || []; // Pastikan ini array
            let user = null; // Ini akan dihandle di controller atau middleware
            
            return { product, categories, user };
        } catch (error) {
            console.error('Error in ProductService.getProductDetail:', error.message);
            throw error;
        }
    }

    async createProduct(productData, categoryIds) {
        const { error, value } = productSchema.validate(productData);
        if (error) {
            throw new BadRequestError(`Invalid product data: ${error.details[0].message}`);
        }

        if (categoryIds && !Array.isArray(categoryIds)) {
             throw new BadRequestError('Category IDs must be an array');
        }
        if (categoryIds) {
            const { error: catIdError } = Joi.array().items(Joi.number().integer().positive()).validate(categoryIds);
            if (catIdError) {
                throw new BadRequestError(`Invalid category IDs: ${catIdError.message}`);
            }
        }

        const existingProduct = await productModel.findByName(productData.name);
        if (existingProduct) {
            throw new BadRequestError('Product with this name already exists.');
        }

        const newProductId = await productModel.createProduct(productData);

        if (Array.isArray(categoryIds)) {
            for (const categoryId of categoryIds) {
                const categoryExists = await categoryModel.findById(categoryId);
                if (!categoryExists) {
                    throw new BadRequestError(`Category with ID ${categoryId} does not exist.`);
                }
                await productModel.addProductCategory(newProductId, categoryId);
            }
        }
        return { productId: newProductId, message: 'Produk berhasil dibuat.' };
    }

    async updateProduct(productId, productData, categoryIds) {
        const { error: idError } = Joi.number().integer().positive().required().validate(productId);
        if (idError) {
            throw new BadRequestError(`Invalid product ID: ${idError.message}`);
        }

        const { error, value } = updateProductSchema.validate(productData);
        if (error) {
            throw new BadRequestError(`Invalid product data for update: ${error.details[0].message}`);
        }

        if (categoryIds && !Array.isArray(categoryIds) && categoryIds !== null) {
             throw new BadRequestError('Category IDs must be an array or null.');
        }
        if (categoryIds) {
            const { error: catIdError } = Joi.array().items(Joi.number().integer().positive()).validate(categoryIds);
            if (catIdError) {
                throw new BadRequestError(`Invalid category IDs for update: ${catIdError.message}`);
            }
            for (const categoryId of categoryIds) {
                const categoryExists = await categoryModel.findById(categoryId);
                if (!categoryExists) {
                    throw new BadRequestError(`Category with ID ${categoryId} does not exist.`);
                }
            }
        }
        
        const updated = await productModel.updateProduct(productId, productData);
        if (!updated) {
            throw new NotFoundError('Produk tidak ditemukan');
        }

        if (categoryIds !== undefined) {
            await productModel.removeProductCategory(productId);
            if (Array.isArray(categoryIds) && categoryIds.length > 0) {
                for (const categoryId of categoryIds) {
                    await productModel.addProductCategory(productId, categoryId);
                }
            }
        }

        return { message: 'Produk berhasil diperbarui.' };
    }

    async deleteProduct(productId) {
        const { error: idError } = Joi.number().integer().positive().required().validate(productId);
        if (idError) {
            throw new BadRequestError(`Invalid product ID: ${idError.message}`);
        }

        try {
            await productModel.removeProductCategory(productId);
            const deleted = await productModel.deleteProduct(productId);
            if (!deleted) {
                throw new NotFoundError('Produk tidak ditemukan');
            }
            return { message: 'Produk berhasil dihapus.' };
        } catch (error) {
            console.error("Error in ProductService.deleteProduct:", error.message);
            throw error;
        }
    }
}

module.exports = new ProductService();
