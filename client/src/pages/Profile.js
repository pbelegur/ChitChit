import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      if (!token) return;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const { data } = await axios.get("http://localhost:5000/api/user/profile", config);
        setUser(data);
        setNewKey(data.secretKey || "");
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };

    fetchProfile();
  }, []);

  const updateKey = async () => {
    const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const { data } = await axios.put(
        "http://localhost:5000/api/user/secret-key",
        { secretKey: newKey },
        config
      );
      alert("Secret key updated!");
      setUser(data);
    } catch (err) {
      alert("Update failed.");
      console.error(err);
    }
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div style={{ padding: "30px" }}>
      <h2>👤 Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>

      <div style={{ marginTop: "20px" }}>
        <label>🔑 Secret Key:</label><br />
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Enter or update your secret key"
          style={{ padding: "8px", marginTop: "5px", width: "300px" }}
        />
        <br />
        <button
          onClick={updateKey}
          style={{ marginTop: "10px", padding: "8px 16px" }}
        >
          Update Secret Key
        </button>
      </div>
    </div>
  );
};

export default Profile;
