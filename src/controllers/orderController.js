const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const addressModel = require('../models/addressModel');

async function getCheckoutPageData(userId, reqBody = {}) {
  let user = null;
  let addresses = [];
  let cartItems = [];
  let totalPrice = 0;

  if (userId) {
    user = await userModel.findById(userId);
    addresses = await addressModel.getAddressesByUserId(userId);
    const cart = await cartModel.getCartByUserId(userId);
    if (cart) {
      cartItems = await cartModel.getCartItems(cart.cart_id);
      totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  }

  return {
    user,
    addresses,
    items: cartItems,
    totalPrice,
    formData: reqBody,
    title: 'Stay Awake Coffee - Checkout',
    error: null,
    success: null,
  };
}

exports.createOrder = async (req, res) => {
  const userId = req.userId;
  const { address_id } = req.body;

  const commonCheckoutData = await getCheckoutPageData(userId, req.body);

  if (!address_id) {
    return res.render('checkout', {
      ...commonCheckoutData,
      error: 'Address is required',
      success: null,
    });
  }

  try {
    const cart = await cartModel.getCartByUserId(userId);
    if (!cart) {
      return res.render('checkout', {
        ...commonCheckoutData,
        error: 'Cart is empty',
        success: null,
      });
    }

    const items = await cartModel.getCartItems(cart.cart_id);
    if (items.length === 0) {
      return res.render('checkout', {
        ...commonCheckoutData,
        error: 'Cart items is empty',
        success: null,
      });
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderId = await orderModel.createOrder(userId, address_id, totalPrice);

    const orderItems = items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      total_price: item.price * item.quantity, // Kolom ini akan masuk ke order_items.total_price
    }));
    await orderModel.createOrderItems(orderId, orderItems);


    await cartModel.clearCart(cart.cart_id);

    res.redirect(`/payment?orderId=${orderId}`);
  } catch (error) {
    console.error("Error creating order:", error);
    return res.render('checkout', {
      ...commonCheckoutData,
      error: error.message,
      success: null,
    });
  }
};

exports.getCheckoutPage = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.redirect('/users/login-register?error=Login required to checkout');
  }

  try {
    const checkoutData = await getCheckoutPageData(userId);
    res.render('checkout', checkoutData);
  } catch (error) {
    console.error('Error loading checkout page:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

exports.getOrderById = async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await orderModel.getOrderById(orderId);
    if (!order) return res.status(404).json({ error:'order not found' });
    res.render('order-detail', {
      order,
      title: 'Stay Awake Coffee - Order Detail',
      error: null,
      success: null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrdersByUser = async (req, res) => {
  const userId = req.userId;
  try {
    const orders = await orderModel.getOrdersByUserId(userId);
    res.json(orders);
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!['pending', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'status not valid' });
  }

  try {
    const updated = await orderModel.updateOrderStatus(orderId, status);
    if (!updated) return res.status(404).json({ error: 'order not found' });
    res.json({ message: 'status order successfully updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};