const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
    // Get token from headers
    const token = req.header("Authorization");
    
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded; // Store user data in request object
        next(); // Move to the next middleware
    } catch (error) {
        res.status(401).json({ error: "Invalid token." });
    }
};

module.exports = authMiddleware;
