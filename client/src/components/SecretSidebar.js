import React, { useEffect, useState } from "react";
import axios from "axios";

const SecretSidebar = ({ onSelectUser }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("userInfo")).token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get("http://localhost:5000/api/secret/contacts", config);
      setContacts(data);
    } catch (error) {
      console.error("Failed to fetch secret contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div style={{ width: "250px", borderRight: "1px solid #ccc", padding: "10px" }}>
      <h3>Secret Contacts</h3>
      {loading ? (
        <p>Loading...</p>
      ) : contacts.length === 0 ? (
        <p>No secret chats yet.</p>
      ) : (
        contacts.map((user) => (
          <div
            key={user._id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
              cursor: "pointer",
            }}
            onClick={() => onSelectUser(user)}
          >
            <img
              src={user.pic}
              alt={user.name}
              style={{ width: "35px", height: "35px", borderRadius: "50%", marginRight: "10px" }}
            />
            <span>{user.name}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default SecretSidebar;
