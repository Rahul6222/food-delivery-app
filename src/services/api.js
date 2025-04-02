import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Adjust if needed

// User Login
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response;
  } catch (error) {
    throw error;
  }
};

// View Cart Items
export const viewCart = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/cart/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Remove Item from Cart
export const removeFromCart = async (itemId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/cart/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Place Order from Cart
export const placeOrderFromCart = async (restaurantId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/orders-from-cart`,
      { restaurant_id: restaurantId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
  } catch (error) {
    throw error;
  }
};
