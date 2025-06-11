const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.findByEmail = async (email) => {
 try {
  const [user] = await db.execute('SELECT * FROM users WHERE email=?', [email]);
  return user[0] || null;
 } catch (error) { 
  throw new Error('Database error: ' + error.message);
 }
};

exports.findById = async (userId) => {
  // console.log(userId);
  try {
    const [user] = await db.execute('SELECT * FROM users WHERE user_id = ? ', [userId]);
    return user[0] || null;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

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
};

exports.updatePassword = async (id, newPassword) => {
  // console.log('updatePassword called with id:', id, 'newPassword:', newPassword ? '[HIDDEN]' : newPassword);
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE user_id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error('Password verification failed:' + error.message);
  }
};

exports.updateUserProfile = async (userId, name, email) => {
  try {
    const [result] = await db.execute(
      `UPDATE users SET name = ?, email = ? WHERE user_id = ?`,
      [name, email, userId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};