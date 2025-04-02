import React, { useState, useEffect } from "react";

function Menu() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]); // 🛒 Cart state

  useEffect(() => {
    fetch("http://localhost:5000/api/menu")  // Make sure your backend API is running
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch((err) => console.error("Error fetching menu:", err));
  }, []);

  // 🛒 Function to Add Item to Cart
  const addToCart = (item) => {
    setCart([...cart, item]); // Add item to cart array
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🍽️ Menu</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {menu.map((item) => (
          <div key={item.id} style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center", borderRadius: "10px" }}>
            <img 
              src={`/images/${item.name.toLowerCase()}.jpg`} 
              alt={item.name} 
              style={{ width: "150px", height: "150px", borderRadius: "10px" }} 
            />
            <h3>{item.name}</h3>
            <p>💰 Price: ${item.price}</p>
            <button 
              onClick={() => addToCart(item)} 
              style={{ background: "green", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
              🛒 Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* 🛒 Cart Section */}
      <h2>🛍️ Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {cart.map((item, index) => (
            <li key={index} style={{ padding: "5px 0" }}>
              ✅ {item.name} - ${item.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Menu;
