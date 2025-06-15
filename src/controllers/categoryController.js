const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    const products = await productModel.getAllProducts();
    // res.json(categories);
    res.render("category", { categories, products, title: 'Stay Awake Coffee - Categories' });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await categoryModel.getCategoryById(id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  try {
    const categoryId = await categoryModel.createCategory(name);
    res.status(201).json({ message: 'Category created', categoryId });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  try {
    const updated = await categoryModel.updateCategory(id, name);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await categoryModel.deleteCategory(id);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};