const db = require('../config/db');

// Ambil cart user berdasarkan user_id, kalau belum ada buat baru
exports.getCartByUserId = async (userId) => {
  try {
    const [carts] = await db.execute( 'SELECT * FROM carts where user_id = ?', [userId]);
    if (carts.length === 0) {
      const [result] = await db.execute(`INSERT INTO carts (user_id) VALUES (?)`, [userId]);
      const cartId = result.insertId;
      return { cart_id : cartId, user_id: userId };
    }
    return rows[0];
  } catch(error) {  
    throw new Error('Database error: ' + error.message);
  }
};

// Ambil semua item dalam cart dengan detail produk
exports.getCartItems = async (cartId) => {
  try {
    const [items] = await db.execute(
     `SELECT ci.product_id, ci.quantity, p.name, p.price, p.image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = ?`,
      [cartId]
    );
    return items;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// Tambah item ke cart, jika sudah ada update quantity
exports.addOrUpdateCartItem = async (cartId, productId, quantity) => {
  try {
    const [existing] = await db.execute(
      `SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?`,
      [cartId, productId]
    );
    if (existing.length > 0) {
      // Update quantity karna item sudah ada
      const [result] = await db.execute (
        `UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?`, [quantity]
      );
      return result.affectedRows > 0;

    } else {
      // Insert item baru ke cart
      const [result] = await db.execute (
        `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
        [cartId, productId, quantity]
      );
      return result.affectedRows > 0;
    }
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
}

// Update quantity item dalam cart
exports.updateCartItem = async (cartId, productId, quantity) => {
  try {
    if (quantity <= 0) {
      const [result] = await db.execute(
        `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`,
        [cartId, productId]
      );
      return result.affectedRows > 0;
    }
    const [result] = await db.execute(
      `UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?`,
      [quantity, cartId, productId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
}

// hapus item dari cart
exports.removeCartItem = async (cartId, productId) => {
  try {
    const [result] = await db.execute(
      `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`,
      [cartId, productId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// Kosongkan cart
exports.clearCart = async (cartId) => {
  try {
    const [result] = await db.execute(
      `DELETE FROM cart_items WHERE cart_id = ?`,
      [cartId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
}