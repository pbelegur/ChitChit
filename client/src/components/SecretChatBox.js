import React, { useEffect, useState } from "react";
import axios from "axios";

const SecretChatBox = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  const fetchMessages = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("userInfo")).token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(`/api/secret/with/${selectedUser._id}`, config);
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch secret messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    try {
      const token = JSON.parse(localStorage.getItem("userInfo")).token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post(
        "/api/secret/send",
        {
          content: newMsg,
          to: selectedUser._id,
        },
        config
      );

      setMessages([...messages, data]);
      setNewMsg("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  return (
    <div style={{ flex: 1, padding: "10px" }}>
      <h3>Secret Chat with {selectedUser.name}</h3>
      <div style={{ height: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
        {messages.map((msg) => (
          <div key={msg._id} style={{ marginBottom: "8px" }}>
            <strong>{msg.sender.name}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          style={{ width: "80%", padding: "8px" }}
        />
        <button onClick={sendMessage} style={{ padding: "8px 12px", marginLeft: "8px" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default SecretChatBox;
