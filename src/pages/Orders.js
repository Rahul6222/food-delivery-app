import React, { useState, useEffect } from "react";
import "../styles/Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch orders from backend (Dummy Example)
    fetch("https://myapi.com/orders") // Replace with actual API URL
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error fetching orders:", err));
  }, []);

  return (
    <div className="orders">
      <h1>Your Orders</h1>
      {orders.length === 0 ? (
        <p>No orders placed yet!</p>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id} className="order-item">
              <h3>Order #{order.id}</h3>
              <p>Items: {order.items.join(", ")}</p>
              <p>Total: {order.total}</p>
              <p>Status: {order.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
