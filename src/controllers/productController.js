// src/controllers/productController.js
const productService = require('../services/productService');
const { getCommonRenderData } = require('../utils/renderHelpers'); // Tetap digunakan untuk data render umum
const userModel = require('../models/userModel'); // Diperlukan untuk getProductById agar bisa mendapatkan user

const productController = {
    // Fungsi getAllProducts yang sebelumnya mengembalikan JSON, sekarang diganti ke getProductsPage
    // Jika Anda masih butuh endpoint JSON untuk semua produk tanpa render HTML, bisa dibuat terpisah
    // atau diadaptasi dari getAllProductsForPage di service.
    // getAllProducts: async (req, res, next) => { /* ... */ }, // Dihapus atau diadaptasi

    // Mengambil halaman produk dengan filter dan rendering
    getProductsPage: async (req, res, next) => {
        const { search, category, priceMin, priceMax, sort } = req.query;

        try {
            const filters = {
                search: search || '',
                category: category || '',
                priceMin: parseFloat(priceMin) || 0,
                priceMax: parseFloat(priceMax) || 999999,
                sort: sort || ''
            };

            const serviceResult = await productService.getAllProductsForPage(filters, req.userId); // Teruskan userId jika service butuh
            const commonData = await getCommonRenderData(req.userId, { title: 'Stay Awake Coffee - Products' });

            res.render('products', {
                ...commonData,
                products: serviceResult.products,
                categories: serviceResult.categories,
                filters: serviceResult.filters
            });
        } catch (error) {
            console.error('Error loading products page:', error.message);
            const commonData = await getCommonRenderData(req.userId, { title: 'Error' });
            // Mengirimkan status 500 dan render halaman error atau halaman produk kosong
            res.status(500).render('products', { ...commonData, products: [], categories: [], filters: {}, error: 'Failed to load products' });
        }
    },

    // Get product by ID (untuk detail halaman)
    getProductById: async (req, res, next) => {
        const id = req.params.id;
        try {
            // Mengambil data user di controller karena ini terkait sesi/autentikasi request
            let user = null;
            if (req.userId) {
                user = await userModel.findById(req.userId); // Asumsi ada method findById di userModel
            }

            const serviceResult = await productService.getProductDetail(id); // userId mungkin tidak diperlukan di sini
            
            // Menggabungkan data dari service dengan data commonRenderData dan user
            const commonData = await getCommonRenderData(req.userId, { title: serviceResult.product.name });

            res.render('product-detail', {
                ...commonData,
                product: serviceResult.product,
                categories: serviceResult.categories,
                user: user, // Teruskan user yang sudah diambil dari model
            });
        } catch (error) {
            // Periksa statusCode dari error yang dilempar dari service
            if (error.statusCode === 404) {
                const commonData = await getCommonRenderData(req.userId, { title: 'Not Found' });
                return res.status(404).render('404', { ...commonData, message: error.message }); // Render halaman 404
            }
            console.error('Error fetching product detail:', error.message);
            next(error); // Meneruskan error lainnya ke middleware error global
        }
    },

    // Create new product (admin only)
    createProduct: async (req, res, next) => {
        const { category_ids, ...productData } = req.body; // Pisahkan category_ids dari productData
        try {
            const result = await productService.createProduct(productData, category_ids);
            res.status(201).json(result); // result sudah berisi message dan productId dari service
        } catch (error) {
            next(error); // Meneruskan error ke middleware error global
        }
    },

    // Update product (admin only)
    updateProduct: async (req, res, next) => {
        const id = req.params.id;
        const { category_ids, ...productData } = req.body;
        try {
            const result = await productService.updateProduct(id, productData, category_ids);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

    // Delete product (admin only)
    deleteProduct: async (req, res, next) => {
        const id = req.params.id;
        try {
            const result = await productService.deleteProduct(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = productController;