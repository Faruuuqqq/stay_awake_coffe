const express = require('express');
const cookieParser = require('cookie-parser');

require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const addressRoutes = require("./routes/addressRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/carts", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/payment", paymentRoutes);
app.use("/shipment", shipmentRoutes);
app.use("/reviews", reviewRoutes);
app.use("/addresses", addressRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
