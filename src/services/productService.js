
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const Joi = require('joi'); // Impor Joi
const { ApiError, NotFoundError, BadRequestError } = require('../utils/ApiError'); // Impor Custom Error Classes

// Definisikan skema validasi Joi untuk produk
const productSchema = Joi.object({
    name: Joi.string().trim().min(3).max(255).required().messages({
        'string.base': 'Product name must be a string.',
        'string.empty': 'Product name cannot be empty.',
        'string.min': 'Product name must be at least {#limit} characters long.',
        'string.max': 'Product name cannot exceed {#limit} characters.',
        'any.required': 'Product name is required.'
    }),
    description: Joi.string().trim().allow('').max(1000).messages({ // allow('') untuk deskripsi kosong
        'string.base': 'Description must be a string.',
        'string.max': 'Description cannot exceed {#limit} characters.'
    }),
    price: Joi.number().positive().precision(2).required().messages({
        'number.base': 'Price must be a number.',
        'number.positive': 'Price must be a positive number.',
        'number.precision': 'Price must have at most {#limit} decimal places.',
        'any.required': 'Price is required.'
    }),
    image: Joi.string().trim().uri().allow('').messages({ // uri() untuk validasi URL gambar
        'string.base': 'Image URL must be a string.',
        'string.uri': 'Image must be a valid URL.'
    }),
    stock: Joi.number().integer().min(0).required().messages({
        'number.base': 'Stock must be an integer.',
        'number.integer': 'Stock must be an integer.',
        'number.min': 'Stock cannot be negative.',
        'any.required': 'Stock is required.'
    }),
    // category_ids tidak divalidasi di sini karena akan ditangani terpisah
    // Namun, jika Anda ingin validasi array of numbers, bisa ditambahkan:
    // category_ids: Joi.array().items(Joi.number().integer().positive()).messages({
    //     'array.base': 'Category IDs must be an array.',
    //     'array.items': 'Each category ID must be a positive integer.'
    // })
});

// Skema untuk update produk (membuat semua field opsional)
const updateProductSchema = Joi.object({
    name: Joi.string().trim().min(3).max(255),
    description: Joi.string().trim().allow('').max(1000),
    price: Joi.number().positive().precision(2),
    image: Joi.string().trim().uri().allow(''),
    stock: Joi.number().integer().min(0),
});


class ProductService {
    // ... (metode yang sama) ...
    async getAllProductsForPage(filters, userId) {
        try {
            // Logika untuk mengambil produk dengan filter
            const products = await productModel.getProductsWithFilter(filters);
            const categories = await categoryModel.getAllCategories();
            // Asumsi getCommonRenderData akan dipindahkan atau dihandle di layer yang lebih tinggi
            // atau datanya disediakan langsung ke controller jika tidak ada logika bisnis di baliknya.
            // Untuk saat ini, kita kembalikan saja data mentah dan controller yang akan merender.
            return {
                products,
                categories,
                filters // Kembalikan filters agar bisa diteruskan ke frontend
            };
        } catch (error) {
            console.error('Error in ProductService.getAllProductsForPage:', error.message);
            // Melemparkan error ke layer di atas (controller) untuk penanganan global
            throw new Error('Failed to retrieve products for page');
        }
    }

    async getProductDetail(productId, userId) {
        try {
            // Validasi input ID produk
            const { error: idError } = Joi.number().integer().positive().required().validate(productId);
            if (idError) {
                throw new BadRequestError(`Invalid product ID: ${idError.message}`);
            }

            const product = await productModel.findById(productId);
            if (!product) {
                throw new NotFoundError('Product not found'); // Menggunakan NotFoundError
            }

            const categories = product.categories ? product.categories.split(',') : [];

            let user = null; // Ini akan dihandle di controller atau middleware
            // if (userId) {
            //     user = await userModel.findById(userId);
            // }

            return { product, categories, user };
        } catch (error) {
            console.error('Error in ProductService.getProductDetail:', error.message);
            throw error;
        }
    }

    async createProduct(productData, categoryIds) {
        try {
            // Validasi data produk menggunakan Joi
            const { error } = productSchema.validate(productData);
            if (error) {
                throw new BadRequestError(`Invalid product data: ${error.details[0].message}`);
            }

            // Validasi categoryIds
            if (categoryIds && !Array.isArray(categoryIds)) {
                 throw new BadRequestError('Category IDs must be an array');
            }
            if (categoryIds) {
                const { error: catIdError } = Joi.array().items(Joi.number().integer().positive()).validate(categoryIds);
                if (catIdError) {
                    throw new BadRequestError(`Invalid category IDs: ${catIdError.message}`);
                }
            }


            // Cek duplikasi nama produk di service layer
            const existingProduct = await productModel.findByName(productData.name);
            if (existingProduct) {
                throw new BadRequestError('Product with this name already exists.');
            }

            const productId = await productModel.createProduct(productData);

            if (Array.isArray(categoryIds)) {
                for (const categoryId of categoryIds) {
                    // Pastikan kategori itu ada di database (logika bisnis)
                    const categoryExists = await categoryModel.findById(categoryId); // Asumsi categoryModel punya findById
                    if (!categoryExists) {
                        // Jika ada kategori yang tidak valid, Anda bisa membatalkan operasi atau melanjutkannya
                        // Untuk keamanan dan integritas, sebaiknya batalkan
                        throw new BadRequestError(`Category with ID ${categoryId} does not exist.`);
                    }
                    await productModel.addProductCategory(productId, categoryId);
                }
            }
            return { productId, message: 'Product created successfully' };
        } catch (error) {
            console.error("Error in ProductService.createProduct:", error.message);
            throw error;
        }
    }

    async updateProduct(productId, productData, categoryIds) {
        try {
            // Validasi input ID produk
            const { error: idError } = Joi.number().integer().positive().required().validate(productId);
            if (idError) {
                throw new BadRequestError(`Invalid product ID: ${idError.message}`);
            }

            // Validasi data produk menggunakan Joi (semua opsional untuk update)
            const { error } = updateProductSchema.validate(productData);
            if (error) {
                throw new BadRequestError(`Invalid product data for update: ${error.details[0].message}`);
            }

            // Validasi categoryIds
            if (categoryIds && !Array.isArray(categoryIds) && categoryIds !== null) { // Izinkan null untuk hapus semua kategori
                 throw new BadRequestError('Category IDs must be an array or null.');
            }
            if (categoryIds) { // Hanya validasi jika bukan null
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
                throw new NotFoundError('Product not found');
            }

            // Logika update kategori
            if (categoryIds !== undefined) { // Hanya update kategori jika category_ids ada di body
                await productModel.removeProductCategory(productId); // Hapus relasi lama
                if (Array.isArray(categoryIds) && categoryIds.length > 0) {
                    for (const categoryId of categoryIds) {
                        await productModel.addProductCategory(productId, categoryId); // Tambah relasi baru
                    }
                }
            }

            return { message: 'Product updated successfully' };
        } catch (error) {
            console.error("Error in ProductService.updateProduct:", error.message);
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            // Validasi input ID produk
            const { error: idError } = Joi.number().integer().positive().required().validate(productId);
            if (idError) {
                throw new BadRequestError(`Invalid product ID: ${idError.message}`);
            }

            // Hapus relasi kategori dulu
            await productModel.removeProductCategory(productId);
            const deleted = await productModel.deleteProduct(productId);
            if (!deleted) {
                throw new NotFoundError('Product not found');
            }
            return { message: 'Product deleted successfully' };
        } catch (error) {
            console.error("Error in ProductService.deleteProduct:", error.message);
            throw error;
        }
    }

    // Metode untuk halaman produk (tidak perlu validasi body/params, hanya query)
    async getAllProductsForPage(filters, userId) {
        // Validasi filters (opsional, tergantung seberapa ketat Anda ingin memvalidasi query params)
        const filterSchema = Joi.object({
            search: Joi.string().trim().allow(''),
            category: Joi.number().integer().positive().allow(''), // Izinkan string kosong untuk semua kategori
            priceMin: Joi.number().positive().min(0).default(0),
            priceMax: Joi.number().positive().min(0).default(999999),
            sort: Joi.string().valid('price_asc', 'price_desc', '').default('')
        });

        const { error: filterError, value: validatedFilters } = filterSchema.validate(filters);
        if (filterError) {
            throw new BadRequestError(`Invalid filter parameters: ${filterError.details[0].message}`);
        }

        try {
            const products = await productModel.getProductsWithFilter(validatedFilters);
            const categories = await categoryModel.getAllCategories();
            
            // Logika bisnis tambahan jika diperlukan
            if (!products || products.length === 0) {
                 // Tidak melempar error 404 jika tidak ada produk, karena ini halaman daftar
                 // Cukup kembalikan array kosong dan view yang akan menanganinya
            }
            
            return {
                products,
                categories,
                filters: validatedFilters
            };
        } catch (error) {
            console.error('Error in ProductService.getAllProductsForPage:', error.message);
            throw error;
        }
    }
}

module.exports = new ProductService();