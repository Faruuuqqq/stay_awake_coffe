const db = require('../config/db');

// Fetch All Categories
exports.getAllCategories = async () => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories');
    return rows;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// Fetch Category by ID
exports.getCategoryById = async (category_id) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [category_id]);
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
exports.updateCategory = async (category_id, name) => {
  try {
    const [result] = await db.execute('UPDATE categories SET name = ? WHERE id = ?', [name, category_id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// delete a category by ID
exports.deleteCategory = async (category_id) => {
  try {
    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [category_id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};
