import React, { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom"; // ✅ For redirection

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ✅ Use navigate to redirect after login

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, password });
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      alert("Login Successful!");
      navigate("/menu"); // ✅ Redirect to Menu after login
    } catch (error) {
      alert(error.response?.data?.error || "Login failed!");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
