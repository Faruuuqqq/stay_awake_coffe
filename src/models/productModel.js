// src/models/productModel.js
const db = require('../config/db');

// Catatan: Nama fungsi model diubah agar lebih konsisten dengan panggilan dari service
// misal: getAllProducts menjadi findAllProducts untuk konsistensi di masa depan,
// atau biarkan saja jika Anda ingin mempertahankan nama lama yang sudah ada di codebase
// Saya akan menggunakan nama yang lebih generik untuk operasi DB di sini.

const Product = {
    // Mengambil semua produk (jika dibutuhkan, tapi kini lebih banyak dipakai getProductsWithFilter)
    findAll: async () => {
        try {
            const [rows] = await db.execute('SELECT * FROM products ORDER BY product_id ASC');
            return rows;
        } catch (error) {
            console.error('Error fetching all products from DB:', error.message);
            throw new Error('Database error: Failed to fetch all products');
        }
    },

    // Mengambil produk berdasarkan ID dengan kategori digabungkan
    findById: async (id) => {
        try {
            const [rows] = await db.execute(
                `SELECT p.*, GROUP_CONCAT(c.name) AS categories
                 FROM products p
                 LEFT JOIN product_categories pc ON p.product_id = pc.product_id
                 LEFT JOIN categories c ON pc.category_id = c.category_id
                 WHERE p.product_id = ?
                 GROUP BY p.product_id`, [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error fetching product by ID from DB:', error.message);
            throw new Error('Database error: Failed to fetch product by ID');
        }
    },

    // Membuat produk baru
    createProduct: async ({ name, description, price, image, stock }) => {
        try {
            const [result] = await db.execute(
                `INSERT INTO products (name, description, price, image, stock)
                 VALUES (?, ?, ?, ?, ?)`,
                [name, description, price, image, stock]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating product in DB:', error.message);
            throw new Error('Database error: Failed to create product');
        }
    },

    // Memperbarui produk
    updateProduct: async (id, { name, description, price, image, stock }) => {
        try {
            // Perhatikan: category_id tidak lagi ada di sini, karena ditangani oleh addProductCategory/removeProductCategory
            const [result] = await db.execute(
                `UPDATE products SET name = ?, description = ?, price = ?, image = ?, stock = ?
                 WHERE product_id = ?`,
                [name, description, price, image, stock, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating product in DB:', error.message);
            throw new Error('Database error: Failed to update product');
        }
    },

    // Menghapus produk
    deleteProduct: async (id) => {
        try {
            const [result] = await db.execute(
                'DELETE FROM products WHERE product_id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting product from DB:', error.message);
            throw new Error('Database error: Failed to delete product');
        }
    },

    // Menambah relasi produk-kategori
    addProductCategory: async (productId, category_id) => {
        try {
            await db.execute(
                'INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)',
                [productId, category_id]
            );
        } catch (error) {
            console.error('Error adding product category in DB:', error.message);
            throw new Error('Database error: Failed to add product category');
        }
    },

    // Menghapus relasi produk-kategori (semua untuk produk tertentu)
    removeProductCategory: async (productId) => {
        try {
            await db.execute(
                `DELETE FROM product_categories WHERE product_id = ?`,
                [productId]
            );
        } catch (error) {
            console.error('Error removing product categories from DB:', error.message);
            throw new Error('Database error: Failed to remove product categories');
        }
    },

    // Mengambil produk dengan filter kategori dan harga (fungsi ini tetap di model)
    getProductsWithFilter: async (filters) => {
        let query = `
            SELECT p.*, GROUP_CONCAT(c.name) AS categories
            FROM products p
            LEFT JOIN product_categories pc ON p.product_id = pc.product_id
            LEFT JOIN categories c ON pc.category_id = c.category_id
        `;
        let params = [];
        let whereClauses = [];

        if (filters.category) {
            whereClauses.push('c.category_id = ?');
            params.push(filters.category);
        }

        if (filters.priceMin > 0 || filters.priceMax < 999999) { // Pastikan hanya tambahkan jika ada batasan
            whereClauses.push('p.price >= ?');
            whereClauses.push('p.price <= ?');
            params.push(filters.priceMin, filters.priceMax);
        }

        if (filters.search) {
            whereClauses.push('(p.name LIKE ? OR p.description LIKE ?)');
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        query += ` GROUP BY p.product_id `; // Penting untuk GROUP_CONCAT

        if (filters.sort) {
            query += `ORDER BY p.price ${filters.sort === 'price_asc' ? 'ASC' : 'DESC'}`;
        } else {
            query += `ORDER BY p.product_id ASC `;
        }

        try {
            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error fetching filtered products from DB:', error.message);
            throw new Error('Database error: Failed to fetch filtered products');
        }
    },

    // getUserById - ini seharusnya ada di userModel, bukan productModel
    // Untuk tujuan refactoring ini, saya akan tambahkan placeholder di productModel
    // Anda harus memindahkannya ke userModel.js jika belum ada.
    getUserById: async (userId) => {
        try {
            const [rows] = await db.execute('SELECT user_id, username, email FROM users WHERE user_id = ?', [userId]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error fetching user by ID from DB:', error.message);
            throw new Error('Database error: Failed to fetch user');
        }
    },
};

module.exports = Product;