// src/models/categoryModel.js
const db = require('../config/db');

// Objek Product berisi semua fungsi interaksi database untuk kategori
const Category = {
    /**
     * Mengambil semua kategori beserta jumlah produk yang terkait dengan setiap kategori.
     * @returns {Promise<Array>} Array of category objects.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    getAllCategories: async () => {
        try {
            const [rows] = await db.execute(
                `SELECT c.category_id, c.name, c.image, COUNT(pc.product_id) AS productCount
                 FROM categories c
                 LEFT JOIN product_categories pc ON c.category_id = pc.category_id
                 GROUP BY c.category_id, c.name, c.image
                 ORDER BY c.name ASC`
            );
            return rows;
        } catch (error) {
            console.error('Error fetching all categories from DB:', error.message);
            throw new Error('Database error: Failed to fetch all categories');
        }
    },

    /**
     * Mengambil kategori berdasarkan ID.
     * Nama fungsi diubah menjadi `findById` untuk konsistensi dengan pola yang diharapkan
     * oleh service layer atau model lain.
     * @param {number} id - ID kategori.
     * @returns {Promise<Object|null>} Objek kategori jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findById: async (id) => {
        try {
            const [rows] = await db.execute('SELECT * FROM categories WHERE category_id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Error fetching category by ID ${id} from DB:`, error.message);
            throw new Error('Database error: Failed to fetch category by ID');
        }
    },

    /**
     * Membuat kategori baru.
     * @param {string} name - Nama kategori.
     * @param {string} [image] - URL gambar kategori (opsional).
     * @returns {Promise<number>} ID kategori yang baru dibuat.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    create: async (name, image = null) => { // Menambahkan parameter image dengan default null
        try {
            const [result] = await db.execute('INSERT INTO categories (name, image) VALUES (?, ?)', [name, image]);
            return result.insertId;
        } catch (error) {
            console.error(`Error creating category '${name}' in DB:`, error.message);
            throw new Error('Database error: Failed to create category');
        }
    },

    /**
     * Memperbarui kategori yang sudah ada.
     * @param {number} id - ID kategori.
     * @param {string} name - Nama kategori baru.
     * @param {string} [image] - URL gambar kategori baru (opsional).
     * @returns {Promise<boolean>} True jika kategori berhasil diperbarui, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    update: async (id, name, image = null) => { // Menambahkan parameter image
        try {
            const [result] = await db.execute(
                'UPDATE categories SET name = ?, image = ? WHERE category_id = ?',
                [name, image, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error updating category ID ${id} in DB:`, error.message);
            throw new Error('Database error: Failed to update category');
        }
    },

    /**
     * Menghapus kategori berdasarkan ID.
     * @param {number} id - ID kategori.
     * @returns {Promise<boolean>} True jika kategori berhasil dihapus, false jika tidak ditemukan.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    delete: async (id) => {
        try {
            const [result] = await db.execute(
                'DELETE FROM categories WHERE category_id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error deleting category ID ${id} from DB:`, error.message);
            throw new Error('Database error: Failed to delete category');
        }
    },

    /**
     * Mencari kategori berdasarkan nama.
     * Digunakan untuk mengecek duplikasi nama kategori sebelum membuat yang baru.
     * @param {string} name - Nama kategori yang dicari.
     * @returns {Promise<Object|null>} Objek kategori jika ditemukan, null jika tidak.
     * @throws {Error} Jika terjadi kesalahan database.
     */
    findByName: async (name) => {
        try {
            const [rows] = await db.execute('SELECT * FROM categories WHERE name = ?', [name]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Error finding category by name '${name}' in DB:`, error.message);
            throw new Error('Database error: Failed to find category by name');
        }
    }
};

module.exports = Category;
