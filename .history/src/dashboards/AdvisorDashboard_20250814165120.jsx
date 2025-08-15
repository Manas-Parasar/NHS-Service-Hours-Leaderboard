import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import Leaderboard from "../components/Leaderboard";
import UserManagement from "../components/UserManagement";
import HistoricalRecordsView from "../components/HistoricalRecordsView";
import AddHoursForm from "../components/AddHoursForm";
import AddUserForm from "../components/AddUserForm";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";

const AdvisorDashboard = () => {
  const { user, role } = useUser();
  const [refreshHistoricalRecords, setRefreshHistoricalRecords] = useState(0);
  const [refreshData, setRefreshData] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const fetchRequests = async () => {
    const requestsSnapshot = await getDocs(collection(db, "advisorRequests"));
    const requests = requestsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setPendingRequests(requests);
  };

  const fetchAllUsers = async () => {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setAllUsers(users);
  };

  useEffect(() => {
    fetchRequests();
    fetchAllUsers();
  }, [refreshData]);

  const handleApproveRequest = async (requestId, userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { temporaryAdvisor: true });
      await deleteDoc(doc(db, "advisorRequests", requestId));
      setRefreshData(prev => prev + 1);
      alert("Request approved.");
    } catch (error) {
      console.error("Error approving request: ", error);
      alert("Failed to approve request.");
    }
  };

  const handleDenyRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, "advisorRequests", requestId));
      fetchRequests();
      alert("Request denied.");
    } catch (error) {
      console.error("Error denying request: ", error);
      alert("Failed to deny request.");
    }
  };

  const handleToggleTemporaryAdvisor = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { temporaryAdvisor: !currentStatus });
      setRefreshData(prev => prev + 1);
      alert(`Temporary advisor status ${!currentStatus ? 'granted' : 'revoked'}.`);
    } catch (error) {
      console.error("Error toggling temporary advisor status: ", error);
      alert("Failed to update temporary advisor status.");
    }
  };

  const handleResetAllUserHours = async () => {
    if (window.confirm("Are you sure you want to reset hours for ALL users? This action cannot be undone.")) {
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const batch = snapshot.docs.map(userDoc => updateDoc(doc(db, "users", userDoc.id), { hours: 0 }));
        await Promise.all(batch);
        alert("All user hours have been reset to 0.");
        setRefreshData(prev => prev + 1);
      } catch (error) {
        console.error("Error resetting user hours: ", error);
        alert("Failed to reset user hours.");
      }
    }
  };

  const handleResetForNewSchoolYear = async () => {
    if (window.confirm("Are you sure you want to reset for a new school year? This will archive all events and reset all user hours. This action cannot be undone.")) {
      const schoolYear = prompt("Please enter the school year for this archive (e.g., 2024-2025):");
      if (!schoolYear) {
        alert("School year is required to proceed with the reset.");
        return;
      }
      try {
        const eventsRef = collection(db, "events");
        const eventsSnapshot = await getDocs(eventsRef);
        const archiveBatch = [];
        eventsSnapshot.docs.forEach((eventDoc) => {
          archiveBatch.push(addDoc(collection(db, "historicalEvents"), { ...eventDoc.data(), schoolYear }));
          archiveBatch.push(deleteDoc(doc(db, "events", eventDoc.id)));
        });
        await Promise.all(archiveBatch);
        await handleResetAllUserHours();
        alert(`Successfully reset for a new school year. Events archived as ${schoolYear} and user hours reset.`);
        setRefreshHistoricalRecords(prev => prev + 1);
        setRefreshData(prev => prev + 1);
      } catch (error) {
        console.error("Error resetting for new school year: ", error);
        alert("Failed to reset for new school year.");
      }
    }
  };

  const handleHoursAdded = () => {
    setRefreshData(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Advisor Dashboard</h1>
          <p className="text-blue-800 font-medium">Role: {role}</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Add User */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-blue-700 mb-2 text-center">Add New User</h2>
              <p className="text-gray-600 mb-4 text-center">Add members, officers, advisors, or creators.</p>
              <AddUserForm />
            </div>

            {/* Pending Requests */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-blue-700 mb-2">Pending Advisor Requests</h2>
              {pendingRequests.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {pendingRequests.map(req => (
                    <li key={req.id} className="py-2 flex justify-between items-center">
                      <span className="font-medium text-gray-800">{req.userName}</span>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleApproveRequest(req.id, req.userId)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >Approve</button>
                        <button
                          onClick={() => handleDenyRequest(req.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >Deny</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No pending requests.</p>
              )}
            </div>

            {/* Add Hours */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-blue-700 mb-2 text-center">Add Hours</h2>
              <p className="text-gray-600 mb-4 text-center">Manually add service hours for members.</p>
              <AddHoursForm onHoursAdded={handleHoursAdded} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Dashboard Overview */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-blue-700 mb-2">Dashboard Overview</h2>
              <p className="text-gray-600 mb-4">Quick actions for managing the system.</p>
              <div className="space-x-4">
                <button
                  onClick={handleResetAllUserHours}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >Reset All User Hours</button>
                <button
                  onClick={handleResetForNewSchoolYear}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >Reset for New School Year</button>
              </div>
            </div>

            {/* Grant/Revoke Temporary Advisor */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-blue-700 mb-2">Grant/Revoke Temporary Advisor</h2>
              <ul className="divide-y divide-gray-200">
                {allUsers.filter(u => u.role === 'officer').map(officer => (
                  <li key={officer.id} className="py-2 flex justify-between items-center">
                    <span>{officer.name}</span>
                    <button
                      onClick={() => handleToggleTemporaryAdvisor(officer.id, officer.temporaryAdvisor)}
                      className={`px-3 py-1 rounded-lg text-white ${officer.temporaryAdvisor ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} transition`}
                    >
                      {officer.temporaryAdvisor ? "Revoke" : "Grant"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* User Management */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-blue-700 mb-2">User Management</h2>
              <UserManagement refreshTrigger={refreshData} />
            </div>

            {/* Leaderboard */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-blue-700 mb-2">Leaderboard</h2>
              <Leaderboard refreshTrigger={refreshData} />
            </div>

            {/* Historical Records */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-blue-700 mb-2">Historical Records</h2>
              <HistoricalRecordsView refreshTrigger={refreshHistoricalRecords} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorDashboard;