import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import Leaderboard from "../components/Leaderboard";
import UserManagement from "../components/UserManagement";
import HistoricalRecordsView from "../components/HistoricalRecordsView";
import AddHoursForm from "../components/AddHoursForm";
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
        
        const batch = [];
        snapshot.docs.forEach((userDoc) => {
          batch.push(updateDoc(doc(db, "users", userDoc.id), { hours: 0 }));
        });
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Advisor Dashboard</h1>
        <p className="text-gray-600 mb-6">Role: {role}</p>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard Overview</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleResetAllUserHours}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
            >
              Reset All User Hours
            </button>
            <button
              onClick={handleResetForNewSchoolYear}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
            >
              Reset for New School Year
            </button>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Temporary Advisor Powers</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Pending Requests</h3>
            {pendingRequests.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {pendingRequests.map(req => (
                  <li key={req.id} className="py-3 flex justify-between items-center">
                    <span className="text-gray-800">{req.userName}</span>
                    <div>
                      <button
                        onClick={() => handleApproveRequest(req.id, req.userId)}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-lg shadow-sm mr-2 transition duration-300 ease-in-out"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDenyRequest(req.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg shadow-sm transition duration-300 ease-in-out"
                      >
                        Deny
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No pending requests.</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Grant/Revoke Manually</h3>
            <ul className="divide-y divide-gray-200">
              {allUsers.filter(u => u.role === 'officer').map(officer => (
                <li key={officer.id} className="py-3 flex justify-between items-center">
                  <span className="text-gray-800">{officer.name}</span>
                  <button
                    onClick={() => handleToggleTemporaryAdvisor(officer.id, officer.temporaryAdvisor)}
                    className={`${ 
                      officer.temporaryAdvisor ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                    } text-white font-bold py-1 px-3 rounded-lg shadow-sm transition duration-300 ease-in-out`}
                  >
                    {officer.temporaryAdvisor ? "Revoke" : "Grant"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <AddHoursForm onHoursAdded={handleHoursAdded} />
        <UserManagement refreshTrigger={refreshData} />
        <Leaderboard refreshTrigger={refreshData} />
        <HistoricalRecordsView refreshTrigger={refreshHistoricalRecords} />
      </div>
    </div>
  );
};

export default AdvisorDashboard;