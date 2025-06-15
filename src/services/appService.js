// src/services/appService.js
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const { ApiError } = require('../utils/ApiError');

class AppService {
    /**
     * Mengambil data yang diperlukan untuk halaman beranda (homepage).
     * Ini termasuk daftar produk dan kategori.
     * @returns {Promise<Object>} Objek berisi status, pesan, dan data produk serta kategori.
     * @throws {ApiError} Jika terjadi error saat mengambil data.
     */
    async getHomepageData() {
        try {
            const products = await productModel.getAllProducts(); // Atau findProductsForHomepage jika ada
            const categories = await categoryModel.getAllCategories();

            // Anda bisa menambahkan logika bisnis di sini jika ada,
            // misalnya memilih produk unggulan, atau data promosi.

            return {
                status: 'success',
                message: 'Data beranda berhasil diambil.',
                data: {
                    products,
                    categories
                }
            };
        } catch (error) {
            console.error('Error in AppService.getHomepageData:', error.message);
            // Melemparkan ApiError generik karena ini adalah error internal
            throw new ApiError(500, 'Gagal mengambil data beranda.');
        }
    }
}

module.exports = new AppService();
