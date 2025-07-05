import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/user/login", {
        email,
        password,
      });

      localStorage.setItem("userInfo", JSON.stringify(data));

      // ✅ Redirect logic
      if (secretKey) {
        if (!data.secretKey) {
          alert("❌ You don't have a secret key set up. Go to your profile to add one.");
          return navigate("/chats");
        }

        if (data.secretKey !== secretKey) {
          alert("❌ Invalid secret key.");
          return navigate("/chats");
        }

        return navigate("/secret-chat");
      } else {
        navigate("/chats");
      }
    } catch (error) {
      alert("Login failed");
      console.error(error.response?.data);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <input
          type="text"
          placeholder="Secret Key (optional)"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
        /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
