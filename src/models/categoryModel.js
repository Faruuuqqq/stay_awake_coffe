const db = require('../config/db');

// Fetch All Categories
exports.getAllCategories = async () => {
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
    throw new Error('Database error: ' + error.message);
  }
};

// Fetch Category by ID
exports.getCategoryById = async (id) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories WHERE category_id = ?', [id]);
    return rows[0] || null;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// create a new category
exports.createCategory = async (name) => {
  try {
    const [result] = await db.execute('INSERT INTO categories (name) VALUES (?)', [name]);
    return result.insertId;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// update an existing category
exports.updateCategory = async (id, name) => {
  try {
    const [result] = await db.execute('UPDATE categories SET name = ? WHERE category_id = ?', [name, id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// delete a category by ID
exports.deleteCategory = async (id) => {
  try {
    const [result] = await db.execute('DELETE FROM categories WHERE category_id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};