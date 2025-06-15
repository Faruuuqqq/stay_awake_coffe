// src/controllers/appController.js
const appService = require('../services/appService');
const { getCommonRenderData } = require('../utils/renderHelpers'); // Tetap digunakan untuk data render umum
const { ApiError } = require('../utils/ApiError'); // Untuk konsistensi error handling

const appController = {
    /**
     * Merender halaman beranda (homepage) dengan data produk dan kategori.
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getHomepage: async (req, res, next) => {
        try {
            const serviceResult = await appService.getHomepageData();
            const commonData = await getCommonRenderData(req.userId, { title: 'Stay Awake Coffee - Home' });

            res.render('index', {
                ...commonData,
                products: serviceResult.data.products,
                categories: serviceResult.data.categories,
            });
        } catch (error) {
            console.error("Error in appController.getHomepage:", error.message);
            // Meneruskan error ke middleware error global
            next(error);
        }
    },

    /**
     * Merender halaman About Us.
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getAboutPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Stay Awake Coffee - About Us' });
            res.render('about', { ...commonData });
        } catch (error) {
            console.error("Error rendering about page:", error.message);
            next(error);
        }
    },

    /**
     * Merender halaman Contact Us.
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getContactPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Stay Awake Coffee - Contact Us' });
            res.render('contact', { ...commonData });
        } catch (error) {
            console.error("Error rendering contact page:", error.message);
            next(error);
        }
    },

    /**
     * Merender halaman Privacy Policy.
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getPrivacyPolicyPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Stay Awake Coffee - Privacy Policy' });
            res.render('privacy-policy', { ...commonData });
        } catch (error) {
            console.error("Error rendering privacy policy page:", error.message);
            next(error);
        }
    },

    /**
     * Merender halaman Blog.
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getBlogPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Stay Awake Coffee - Blog' });
            res.render('blog', { ...commonData });
        } catch (error) {
            console.error("Error rendering blog page:", error.message);
            next(error);
        }
    },

    /**
     * Merender halaman Error (404).
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getErrorPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Stay Awake Coffee - Error Page' });
            // Biasanya status 404 dikirim oleh middleware error, ini hanya jika Anda ingin merender 404 secara eksplisit
            res.status(404).render('404', { ...commonData });
        } catch (error) {
            console.error("Error rendering 404 page:", error.message);
            next(error);
        }
    },

    /**
     * Merender halaman Terms of Service.
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getTermsPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Stay Awake Coffee - Terms of Service Page' });
            res.render('tos', { ...commonData });
        } catch (error) {
            console.error("Error rendering terms of service page:", error.message);
            next(error);
        }
    },

    /**
     * Merender halaman FAQ.
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getFaqPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Stay Awake Coffee - FAQ Page' });
            res.render('faq', { ...commonData });
        } catch (error) {
            console.error("Error rendering FAQ page:", error.message);
            next(error);
        }
    },

    /**
     * Merender halaman Privacy (jika berbeda dari Privacy Policy).
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getPrivacyPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Stay Awake Coffee - Privacy Page' });
            res.render('privacy', { ...commonData });
        } catch (error) {
            console.error("Error rendering privacy page:", error.message);
            next(error);
        }
    },

    /**
     * Merender halaman Return Policy.
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getReturnPolicyPage: async (req, res, next) => {
        try {
            const commonData = await getCommonRenderData(req.userId, { title: 'Stay Awake Coffee - Return Policy Page' });
            res.render('return-policy', { ...commonData });
        } catch (error) {
            console.error("Error rendering return policy page:", error.message);
            next(error);
        }
    }
};

module.exports = appController;
