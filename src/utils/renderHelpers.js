// File: utils/renderHelpers.js

const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const addressModel = require('../models/addressModel');
const paymentModel = require('../models/paymentModel');
const cartModel = require('../models/cartModel');

/**
 * Fungsi pembantu untuk mendapatkan semua data yang dibutuhkan halaman Akun.
 * Digunakan juga sebagai base untuk data umum yang diteruskan ke res.locals di app.js.
 * @param {string} userId ID pengguna yang sedang login.
 * @param {object} [reqBody={}] Request body, untuk formData jika terjadi error.
 * @returns {Promise<object>} Objek berisi data user, orders, addresses, payments, cartItemCount, dll.
 */
async function getCommonRenderData(userId, reqBody = {}) {
  let user = null;
  let orders = [];
  let addresses = [];
  let payments = [];
  let cartItemCount = 0;

  if (userId) {
    user = await userModel.findById(userId);
    if (user) {
      orders = await orderModel.getOrdersByUserId(userId);
      addresses = await addressModel.getAddressesByUserId(userId);
      payments = await paymentModel.getPaymentByUserId(userId);

      // Ambil jumlah item di keranjang untuk header
      const cart = await cartModel.getCartByUserId(userId);
      if (cart) {
        const items = await cartModel.getCartItems(cart.cart_id);
        cartItemCount = items.length;
      }
  }
 }
 return {
  user,
  orders,
  addresses,
  payments,
  cartItemCount,
  formData: reqBody,
  error: null,
  success: null,
    title: 'Stay Awake Coffee',
 };
}

module.exports = {
  getCommonRenderData,
};