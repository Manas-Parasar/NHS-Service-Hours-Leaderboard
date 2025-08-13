import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import Leaderboard from "../components/Leaderboard";
import UserManagement from "../components/UserManagement";
import HistoricalRecordsView from "../components/HistoricalRecordsView";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";

const AdvisorDashboard = () => {
  const { user } = useUser();
  const [refreshHistoricalRecords, setRefreshHistoricalRecords] = useState(0);

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
        // Optionally, refresh UserManagement and Leaderboard components
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
        // 1. Archive current events
        const eventsRef = collection(db, "events");
        const eventsSnapshot = await getDocs(eventsRef);

        const archiveBatch = [];
        eventsSnapshot.docs.forEach((eventDoc) => {
          archiveBatch.push(addDoc(collection(db, "historicalEvents"), { ...eventDoc.data(), schoolYear }));
          archiveBatch.push(deleteDoc(doc(db, "events", eventDoc.id)));
        });
        await Promise.all(archiveBatch);

        // 2. Reset all user hours
        await handleResetAllUserHours();

        alert(`Successfully reset for a new school year. Events archived as ${schoolYear} and user hours reset.`);
        setRefreshHistoricalRecords(prev => prev + 1); // Trigger refresh
      } catch (error) {
        console.error("Error resetting for new school year: ", error);
        alert("Failed to reset for new school year.");
      }
    }
  };

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}</h2>
        <p className="text-gray-700">Role: {user?.role}</p>
        <p className="text-gray-700 mb-6">Email: {user?.email}</p>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Dashboard Overview</h3>
          <p>This section will show advisor-specific features.</p>
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
        <UserManagement />
        <Leaderboard />
        <HistoricalRecordsView refreshTrigger={refreshHistoricalRecords} />
      </div>
    </>
  );
};

export default AdvisorDashboard;
