const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');

// Get all product with categories
exports.getAllProducts = async (req, res) => { 
  try {
    const products = await productModel.getAllProducts();
    // res.json(products);
    res.render('products', { products });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
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

// Create new product and set category (admin only)
exports.createProduct = async (req, res) => {
  const { name, description, price, image, stock, category_ids } = req.body;
  // category_ids itu array kategori misal : [1, 2, 4]
  if (!name || !price || stock == null) {
      return res.status(400).json({ error: 'Name, price, and stock are required' });
  }
  
  try {
    const productId = await productModel.createProduct({ name, description, price, image, stock });

    if (Array.isArray(category_ids)) {
      for (const categoryId of category_ids) {
        await productModel.addProductCategory(productId, categoryId);
      }
    }

    res.status(201).json({ message: 'Product created', productId });
  } catch (error) {
    console.error("Error creating product:", error.message);
  }
}

// Update product (admin only)
exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  const { name, description, price, image, stock, category_ids } = req.body;
  
  try {
    const updated = await productModel.updateProduct(id, { name, description, price, image, stock, category_ids });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    
    if(Array.isArray(category_ids)) {
      await productModel.removeProductCategory(id);
      for (const categoryId of category_ids) {
        await productModel.addProductCategory(id, categoryId);
      }
    }

    res.json({ message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete produk beserta relasi kategori (admin no)
exports.deleteProduct = async (req, res) => {
  const id = req.params.id;

  try {
    await productModel.removeProductCategory(id);
    
    const deleted = await productModel.deleteProduct(id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listProductWithFilter = async (req, res) => {
  try {
    const { category, priceMin, priceMax, sort } = req.query;

    const categories = await categoryModel.getAllCategories();

    const filterOptions = {
      category: category || null,
      priceMin: priceMin !== undefined ? Number(minPrice) : null,
      priceMax: priceMax !== undefined ? Number(maxPrice) : null,
      sort: sort || null,
    };

    const products = await productModel.getProductsWithFilter(filterOptions);
    res.render('products', { products, categories, filters: filterOptions });
  } catch (error) {
    console.error("Error listing products with filter:", error.message);
    res.status(500).json({ error: error.message });
  }
}