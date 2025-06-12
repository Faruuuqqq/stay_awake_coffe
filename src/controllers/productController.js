const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const { getCommonRenderData } = require('../utils/renderHelpers');

// Get all product with categories
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'No products found' });
    }

    const categories = await categoryModel.getAllCategories();
    if (!categories || categories.length === 0) {
      return res.status(404).json({ error: 'No categories found' });
    }
    // Mengambil kategori produk yang sudah digabungkan dalam satu string
    res.render('products', {
      products,
      categories,
    });
  } catch (error) {
    console.error('Error loading products:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await productModel.getProductById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Mengambil kategori produk yang sudah digabungkan dalam satu string
    const categories = product.categories ? product.categories.split(',') : [];

    let user = null;
    if (req.userId) {
      user = await productModel.getUserById(req.userId);
    }

    res.render('product-detail', {
      product,
      categories,
      user: user,
    });
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

exports.getProductsPage = async (req, res) => {
  const { search, category, priceMin, priceMax, sort } = req.query; // Ambil semua parameter filter

  try {
    const filters = {
      search: search || '',
      category: category || '',
      priceMin: parseFloat(priceMin) || 0,
      priceMax: parseFloat(priceMax) || 999999, // Asumsi max price cukup besar
      sort: sort || ''
    };

    const products = await productModel.getProductsWithFilter(filters);
    const categories = await categoryModel.getAllCategories();
    const commonData = await getCommonRenderData(req.userId, { title: 'Stay Awake Coffee - Products' });

    res.render('products', {
      ...commonData, // Teruskan user, cartItemCount dari res.locals
      products: products,
      categories: categories, // Teruskan semua kategori untuk sidebar filter
      filters: filters // Teruskan filter yang aktif kembali ke frontend
    });
  } catch (error) {
    console.error('Error loading products page:', error.message);
    const commonData = await getCommonRenderData(req.userId, { title: 'Error' });
    res.status(500).render('products', { ...commonData, products: [], categories: [], filters: {} });
  }
};

// exports.getBestSellers = async (req, res) => {
//   try {
//     const products = await productModel.getAllProducts();  // Assuming this fetches all products
//     res.render('home', { 
//       products: products.filter(product => product.isBestSeller), // Only passing best-sellers
//       categories: await categoryModel.getAllCategories()  // Assuming you also want to display categories
//     });
//   } catch (error) {
//     console.error('Error fetching best sellers:', error.message);
//     res.status(500).send('Internal Server Error');
//   }
// };