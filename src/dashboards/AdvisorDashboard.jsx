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
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}</h2>
        <p className="text-gray-700">Role: {role}</p>
        <p className="text-gray-700 mb-6">Email: {user?.email}</p>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Dashboard Overview</h3>
          <button
            onClick={handleResetAllUserHours}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 mr-2"
          >
            Reset All User Hours
          </button>
          <button
            onClick={handleResetForNewSchoolYear}
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Reset for New School Year
          </button>
        </div>

        <div className="bg-white p-4 rounded shadow mt-6">
          <h3 className="text-xl font-semibold mb-2">Manage Temporary Advisor Powers</h3>
          
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Pending Requests</h4>
            {pendingRequests.length > 0 ? (
              <ul>
                {pendingRequests.map(req => (
                  <li key={req.id} className="flex justify-between items-center mb-2">
                    <span>{req.userName}</span>
                    <div>
                      <button
                        onClick={() => handleApproveRequest(req.id, req.userId)}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDenyRequest(req.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Deny
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No pending requests.</p>
            )}
          </div>

          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Grant/Revoke Manually</h4>
            <ul>
              {allUsers.filter(u => u.role === 'officer').map(officer => (
                <li key={officer.id} className="flex justify-between items-center mb-2">
                  <span>{officer.name}</span>
                  <button
                    onClick={() => handleToggleTemporaryAdvisor(officer.id, officer.temporaryAdvisor)}
                    className={`${ 
                      officer.temporaryAdvisor ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"
                    } text-white font-bold py-1 px-2 rounded`}
                  >
                    {officer.temporaryAdvisor ? "Revoke" : "Grant"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <AddHoursForm onHoursAdded={handleHoursAdded} />
        <UserManagement refreshTrigger={refreshData} />
        <Leaderboard refreshTrigger={refreshData} />
        <HistoricalRecordsView refreshTrigger={refreshHistoricalRecords} />
      </div>
    </>
  );
};

export default AdvisorDashboard;