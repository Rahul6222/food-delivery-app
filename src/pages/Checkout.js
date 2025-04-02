import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import "../styles/Checkout.css";

function Checkout() {
  const { cart } = useContext(CartContext);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty! Add some items first.");
      return;
    }

    setOrderPlaced(true);
  };

  return (
    <div className="checkout">
      <h1>Checkout</h1>
      {orderPlaced ? (
        <h2>🎉 Order Placed Successfully! 🎉</h2>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item.id} className="checkout-item">
              <h3>{item.name}</h3>
              <p>{item.price}</p>
            </div>
          ))}
          <button onClick={handleCheckout}>Place Order</button>
        </div>
      )}
    </div>
  );
}

export default Checkout;
