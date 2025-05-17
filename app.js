const express = require('express');

require("dotenv").config();

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use("/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});