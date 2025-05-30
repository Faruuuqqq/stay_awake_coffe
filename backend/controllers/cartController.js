const cartModel = require('../models/cartModel');

exports.getCart = async (req, res) => {
  try {
    const userId = req.userId || 1;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const cart = await cartModel.getCartByUserId(userId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const items = await cartModel.getCartItems(cart.cart_id);
    if (!items) {
      return res.status(404).json({ error: 'No items in cart' });
    }
    
    // res.json({ cartId: cart.cart_id, items });
    res.render("cart",{ cartId: cart.cart_id, items, title: 'Stay Awake Coffee - Cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  const userId = req.userId;
  const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Product ID and quantity > 0 required' });
    }

  try {
    const cart = await cartModel.getCartByUserId(userId);
    await cartModel.addOrUpdateCartItem(cart.cart_id, productId, quantity);
    res.json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  const userId = req.userId;
  const { productId, quantity } = req.body;
  
  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Product ID and quantity > 0 required' });
  }

  try {
    const cart = await cartModel.getCartByUserId(userId);
    const updated = await cartModel.updateCartItem(cart.cart_id, productId, quantity);
    if (!updated) return res.status(404).json({ error: 'Cart item not found' });

    res.json({ message: 'Quantity updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const userId = req.userId;
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'Product ID required' });
  }

  try {
    const cart = await cartModel.getCartByUserId(userId);
    const removed = await cartModel.removeCartItem(cart.cart_id, productId);
    if (!removed) return res.status(404).json({ error: 'Cart item not found' });

    res.json({ message: 'Cart item removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  const userId = req.userId;

  try {
    const cart = await cartModel.getCartByUserId(userId);
    const cleared = await cartModel.clearCart(cart.cart_id);
    if (!cleared) return res.status(404).json({ error: 'Cart not found' }); 
    
    res.json({ message: 'cleared cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
