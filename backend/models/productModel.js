const db = require('../config/db');

// Ambil semua produk, optional bisa filter kategori nanti
exports.getAllProducts = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id`
    );
    return rows;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// Ambil produk berdasarkan id
exports.getProductById = async (id) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`, [id]
    );
    return rows[0] || null;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// Tambah produk baru
exports.createProduct = async ({ name, description, price, image, stock, category_id }) => {
  try {
    const [result] = await db.execute(
      `INSERT INTO products (name, description, price, image, stock, category_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, image, stock, category_id]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// Update produk
exports.updateProduct = async (id, { name, description, price, image, stock, category_id }) => {
  try {
    const [result] = await db.execute(
      `UPDATE products SET name = ?, description = ?, price = ?, image = ?, stock = ?, category_id = ?
       WHERE id = ?`,
      [name, description, price, image, stock, category_id, id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// Hapus produk
exports.deleteProduct = async (id) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};
