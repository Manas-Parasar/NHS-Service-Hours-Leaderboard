import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const UserManagement = ({ refreshTrigger }) => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const usersData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setUsers(usersData);
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]); // Add refreshTrigger to dependency array

  const handleRoleChange = async (userId, newRole) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: newRole });
    fetchUsers(); // Refresh the user list
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const userRef = doc(db, "users", userId);
      await deleteDoc(userRef);
      fetchUsers(); // Refresh the user list
    }
  };

  return (
    <div className="user-management">
      <h3 className="text-xl font-semibold mb-2">User Management</h3>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Change Role</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="officer">Officer</option>
                  <option value="advisor">Advisor</option>
                  <option value="creator">Creator</option>
                </select>
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;