// src/controllers/productController.js
const productService = require('../services/productService');
const { getCommonRenderData } = require('../utils/renderHelpers');
const { ApiError } = require('../utils/ApiError');

const productController = {
    /**
     * Menampilkan halaman produk.
     * Logika filter dan paginasi yang tidak terpakai sudah dibersihkan.
     */
    getProductsPage: async (req, res, next) => {
        try {
            // Memanggil service untuk mendapatkan semua data yang diperlukan untuk halaman produk.
            const serviceResult = await productService.getAllProductsForPage({}, req.userId);
            
            // Mengambil data umum untuk rendering (info user, jumlah item di keranjang, dll.)
            const commonData = await getCommonRenderData(req.userId, { title: 'Produk Kami - Stay Awake Coffee' });

            // Merender halaman 'products.ejs' dengan data yang diperlukan.
            res.render('products', {
                ...commonData,
                products: serviceResult.products,
                categories: serviceResult.categories,
            });
        } catch (error) {
            console.error('Error loading products page:', error.message);
            next(error); // Teruskan error ke error handler utama
        }
    },

    /**
     * Mengambil detail produk berdasarkan ID untuk halaman detail.
     */
    getProductById: async (req, res, next) => {
        const { id } = req.params;
        try {
            const serviceResult = await productService.getProductDetail(id);
            const commonData = await getCommonRenderData(req.userId, { title: serviceResult.product.name });

            res.render('product-detail', {
                ...commonData,
                product: serviceResult.product,
                categories: serviceResult.categories,
            });
        } catch (error) {
            // Jika produk tidak ditemukan (error 404), tampilkan halaman 404.
            if (error.statusCode === 404) {
                const commonData = await getCommonRenderData(req.userId, { title: 'Produk Tidak Ditemukan' });
                return res.status(404).render('error', { ...commonData, message: error.message, error: { status: 404 } });
            }
            console.error(`Error fetching product detail for ID ${id}:`, error.message);
            next(error);
        }
    },

    /**
     * Membuat produk baru (hanya untuk admin).
     */
    createProduct: async (req, res, next) => {
        const { category_ids, ...productData } = req.body;
        try {
            const result = await productService.createProduct(productData, category_ids);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error in productController.createProduct:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui produk (hanya untuk admin).
     */
    updateProduct: async (req, res, next) => {
        const { id } = req.params;
        const { category_ids, ...productData } = req.body;
        try {
            const result = await productService.updateProduct(id, productData, category_ids);
            res.status(200).json(result);
        } catch (error) {
            console.error(`Error in productController.updateProduct for ID ${id}:`, error.message);
            next(error);
        }
    },

    /**
     * Menghapus produk (hanya untuk admin).
     */
    deleteProduct: async (req, res, next) => {
        const { id } = req.params;
        try {
            const result = await productService.deleteProduct(id);
            res.status(200).json(result);
        } catch (error) {
            console.error(`Error in productController.deleteProduct for ID ${id}:`, error.message);
            next(error);
        }
    }
};

module.exports = productController;