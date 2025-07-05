import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SecretSidebar from "../components/SecretSidebar";
import SecretChatBox from "../components/SecretChatBox";

const SecretChat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo || !userInfo.secretKey) {
      alert("Unauthorized: Secret key missing.");
      return navigate("/login");
    }
  }, [navigate]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <SecretSidebar onSelectUser={setSelectedUser} />
      {selectedUser ? (
        <SecretChatBox selectedUser={selectedUser} />
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            color: "#555",
          }}
        >
          🕵️ Select a secret contact to start chatting
        </div>
      )}
    </div>
  );
};

export default SecretChat;
