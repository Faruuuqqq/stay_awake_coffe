// src/routes/appRoutes.js
const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');

// Homepage route
router.get('/', appController.getHomepage);

// Static content routes
router.get('/about', appController.getAboutPage);
router.get('/contact', appController.getContactPage);
router.get('/privacy-policy', appController.getPrivacyPolicyPage);
router.get('/blog', appController.getBlogPage);
router.get('/error', appController.getErrorPage);
router.get('/terms', appController.getTermsPage);
router.get('/faq', appController.getFaqPage);
router.get('/privacy', appController.getPrivacyPage);
router.get('/return-policy', appController.getReturnPolicyPage);

module.exports = router;
