const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

( async () => {
   try {
    const connection = await db.getConnection();
    console.log("DB Connection Successful");

    connection.release();
  } catch (error) {
    console.error("DB Connection Failed:", error.message);
    process.exit(1);
  }
})();

module.exports = db;
