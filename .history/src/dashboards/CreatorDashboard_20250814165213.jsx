import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import Leaderboard from "../components/Leaderboard";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const CreatorDashboard = () => {
  const { user, role } = useUser();
  const [allUsers, setAllUsers] = useState([]);
  const [refreshData, setRefreshData] = useState(0);

  // Fetch all users
  const fetchAllUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const usersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setAllUsers(usersData);
  };

  useEffect(() => {
    fetchAllUsers();
  }, [refreshData]);

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Creator Dashboard</h1>
          <p className="text-blue-800 font-medium">Role: {role}</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-blue-700 mb-2 text-center">All Users Overview</h2>
              <p className="text-gray-600 mb-4 text-center">View and manage all members, officers, and advisors.</p>
              <ul className="divide-y divide-gray-200">
                {allUsers.map(userItem => (
                  <li key={userItem.id} className="py-2 flex justify-between items-center">
                    <span className="font-medium text-gray-800">{userItem.name} ({userItem.role})</span>
                    <span className="text-gray-500">{userItem.hours} hours</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-blue-700 mb-2 text-center">Leaderboard</h2>
              <p className="text-gray-600 mb-4 text-center">Top contributors across all members.</p>
              <Leaderboard refreshTrigger={refreshData} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-blue-700 mb-2 text-center">Creator Tools</h2>
              <p className="text-gray-600 mb-4 text-center">Manage high-level system settings (future updates).</p>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition w-full"
                onClick={() => alert("Creator tool functionality coming soon!")}
              >
                Launch Creator Tool
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;