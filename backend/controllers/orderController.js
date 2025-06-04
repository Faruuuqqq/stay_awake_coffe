const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel');

exports.createOrder = async (req, res) => {
  const userId = req.userId;
  const { address_id } = req.body;

  if (!address_id) {
    return res.render('checkout', {
      error: 'Address is required',
      success: null,
      formData: req.body,
    });
  }

  try {
    const cart = await cartModel.getCartByUserId(userId);
    if (!cart) {
      return res.render('checkout', {
        error: 'Cart is empty',
        success: null,
        formData: req.body,
      });
    }

    const items = await cartModel.getCartItems(cart.cart_id);
    if (items.length === 0) {
      return res.render('checkout', {
        error: 'Cart items is empty',
        success: null,
        formData: req.body,
      });
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderId = await orderModel.createOrder(userId, address_id, totalPrice);

    const orderItems = items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
    }));

    await orderModel.createOrderItems(orderId, orderItems);

    await cartModel.clearCart(cart.cart_id);

    // Redirect ke halaman pembayaran, kirim orderId sebagai query param
    res.redirect(`/payments?orderId=${orderId}`);
  } catch (error) {
    res.render('checkout', {
      error: error.message,
      success: null,
      formData: req.body,
    });
  }
};



exports.getOrderById = async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await orderModel.getOrderById(orderId);
    if (!order) return res.status(404).json({ error:'order not found' });
    res.json(order);
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
    res.status(500).json({ error: error.message });
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
