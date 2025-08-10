import React from "react";
import { useUser } from "../context/UserContext";
import Navbar from "../components/Navbar";

const CreatorDashboard = () => {
  const { user } = useUser();

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}</h2>
        <p className="text-gray-700">Role: {user?.role}</p>
        <p className="text-gray-700 mb-6">Email: {user?.email}</p>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Dashboard Overview</h3>
          <p>This section will show creator-specific features.</p>
        </div>
      </div>
    </>
  );
};

export default CreatorDashboard;