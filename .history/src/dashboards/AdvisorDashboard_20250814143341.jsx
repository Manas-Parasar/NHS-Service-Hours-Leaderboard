import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import Leaderboard from "../components/Leaderboard";
import UserManagement from "../components/UserManagement";
import HistoricalRecordsView from "../components/HistoricalRecordsView";
import AddHoursForm from "../components/AddHoursForm";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import AddUserForm from "../components/AddUserForm";

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
    <div style={{backgroundColor: '#e6f0ff', color: '#555'}}>
      <div>
        <h1 style={{marginTop: 0}}>Advisor Dashboard</h1>
        <p>Role: {role}</p>

        <div style={{display: 'flex'}}>

          <div style={{backgroundColor: 'white', border: '1px solid #ccc', flex: '1', margin: '20px', borderRadius: '15px', padding: '20px'}}>
            <section>
                <h2 style={{color: '#2b8dd3', fontSize: '1.75rem', textAlign: 'center'}}>Add New User</h2>
                <p style={{fontsize: '1.25 rem'}}> Add new members, officers, advisors, or creators to the system.</p>
                <AddUserForm />
            </section>
          </div>

          <div style={{flex: '1', margin: '20px'}}>
            <section>
              <h2 style={{color: '#2b8dd3'}}>Dashboard Overview</h2>
              <p>Quick actions for managing the system.</p>
              <div>
                <button onClick={handleResetAllUserHours}>
                  Reset All User Hours
                </button>
                <button onClick={handleResetForNewSchoolYear}>
                  Reset for New School Year
                </button>
              </div>
            </section>

            <section>
              <h2 style={{color: '#2b8dd3'}}>Manage Temporary Advisor Powers</h2>
              <p>Approve requests or manually grant/revoke temporary advisor status.</p>
              <div>
                <h3 style={{color: '#2b8dd3'}}>Pending Requests</h3>
                {pendingRequests.length > 0 ? (
                  <ul>
                    {pendingRequests.map(req => (
                      <li key={req.id}>
                        <span>{req.userName}</span>
                        <div>
                          <button onClick={() => handleApproveRequest(req.id, req.userId)}>
                            Approve
                          </button>
                          <button onClick={() => handleDenyRequest(req.id)}>
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

              <div>
                <h3 style={{color: '#2b8dd3'}}>Grant/Revoke Manually</h3>
                <ul>
                  {allUsers.filter(u => u.role === 'officer').map(officer => (
                    <li key={officer.id}>
                      <span>{officer.name}</span>
                      <button onClick={() => handleToggleTemporaryAdvisor(officer.id, officer.temporaryAdvisor)}>
                        {officer.temporaryAdvisor ? "Revoke" : "Grant"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h2 style={{color: '#2b8dd3'}}>Add Hours</h2>
              <p>Manually add service hours for members.</p>
              <AddHoursForm onHoursAdded={handleHoursAdded} />
            </section>

            <section>
              <h2 style={{color: '#2b8dd3'}}>User Management</h2>
              <p>View and manage all users in the system.</p>
              <UserManagement refreshTrigger={refreshData} />
            </section>

            <section>
              <h2 style={{color: '#2b8dd3'}}>Leaderboard</h2>
              <p>View the current service hours leaderboard.</p>
              <Leaderboard refreshTrigger={refreshData} />
            </section>

            <section>
              <h2 style={{color: '#2b8dd3'}}>Historical Records</h2>
              <p>Access archived service hour records from previous school years.</p>
              <HistoricalRecordsView refreshTrigger={refreshHistoricalRecords} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorDashboard;
