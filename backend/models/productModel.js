const db = require('../config/db');

exports.getAllProducts = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, GROUP_CONCAT(c.name) AS categories
      FROM products p
      LEFT JOIN product_categories pc ON p.product_id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.category_id
      GROUP BY p.product_id`
    );
    return rows;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.getProductById = async (id) => {
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
    throw new Error('Database error: ' + error.message);
  }
};

exports.createProduct = async ({ name, description, price, image, stock }) => {
  try {
    const [result] = await db.execute(
      `INSERT INTO products (name, description, price, image, stock)
      VALUES (?, ?, ?, ?, ?)`,
      [name, description, price, image, stock]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.updateProduct = async (id, { name, description, price, image, stock, category_id }) => {
  try {
    const [result] = await db.execute(
      `UPDATE products SET name = ?, description = ?, price = ?, image = ?, stock = ?
       WHERE id = ?`,
      [name, description, price, image, stock, id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.deleteProduct = async (id) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM products WHERE product_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.addProductCategory = async (productId, category_id) => {
  try {
    await db.execute(
      'INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)',
      [productId, category_id]
    );
  } catch (error) {
    throw new Error('Database error: ' + error.message);   
  }
}

exports.removeProductCategory = async (productId) => {
  try {
    await db.execute(
      `DELETE FROM product_categories WHERE product_id = ?`,
      [productId]
    );
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};