const db = require('../config/db');

exports.createAddress = async ({ user_id, phone, address, city, postal_code }) => {
  try {
    const [result] = await db.query(
      `INSERT INTO addresses (user_id, phone, address, city, postal_code) VALUES (?, ?, ?, ?, ?)`,
      [user_id, phone, address, city, postal_code]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Error creating address: ' + error.message);
  }
};

exports.getAddressById = async (address_id) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM addresses WHERE address_id = ?`,
      [address_id]
    );
    return rows[0] || null;
  } catch (error) {
    throw new Error('Error fetching address: ' + error.message);
  }
}

exports.getAddressesByUserId = async (user_id) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM addresses WHERE user_id = ?`,
      [user_id]
    );
    return rows;
  } catch (error) {
    throw new Error('Error fetching addresses: ' + error.message);
  }
}

exports.updateAddress = async (address_id, { phone, address, city, postal_code }) => {
  try {
    const [result] = await db.query(
      `UPDATE addresses SET phone = ?, address = ?, city = ?, postal_code = ? WHERE address_id = ?`,
      [phone, address, city, postal_code, address_id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Error updating address: ' + error.message);
  }
};

exports.deleteAddress = async (address_id) => {
  try {
    const [result] = await db.query(
      `DELETE FROM addresses WHERE address_id = ?`,
      [address_id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Error deleting address: ' + error.message);
  }
};