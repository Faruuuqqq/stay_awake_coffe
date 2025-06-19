// src/models/productModel.js
const db = require('../config/db');

const Product = {
    /**
     * Mengambil semua produk (tanpa filter/pagination, untuk homepage atau admin).
     * @returns {Promise<Array>} Array of product objects.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findAll: async () => {
        try {
            const [rows] = await db.execute('SELECT * FROM products ORDER BY product_id ASC');
            return rows;
        } catch (error) {
            console.error('Error fetching all products from DB:', error.message);
            throw new Error('Database error: Failed to fetch all products');
        }
    },

    /**
     * Mengambil produk berdasarkan ID dengan kategori digabungkan.
     * @param {number} id - ID produk.
     * @returns {Promise<Object|null>} Objek produk jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findById: async (id) => {
        try {
            const [rows] = await db.execute(
                `SELECT p.*, GROUP_CONCAT(c.name) AS categories_name
                 FROM products p
                 LEFT JOIN product_categories pc ON p.product_id = pc.product_id
                 LEFT JOIN categories c ON pc.category_id = c.category_id
                 WHERE p.product_id = ?
                 GROUP BY p.product_id`, [id]
            );
            if (rows[0]) {
                rows[0].categories = rows[0].categories_name ? rows[0].categories_name.split(',') : [];
                delete rows[0].categories_name; // Hapus kolom mentah
            }
            return rows[0] || null;
        } catch (error) {
            console.error(`Error fetching product by ID ${id} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch product by ID');
        }
    },

    /**
     * Mengambil detail produk berdasarkan ID, termasuk rating rata-rata dan jumlah ulasan.
     * @param {number} productId - ID produk.
     * @returns {Promise<Object|null>} Objek produk lengkap dengan rating jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    getProductByIdWithRatings: async (productId) => {
        try {
            const [rows] = await db.execute(
                `SELECT
                    p.*,
                    GROUP_CONCAT(DISTINCT c.name) AS categories_name,
                    COALESCE(AVG(r.rating), 0) AS averageRating,
                    COUNT(DISTINCT r.review_id) AS reviewCount
                 FROM products p
                 LEFT JOIN product_categories pc ON p.product_id = pc.product_id
                 LEFT JOIN categories c ON pc.category_id = c.category_id
                 LEFT JOIN reviews r ON p.product_id = r.product_id
                 WHERE p.product_id = ?
                 GROUP BY p.product_id`, [productId]
            );
            if (rows[0]) {
                rows[0].categories = rows[0].categories_name ? rows[0].categories_name.split(',') : [];
                delete rows[0].categories_name;
            }
            return rows[0] || null;
        } catch (error) {
            console.error(`Error fetching product by ID ${productId} with ratings from DB:`, error.message);
            throw new Error('Database error: Failed to fetch product with ratings by ID');
        }
    },

    /**
     * Membuat produk baru.
     * @param {Object} productData - Data produk ({ name, description, price, image, stock }).
     * @returns {Promise<number>} ID produk yang baru dibuat.
     * @throws {Error} Jika terjadi kesalahan database.
     */
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

    /**
     * Memperbarui produk.
     * @param {number} id - ID produk.
     * @param {Object} productData - Data yang akan diperbarui ({ name, description, price, image, stock }).
     * @returns {Promise<boolean>} True jika produk berhasil diperbarui, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    updateProduct: async (id, { name, description, price, image, stock }) => {
        try {
            const [result] = await db.execute(
                `UPDATE products SET name = ?, description = ?, price = ?, image = ?, stock = ?
                 WHERE product_id = ?`,
                [name, description, price, image, stock, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating product ID ${id} in DB:`, error.message);
            throw new Error('Database error: Failed to update product');
        }
    },

    /**
     * Menghapus produk.
     * @param {number} id - ID produk.
     * @returns {Promise<boolean>} True jika produk berhasil dihapus, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    deleteProduct: async (id) => {
        try {
            const [result] = await db.execute(
                'DELETE FROM products WHERE product_id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error deleting product ID ${id} from DB:`, error.message);
            throw new Error('Database error: Failed to delete product');
        }
    },

    /**
     * Menambah relasi produk-kategori.
     * @param {number} productId - ID produk.
     * @param {number} category_id - ID kategori.
     * @throws {Error} Jika terjadi kesalahan database.
     */
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

    /**
     * Menghapus relasi produk-kategori (semua untuk produk tertentu).
     * @param {number} productId - ID produk.
     * @throws {Error} Jika terjadi kesalahan database.
     */
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

    /**
     * Mencari produk berdasarkan nama.
     * @param {string} name - Nama produk.
     * @returns {Promise<Object|null>} Objek produk jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findByName: async (name) => {
        try {
            const [rows] = await db.execute('SELECT * FROM products WHERE name = ?', [name]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Error finding product by name '${name}' in DB:`, error.message);
            throw new Error('Database error: Failed to find product by name');
        }
    },

    /**
     * Mengambil semua produk dengan join untuk kategori dan rating, tanpa filter atau pagination.
     * @returns {Promise<Object>} Objek berisi array produk, totalPages=1, dan currentPage=1.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    getProductsWithFilter: async () => { // Parameter 'filters' dihapus dari sini
        let selectFields = `
            p.product_id, p.name, p.description, p.price, p.image, p.stock, p.updated_at,
            COALESCE(AVG(r.rating), 0) AS averageRating,
            COUNT(DISTINCT r.review_id) AS reviewCount,
            GROUP_CONCAT(DISTINCT c.name) AS categories_name
        `;
        let fromAndJoinClauses = `
            FROM products p
            LEFT JOIN product_categories pc ON p.product_id = pc.product_id
            LEFT JOIN categories c ON pc.category_id = c.category_id
            LEFT JOIN reviews r ON p.product_id = r.product_id
        `;
        
        let orderByString = ' ORDER BY p.product_id ASC '; // Default order

        // Kueri utama dan kueri hitungan yang sangat disederhanakan, tanpa WHERE, LIMIT, OFFSET
        let fullQuery = `
            SELECT ${selectFields}
            ${fromAndJoinClauses}
            GROUP BY p.product_id
            ${orderByString}
        `;

        let countQuery = `
            SELECT COUNT(DISTINCT p.product_id) AS count
            FROM products p
            LEFT JOIN product_categories pc ON p.product_id = pc.product_id
            LEFT JOIN categories c ON pc.category_id = c.category_id
        `;

        const fullQueryParams = []; // Array parameter kosong
        const countQueryParams = []; // Array parameter kosong

        try {

            const [productsRows] = await db.execute(fullQuery, fullQueryParams);
            const [countRows] = await db.execute(countQuery, countQueryParams);
            
            const totalProducts = countRows[0].count;
            const totalPages = 1; // Selalu 1 karena tidak ada pagination
            const currentPage = 1;

            const products = productsRows.map(product => ({
                ...product,
                categories: product.categories_name ? product.categories_name.split(',') : [],
                sale: false // Default ke false karena tidak ada kolom 'sale' di DB
            }));

            return {
                products: products,
                totalProducts: totalProducts,
                totalPages: totalPages,
                currentPage: currentPage
            };
        } catch (error) {
            console.error('Error fetching product', error.message);
            throw new Error('Database error: Failed to fetch products with simplified query');
        }
    },

    /**
     * Mengambil jumlah total produk untuk pagination.
     * Ini mungkin tidak lagi diperlukan jika getProductsWithFilter mengembalikan total.
     * @returns {Promise<number>} Total jumlah produk.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    getTotalProductsCount: async () => {
        try {
            const [rows] = await db.execute('SELECT COUNT(*) AS count FROM products');
            return rows[0].count;
        } catch (error) {
            console.error('Error fetching total products count:', error.message);
            throw error;
        }
    },

    /**
     * Mengambil data user berdasarkan ID. (Ini seharusnya ada di userModel, bukan productModel)
     * Dipindahkan dari productModel ke userModel dalam refactoring sebelumnya.
     * Ditinggalkan di sini hanya jika kode lama masih memanggilnya dari productModel.
     */
    getUserById: async (userId) => {
        console.warn("DEPRECATION WARNING: productModel.getUserById is deprecated. Use userModel.findById instead.");
        try {
            const [rows] = await db.execute('SELECT user_id, name, email FROM users WHERE user_id = ?', [userId]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error fetching user by ID from DB (via productModel):', error.message);
            throw error;
        }
    },

    decreaseStock: async (productId, quantity, connection) => {
        // Gunakan koneksi dari service untuk memastikan bagian dari transaksi
        const conn = connection || db; 
        try {
            const [result] = await conn.execute(
                'UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?',
                [quantity, productId, quantity]
            );

            if (result.affectedRows === 0) {
                throw new Error(`Stok tidak mencukupi untuk produk ID ${productId}.`);
            }
            return true;

        } catch (error) {
            console.error(`Error decreasing stock for product ID ${productId}:`, error.message);
            throw error; 
        }
    },
};

module.exports = Product;
