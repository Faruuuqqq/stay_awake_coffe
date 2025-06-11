const paymentModel = require('../models/paymentModel');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');

/**
 * Handles the creation of a new payment.
 * This is an API endpoint, so it responds with JSON.
 */
exports.createPayment = async (req, res) => {
  const { order_id, method, status, transaction_id, amount_paid, paid_at } = req.body;

  if (!order_id || !method || !status || amount_paid === undefined || amount_paid === null) {
    return res.status(400).json({ message: 'Order ID, payment method, status, and amount paid are required.' });
  }

  try {
    // Create payment record in the database
    const paymentId = await paymentModel.createPayment({
      order_id,
      method,
      status,
      transaction_id: transaction_id || null,
      amount_paid,
      paid_at: paid_at || new Date(),
      error: null 
    });

    await orderModel.updateOrderStatus(order_id, 'completed'); 
    res.status(201).json({ message: 'Payment successfully processed', paymentId });

  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
};

/**
 * Retrieves payment details by payment ID.
 * This function renders a payment success/details page.
 */
exports.getPaymentById = async (req, res) => {
  const { id: paymentId } = req.params;

  try {
    const payment = await paymentModel.getPaymentById(paymentId);
    if (!payment) {
      return res.status(404).render('error', { title: 'Payment Not Found', message: 'Payment not found.' });
    }

    const orderDetails = await orderModel.getOrderById(payment.order_id);
    if (!orderDetails) {
      return res.status(404).render('error', { title: 'Order Not Found', message: 'Order not found for this payment.' });
    }

    res.render('payment-success', {
      payment,
      orderDetails,
      title: 'Stay Awake Coffee - Payment Confirmation',
      success: 'Payment details retrieved successfully',
      paymentId: payment.payment_id,
      error: null,
    });
  } catch (error) {
    console.error('Error fetching payment by ID:', error);
    res.status(500).render('error', { title: 'Server Error', message: 'Error fetching payment details.' });
  }
};

/**
 * Retrieves payment details by order ID.
 * This is an API endpoint, so it responds with JSON.
 */
exports.getPaymentByOrderId = async (req, res) => {
  const { id: orderId } = req.params;

  try {
    const payment = await paymentModel.getPaymentByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found for this order.' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment by Order ID:', error);
    res.status(500).json({ message: 'Error fetching payment details.', error: error.message });
  }
};

/**
 * Retrieves all payments.
 * This is an API endpoint, so it responds with JSON.
 */
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await paymentModel.getAllPayments();
    res.json(payments);
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ message: 'Error retrieving payments.', error: error.message });
  }
};

/**
 * Renders the payment page, redirecting from checkout.
 * It fetches user and order details to display payment options.
 */
exports.getPaymentPage = async (req, res) => {
  const userId = req.userId;
  const orderId = req.query.orderId;

  if (!userId) {
    return res.redirect('/users/login-register?error=Login is required to proceed with payment.');
  }
  if (!orderId) {
    return res.redirect('/carts?error=No order selected for payment. Please select an order.');
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.redirect('/users/login-register?error=User not found. Please log in again.');
    }

    // Fetch order details based on the provided orderId
    const orderDetails = await orderModel.getOrderById(orderId);
    if (!orderDetails) {
      return res.status(404).render('error', { title: 'Order Not Found', message: 'The specified order could not be found.' });
    }

    // Ensure the order belongs to the logged-in user
    if (orderDetails.user_id !== userId) {
      return res.status(403).render('error', { title: 'Access Denied', message: 'You do not have permission to access this order.' });
    }

    // Check if the order has already been paid
    const existingPayment = await paymentModel.getPaymentByOrderId(orderId);
    if (existingPayment && (existingPayment.status === 'paid' || existingPayment.status === 'completed')) {
      return res.render('payment-success', {
        success: 'This order has already been paid.',
        paymentId: existingPayment.payment_id,
        orderDetails: orderDetails,
        title: 'Payment Already Processed'
      });
    }

    // Render the payment page with order details
    res.render('payment', {
      orderDetails: orderDetails,
      user: user,
      title: `Stay Awake Coffee - Payment for Order #${orderId}`,
      error: null,
      success: null,
      formData: {
        order_id: orderId,
        amount_paid: orderDetails.total_price
      }
    });
  } catch (error) {
    console.error('Error fetching payment page:', error.message);
    res.status(500).render('error', { title: 'Server Error', message: 'An internal server error occurred while preparing the payment page.' });
  }
};