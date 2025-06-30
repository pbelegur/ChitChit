import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import socket from "../socket";

const ChatBox = ({ selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const { token } = JSON.parse(localStorage.getItem("userInfo"));
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const { data } = await axios.get(
          `http://localhost:5000/api/message/${selectedChat._id}`,
          config
        );

        setMessages(data);
      } catch (error) {
        console.error("❌ Failed to load messages:", error);
      }
    };

    fetchMessages();

    socket.on("receive_message", (data) => {
      if (data.chat._id === selectedChat._id) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => socket.off("receive_message");
  }, [selectedChat]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    try {
      const { token } = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.post(
        "http://localhost:5000/api/message",
        {
          content: newMsg,
          chatId: selectedChat._id,
        },
        config
      );

      socket.emit("send_message", data); // broadcast via socket
      setMessages((prev) => [...prev, data]);
      setNewMsg("");
    } catch (error) {
      console.error("❌ Failed to send message", error);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "15px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3 style={{ marginBottom: "15px" }}>
        Chat with {selectedChat.isGroupChat ? selectedChat.chatName : selectedChat.users.find(u => u._id !== JSON.parse(localStorage.getItem("userInfo"))._id)?.name}
      </h3>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #eee",
          marginBottom: "10px",
        }}
      >
        {messages.map((m) => (
          <div key={m._id} style={{ marginBottom: "10px" }}>
            <strong>{m.sender?.name}:</strong> {m.content}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div style={{ display: "flex" }}>
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            border: "none",
            backgroundColor: "#2d3436",
            color: "#fff",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
