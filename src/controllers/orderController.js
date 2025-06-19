// src/controllers/orderController.js
const orderService = require('../services/orderService');
const cartService = require('../services/cartService');
const addressService = require('../services/addressService');
const { getCommonRenderData } = require('../utils/renderHelpers');
const { ApiError } = require('../utils/ApiError');

const orderController = {
    /**
     * Mengambil data keranjang dan alamat sebelum merender halaman.
     */
    getCheckoutPage: async (req, res, next) => {
        try {
            const userId = req.userId;
            if (!userId) return res.redirect('/auth/login');

            const cartResult = await cartService.getCartItems(userId);
            const addressResult = await addressService.getAddressesByUserId(userId);
            const commonData = await getCommonRenderData(userId, { title: 'Checkout' });

            const items = cartResult.data ? cartResult.data.items : [];
            if (!items || items.length === 0) {
                return res.redirect('/carts?error=Keranjang Anda kosong, tidak bisa melanjutkan ke checkout.');
            }

            res.render('checkout', {
                ...commonData,
                items: items,
                totalPrice: cartResult.data.subtotal,
                addresses: addressResult.data,
                error: req.query.error || null,
                success: req.query.success || null
            });

        } catch (error) {
            console.error('Error getting checkout page:', error.message);
            next(error);
        }
    },

    /**
     * Membuat pesanan baru dari form checkout.
     */
    createOrder: async (req, res, next) => {
        try {
            const userId = req.userId;
            const { addressId, newAddress_phone, newAddress_address, newAddress_city, newAddress_postal_code } = req.body;
            let finalAddressId = addressId;

            if (addressId === 'new') {
                const newAddressData = { phone: newAddress_phone, address: newAddress_address, city: newAddress_city, postal_code: newAddress_postal_code };
                if (!newAddressData.phone || !newAddressData.address || !newAddressData.city || !newAddressData.postal_code) {
                    throw new ApiError(400, 'Harap isi semua field alamat baru.');
                }
                const createdAddressResult = await addressService.createAddress(userId, newAddressData);
                finalAddressId = createdAddressResult.data.address_id;
            }
            
            if (!finalAddressId) {
                throw new ApiError(400, 'Alamat pengiriman tidak valid.');
            }

            const result = await orderService.createOrderFromCart(userId, { addressId: finalAddressId });
            
            res.status(201).json({
                status: 'success',
                message: 'Pesanan berhasil dibuat!',
                redirectUrl: `/orders/${result.data.orderId}?success=true`
            });

        } catch (error) {
            console.error('Error in orderController.createOrder:', error.message);
            next(error);
        }
    },

    /**
     * Menampilkan halaman riwayat pesanan pengguna.
     */
    getMyOrders: async (req, res, next) => {
        try {
            const result = await orderService.getMyOrders(req.userId);
            const commonData = await getCommonRenderData(req.userId, { title: 'Riwayat Pesanan Saya' });
            res.render('orders', { ...commonData, orders: result.data });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Menampilkan halaman detail pesanan.
     */
    getOrderDetail: async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await orderService.getOrderDetail(req.userId, id);
            const commonData = await getCommonRenderData(req.userId, { title: `Detail Pesanan #${result.data.order_id}` });

            // Cek apakah ada query 'success' untuk menampilkan notifikasi
            const showSuccessNotification = req.query.success === 'true';

            res.render('order-detail', { 
                ...commonData, 
                order: result.data,
                showSuccessNotification: showSuccessNotification 
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Mengambil semua pesanan (hanya untuk Admin).
     * @param {Object} req - Objek request Express.
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getAllOrders: async (req, res, next) => {
        try {
            const result = await orderService.getAllOrders();
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in orderController.getAllOrders:', error.message);
            next(error);
        }
    },

    /**
     * Mengambil pesanan berdasarkan status (hanya untuk Admin).
     * @param {Object} req - Objek request Express (req.query.status).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    getOrdersByStatus: async (req, res, next) => {
        const { status } = req.query; // Ambil status dari query params
        try {
            const result = await orderService.getOrdersByStatus(status);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in orderController.getOrdersByStatus:', error.message);
            next(error);
        }
    },

    /**
     * Memperbarui status pesanan (hanya untuk Admin).
     * @param {Object} req - Objek request Express (req.params.id, req.body.status).
     * @param {Object} res - Objek response Express.
     * @param {Function} next - Fungsi middleware selanjutnya.
     */
    updateOrderStatus: async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;
        try {
            const result = await orderService.updateOrderStatus(id, { status });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in orderController.updateOrderStatus:', error.message);
            next(error);
        }
    }
};

module.exports = orderController;
