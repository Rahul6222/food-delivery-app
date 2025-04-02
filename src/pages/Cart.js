import React, { useState, useEffect } from "react";
import { viewCart, removeFromCart, placeOrderFromCart } from "../services/api";

const Cart = ({ token, userId }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await viewCart(token, userId);
      setCartItems(response.data.cart);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to load cart");
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(token, itemId);
      fetchCart(); // Refresh cart
    } catch (error) {
      alert("Error removing item");
    }
  };

  const handlePlaceOrder = async () => {
    try {
      await placeOrderFromCart(token, 1);
      alert("Order placed successfully!");
      setCartItems([]);
    } catch (error) {
      alert("Error placing order");
    }
  };

  return (
    <div>
      <h2>Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item.id}>
              {item.item_name} - {item.quantity} x ${item.price}
              <button onClick={() => handleRemove(item.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={handlePlaceOrder} disabled={cartItems.length === 0}>
        Place Order
      </button>
    </div>
  );
};

export default Cart;
