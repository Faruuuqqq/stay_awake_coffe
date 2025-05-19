const productModel = require('../models/productModel');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await productModel.getProductById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new product (admin only)
exports.createProduct = async (req, res) => {
  const { name, description, price, image, stock, category_id } = req.body;
  try {
    if (!name || !price || stock == null) {
      return res.status(400).json({ error: 'Name, price, and stock are required' });
    }
    const productId = await productModel.createProduct({ name, description, price, image, stock, category_id });
    res.status(201).json({ message: 'Product created', productId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  const { name, description, price, image, stock, category_id } = req.body;
  try {
    const updated = await productModel.updateProduct(id, { name, description, price, image, stock, category_id });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await productModel.deleteProduct(id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
