const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
require("dotenv").config();

// Impor middleware dan router
const { identifyUser } = require('./middlewares/authMiddleware');
const { getCommonRenderData } = require('./utils/renderHelpers');
const errorMiddleware = require('./middlewares/errorMiddleware');

// Impor semua router Anda
const appRoutes = require("./routes/appRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const addressRoutes = require("./routes/addressRoutes");

const app = express();

// Middleware dasar
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.basedir = app.get('views');
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Gunakan middleware 'identifyUser' secara global untuk setiap request
// INI WAJIB ADA SEBELUM PENDAFTARAN RUTE
app.use("/", appRoutes);
app.use(identifyUser);

// --- Pendaftaran Rute Aplikasi ---
// app.use("/", appRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/carts", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/payment", paymentRoutes);
app.use("/shipment", shipmentRoutes);
app.use("/reviews", reviewRoutes);
app.use("/addresses", addressRoutes);


// Rute API (JSON Endpoints)
// Ini adalah rute yang digunakan oleh JavaScript frontend untuk mengambil/mengirim data JSON
// Perhatikan awalan '/api'
app.use('/api/products', productRoutes); // Menangani /api/products, /api/products/:id
app.use('/api/carts', cartRoutes);     // Menangani /api/carts, /api/carts/:productId
app.use('/api/auth', authRoutes);      // Menangani /api/auth/login, /api/auth/register
app.use('/api/users', userRoutes);     // Menangani /api/users/me, /api/users/:id
app.use('/api/categories', categoryRoutes); // Menangani /api/categories
app.use('/api/orders', orderRoutes);   // Menangani /api/orders, /api/orders/me
app.use('/api/payments', paymentRoutes); // Menangani /api/payments
app.use('/api/shipments', shipmentRoutes); // Menangani /api/shipments
app.use('/api/reviews', reviewRoutes); // Menangani /api/reviews
app.use('/api/addresses', addressRoutes); // Menangani /api/addresses


// Middleware Error Handling (HARUS DI BAGIAN PALING AKHIR, SEBELUM HANDLER 404)
app.use(errorMiddleware);

// Middleware untuk menangani error 404 (Not Found)
app.use(async (req, res, next) => {
    try {
        const commonData = await getCommonRenderData(req.userId, { 
            title: 'Halaman Tidak Ditemukan' 
        });
        
        res.status(404).render('error', {
            ...commonData,
            message: 'Halaman yang Anda cari tidak ditemukan.',
            error: { status: 404 }
        });
    } catch (error) {
        next(error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});