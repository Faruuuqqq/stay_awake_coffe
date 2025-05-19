const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.findByEmail = async (email) => {
 try {
  const [user] = await db.execute('SELECT * FROM users WHERE email=?', [email]);
  return user[0] || null;
 } catch (error) { 
  throw new Error('Database error: ' + error.message);
 }
}

exports.findById = async (id) => {
  try {
    const [user] = await db.execute('SELECT * FROM users WHERE id =? ', [id]);
    return user[0] || null;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
}

exports.createUser = async ({ name, email, password, role }) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
}

exports.updatePassword = async (id, newPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
}

exports.verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error('Password verification failed:' + error.message);
  }
}