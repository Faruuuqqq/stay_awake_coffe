const express = require('express');
const router = express.Router();
const productModel = require('../models/productModel');
const categetoryModel = require('../models/categoryModel');

// Homepage route: fetch all products and render index.ejs
router.get('/', async (req, res) => {
  try {

    const products = await productModel.getAllProducts();
    const categories = await categetoryModel.getAllCategories();

    res.render('index', { 
      title: 'Stay Awake Coffee - Home', 
      products,
      categories,
    });
  } catch (error) {
    console.error("Error fetching products for homepage:", error.message);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'Stay Awake Coffee - About Us' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Stay Awake Coffee - Contact Us' });
});

router.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy', { title: 'Stay Awake Coffee - Privacy Policy' });
});

router.get('/blog', (req, res) => {
  res.render('blog', { title: 'Stay Awake Coffee - Blog' });
});

router.get('/error', (req, res) => {
  res.render('404', { title: 'Stay Awake Coffee - Error Page' });
});

router.get('/terms', (req, res) => {
  res.render('tos', { title: 'Stay Awake Coffee - Terms of Service Page' });
});

router.get('/faq', (req, res) => {
  res.render('faq', { title: 'Stay Awake Coffee - FAQ Page' });
});

router.get('/privacy', (req, res) => {
  res.render('privacy', { title: 'Stay Awake Coffee - FAQ Page' });
});

router.get('/return-policy', (req, res) => {
  res.render('return-policy', { title: 'Stay Awake Coffee - FAQ Page' });
});

module.exports = router;