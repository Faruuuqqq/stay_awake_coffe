const db = require('../config/db');

exports.getAllCategories = async () => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories');
    return rows;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.getCategoryById = async (id) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.createCategory = async (name) => {
  try {
    const [result] = await db.execute('INSERT INTO categories (name) VALUES (?)', [name]);
    return result.insertId;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.updateCategory = async (id, name) => {
  try {
    const [result] = await db.execute('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.deleteCategory = async (id) => {
  try {
    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};
