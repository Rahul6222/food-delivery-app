require("dotenv").config(); // Load .env variables

const mysql = require("mysql2");

// Create a database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Successfully connected to MySQL!");
  }
  connection.end(); // Close the connection after testing
});
