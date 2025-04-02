const mysql = require("mysql2");
require("dotenv").config(); // Load environment variables

// Create a MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed: ", err);
    } else {
        console.log("✅ Successfully connected to the database!");
    }
});

module.exports = db;
