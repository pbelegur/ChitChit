import React, { useState } from "react";
import axios from "axios";
import CreateGroupModal from "../components/CreateGroupModal"; // ✅ Import modal

const SearchUsers = ({ onChatCreated }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      setLoading(true);
      const { token } = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(
        `http://localhost:5000/api/user?search=${searchTerm}`,
        config
      );
      setResults(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (userId) => {
    try {
      const { token } = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.post(
        `http://localhost:5000/api/chat`,
        { userId },
        config
      );
      onChatCreated(data); // notify parent to add to chat list
    } catch (err) {
      console.error("Chat creation failed", err);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {/* 🆕 Add group modal here */}
      <CreateGroupModal onGroupCreated={onChatCreated} />

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users by name or email"
        style={{ padding: "5px", width: "70%", marginTop: "10px" }}
      />
      <button onClick={handleSearch} style={{ marginLeft: "10px" }}>
        Search
      </button>

      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          results.map((user) => (
            <div key={user._id} style={{ marginTop: "10px" }}>
              {user.name} ({user.email})
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => startChat(user._id)}
              >
                Message
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchUsers;
