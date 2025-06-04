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
  console.log(userId);
  try {
    const [user] = await db.execute('SELECT * FROM users WHERE user_id =? ', [id]);
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
  console.log('updatePassword called with id:', id, 'newPassword:', newPassword ? '[HIDDEN]' : newPassword);
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
}

exports.saveResetToken = async (userId, token, expiresAt) => {
  const sql = `INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)`;
  await db.execute(sql, [userId, token, expiresAt]);
};

exports.validateResetToken = async (token) => {
  const sql = `SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()`;
  const [rows] = await db.execute(sql, [token]);
  return rows.length ? rows[0] : null;
};

exports.deleteResetToken = async (token) => {
  const sql = `DELETE FROM password_resets WHERE token = ?`;
  await db.execute(sql, [token]);
};
