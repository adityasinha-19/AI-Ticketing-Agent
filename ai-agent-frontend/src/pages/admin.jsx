import { useState, useEffect } from "react";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ role: "", skills: "" });
  const [serachQuery, setSearchQuery] = useState("");
  return (
    <h1>
      <h2></h2>
    </h1>
  );
}

export default AdminPanel;
