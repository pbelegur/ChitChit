import React, { useState } from "react";
import axios from "axios";

const CreateGroupModal = ({ onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false); // modal toggle

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      setLoading(true);
      const { token } = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(
        `http://localhost:5000/api/user?search=${search}`,
        config
      );
      setResults(data);
    } catch (err) {
      console.error("Search error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = (user) => {
    if (!selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const handleCreate = async () => {
    if (!groupName || selectedUsers.length < 2) {
      alert("Group name and at least 2 members are required.");
      return;
    }

    try {
      const { token } = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(
        "http://localhost:5000/api/chat/group",
       {
            name: groupName,
            users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      onGroupCreated(data); // send new group to parent
      resetForm();
    } catch (err) {
      console.error("Create group failed", err);
    }
  };

  const resetForm = () => {
    setGroupName("");
    setSearch("");
    setResults([]);
    setSelectedUsers([]);
    setShow(false);
  };

  return (
    <div>
      <button onClick={() => setShow(true)}>+ New Group Chat</button>

      {show && (
        <div
          style={{
            position: "fixed",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            zIndex: 999,
            width: "400px",
          }}
        >
          <h3>Create Group Chat</h3>

          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
          />

          <input
            type="text"
            placeholder="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>

          <div style={{ marginTop: "10px", maxHeight: "100px", overflowY: "auto" }}>
            {results.map((user) => (
              <div key={user._id} style={{ margin: "5px 0" }}>
                {user.name} ({user.email})
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => handleAddUser(user)}
                >
                  Add
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "10px" }}>
            <strong>Selected Users:</strong>
            {selectedUsers.map((user) => (
              <div key={user._id}>
                {user.name}
                <button
                  style={{ marginLeft: "10px", color: "red" }}
                  onClick={() => handleRemoveUser(user._id)}
                >
                  x
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "15px" }}>
            <button onClick={handleCreate}>Create</button>
            <button onClick={resetForm} style={{ marginLeft: "10px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGroupModal;
