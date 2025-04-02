const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const db = require("./database");
const authMiddleware = require("./middleware/authMiddleware"); // Import authMiddleware
const util = require("util");
db.query = util.promisify(db.query);  // Allows async/await with MySQL queries


const app = express();
const PORT = process.env.PORT || 5000;
// ✅ Enable CORS for frontend communication
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// ✅ Middleware to parse JSON
app.use(express.json());

// ✅ User Registration API
app.post("/api/register",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            const checkUserQuery = "SELECT * FROM users WHERE email = ?";
            db.query(checkUserQuery, [email], async (err, result) => {
                if (err) return res.status(500).json({ error: "Database error" });

                if (result.length > 0) {
                    return res.status(400).json({ error: "User already exists" });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const insertUserQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
                db.query(insertUserQuery, [name, email, hashedPassword], (err, result) => {
                    if (err) return res.status(500).json({ error: "Database error" });

                    res.status(201).json({ message: "User registered successfully!" });
                });
            });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

// ✅ User Login API with JWT Authentication
app.post("/api/login",
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Check if user exists
            const checkUserQuery = "SELECT * FROM users WHERE email = ?";
            db.query(checkUserQuery, [email], async (err, result) => {
                if (err) return res.status(500).json({ error: "Database error" });

                if (result.length === 0) {
                    return res.status(400).json({ error: "User not found" });
                }

                const user = result[0];

                // Debugging Logs
                console.log("🔍 DB Password Hash:", user.password);
                console.log("🔍 Entered Plaintext Password:", password);

                // Compare passwords
                const isMatch = await bcrypt.compare(password, user.password);
                console.log("🔍 Password Match Result:", isMatch);

                if (!isMatch) {
                    return res.status(400).json({ error: "Invalid credentials" });
                }

                // Generate JWT Token
                const token = jwt.sign(
                    { user_id: user.id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
                );

                res.status(200).json({ message: "Login successful", token });
            });
        } catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    }
);

// ✅ Middleware to Verify JWT Token
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access denied, no token provided" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid token" });
    }
};
// ✅ Get Menu Items API
app.get("/api/menu", (req, res) => {
    const sql = "SELECT * FROM menu_items";  // Ensure your table name is correct
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching menu:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});



// ✅ Order Management API

// 📌 1. Place an Order (Protected Route)
app.post("/api/orders", authenticateToken, async (req, res) => {
    const { user_id, restaurant_id, total_price, items } = req.body;

    if (!user_id || !restaurant_id || !total_price || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: "All fields are required, and items must be an array" });
    }

    db.query("SELECT id FROM users WHERE id = ?", [user_id], (err, userResult) => {
        if (err) return res.status(500).json({ error: "Database error (checking user_id)" });
        if (userResult.length === 0) return res.status(400).json({ error: "Invalid user_id" });

        db.query("SELECT id FROM restaurants WHERE id = ?", [restaurant_id], (err, restResult) => {
            if (err) return res.status(500).json({ error: "Database error (checking restaurant_id)" });
            if (restResult.length === 0) return res.status(400).json({ error: "Invalid restaurant_id" });

            const insertOrderQuery = "INSERT INTO orders (user_id, restaurant_id, total_price) VALUES (?, ?, ?)";
            db.query(insertOrderQuery, [user_id, restaurant_id, total_price], (err, orderResult) => {
                if (err) return res.status(500).json({ error: "Database error (orders)" });

                const orderId = orderResult.insertId;
                const insertOrderItemsQuery = "INSERT INTO order_items (order_id, item_name, quantity) VALUES ?";
                const orderItemsData = items.map(item => [orderId, item.item, item.quantity]);

                db.query(insertOrderItemsQuery, [orderItemsData], (err) => {
                    if (err) return res.status(500).json({ error: "Database error (order_items)" });

                    res.status(201).json({ message: "Order placed successfully!", order_id: orderId });
                });
            });
        });
    });
});

// 📌 2. Get Orders for a Specific User (Protected Route)
// 📌 Get Orders for a Specific User (Protected)
app.get("/api/orders/:user_id", authMiddleware, async (req, res) => {
    const { user_id } = req.params;

    // Ensure the logged-in user can only access their own orders
    if (req.user.user_id != user_id) {
        return res.status(403).json({ error: "Unauthorized access" });
    }

    const getUserOrdersQuery = "SELECT * FROM orders WHERE user_id = ?";
    db.query(getUserOrdersQuery, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.status(200).json({ orders: results });
    });
});


// 📌 3. Update Order Status (Protected Route)
app.put("/api/orders/:order_id", authenticateToken, async (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;

    if (!["pending", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid order status" });
    }

    const updateOrderQuery = "UPDATE orders SET status = ? WHERE id = ?";
    
    db.query(updateOrderQuery, [status, order_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.status(200).json({ message: "Order status updated successfully!" });
    });
});

// 📌 4. Delete an Order (Protected Route)
app.delete("/api/orders/:order_id", authenticateToken, async (req, res) => {
    const { order_id } = req.params;

    const deleteOrderQuery = "DELETE FROM orders WHERE id = ?";
    db.query(deleteOrderQuery, [order_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.status(200).json({ message: "Order deleted successfully!" });
    });
});
// 🛒 Cart Management API
app.post("/api/cart", authenticateToken, async (req, res) => {
    const { item_name, quantity, price } = req.body;
    const user_id = req.user.user_id;

    if (!item_name || !quantity || !price) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const insertCartQuery = "INSERT INTO cart (user_id, item_name, quantity, price) VALUES (?, ?, ?, ?)";
    db.query(insertCartQuery, [user_id, item_name, quantity, price], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.status(201).json({ message: "Item added to cart!", cart_id: result.insertId });
    });
});

// 🛒 View Cart Items
app.get("/api/cart/:user_id", authenticateToken, async (req, res) => {
    const { user_id } = req.params;

    // Ensure logged-in user can only view their own cart
    if (req.user.user_id != user_id) {
        return res.status(403).json({ error: "Unauthorized access" });
    }

    const getCartQuery = "SELECT * FROM cart WHERE user_id = ?";
    db.query(getCartQuery, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.status(200).json({ cart: results });
    });
});

// 🗑️ Delete Item from Cart
app.delete("/api/cart/:item_id", authenticateToken, async (req, res) => {
    const { item_id } = req.params;
    const user_id = req.user.user_id;

    const deleteCartItemQuery = "DELETE FROM cart WHERE id = ? AND user_id = ?";
    db.query(deleteCartItemQuery, [item_id, user_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Item not found or unauthorized" });

        res.status(200).json({ message: "Item removed from cart" });
    });
});

// ✅ Place Order from Cart
app.post("/api/orders-from-cart", authenticateToken, async (req, res) => {
    const user_id = req.user.user_id;
    const { restaurant_id } = req.body;

    if (!restaurant_id) {
        return res.status(400).json({ error: "Restaurant ID is required" });
    }

    const getCartItemsQuery = "SELECT * FROM cart WHERE user_id = ?";
    db.query(getCartItemsQuery, [user_id], async (err, cartItems) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        // Calculate total price
        const total_price = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Insert into orders table
        const insertOrderQuery = "INSERT INTO orders (user_id, restaurant_id, total_price) VALUES (?, ?, ?)";
        db.query(insertOrderQuery, [user_id, restaurant_id, total_price], (err, orderResult) => {
            if (err) return res.status(500).json({ error: "Database error" });

            const order_id = orderResult.insertId;

            // Insert order items
            const insertOrderItemsQuery = "INSERT INTO order_items (order_id, item_name, quantity) VALUES ?";
            const orderItemsData = cartItems.map(item => [order_id, item.item_name, item.quantity]);

            db.query(insertOrderItemsQuery, [orderItemsData], (err) => {
                if (err) return res.status(500).json({ error: "Database error" });

                // Clear the cart after placing the order
                const deleteCartQuery = "DELETE FROM cart WHERE user_id = ?";
                db.query(deleteCartQuery, [user_id], () => {
                    res.status(201).json({ message: "Order placed successfully!", order_id });
                });
            });
        });
    });
});


// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
