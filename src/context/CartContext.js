import React, { createContext, useState } from "react";

// Creating Cart Context
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add Item to Cart
  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  // Remove Item from Cart
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
