const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');

exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const cart = await cartModel.getCartByUserId(userId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const items = await cartModel.getCartItems(cart.cart_id);
    if (!items || items.length === 0) {
      return res.render("cart", {
        cartId: cart.cart_id,
        items: [],
        totalPrice: 0,
        title: 'Stay Awake Coffee - Cart'
      });
    }

    const totalPrice = items.reduce((sum, item) => sum + (item.price) * item.quantity, 0);
    
    res.render("cart",{
      cartId: cart.cart_id,
      items: items,
      totalPrice: totalPrice.toFixed(2),
      title: 'Stay Awake Coffee - Cart'
    });
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
    const product = await cartModel.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let cart = await cartModel.getCartByUserId(userId);
    if (!cart) {
      cart = await cartModel.createCart(userId);
    }

    const existingItem = await cartModel.getCartItemByProductId(userId, productId);
      if (existingItem) {
        await cartModel.updateCartItem(cart.cartId, productId, existingItem.quantity + quantity);
      } else {
        await cartModel.addOrUpdateCartItem(cart.cartId, productId, quantity);
      }
    
    res.status(200).json({ message: 'Item added to cart' });
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
