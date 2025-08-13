import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

const HistoricalRecordsView = ({ refreshTrigger }) => {
  const [historicalEvents, setHistoricalEvents] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const fetchHistoricalEvents = async () => {
    const q = selectedYear
      ? query(collection(db, "historicalEvents"), where("schoolYear", "==", selectedYear))
      : collection(db, "historicalEvents");
    const snapshot = await getDocs(q);
    const eventsData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setHistoricalEvents(eventsData);

    // Extract unique school years for filtering
    const currentYear = new Date().getFullYear();
    const currentSchoolYear = `${currentYear}-${currentYear + 1}`;
    let years = [...new Set(eventsData.map(event => event.schoolYear))];
    if (!years.includes(currentSchoolYear)) {
      years.push(currentSchoolYear);
    }
    years.sort();
    console.log("Available years before setting state:", years);
    setAvailableYears(years);
  };

  useEffect(() => {
    fetchHistoricalEvents();
  }, [selectedYear, refreshTrigger]); // Add refreshTrigger to dependency array

  const handleDeleteYearData = async () => {
    if (!selectedYear) {
      if (!window.confirm("Are you sure you want to delete ALL historical data? This action cannot be undone.")) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete historical data for ${selectedYear}? This action cannot be undone.`)) {
        return;
      }
    }

    try {
      const q = selectedYear
        ? query(collection(db, "historicalEvents"), where("schoolYear", "==", selectedYear))
        : collection(db, "historicalEvents");
      const snapshot = await getDocs(q);

      const deleteBatch = [];
      snapshot.docs.forEach((eventDoc) => {
        deleteBatch.push(deleteDoc(doc(db, "historicalEvents", eventDoc.id)));
      });
      await Promise.all(deleteBatch);
      alert("Historical data deleted successfully.");
      fetchHistoricalEvents(); // Refresh the view
    } catch (error) {
      console.error("Error deleting historical data: ", error);
      alert("Failed to delete historical data.");
    }
  };

  return (
    <div className="historical-records-view mt-8">
      <h3 className="text-xl font-semibold mb-2">Historical Records</h3>
      <h2 className="text-2xl font-bold mb-4">{selectedYear ? `Events for ${selectedYear} School Year` : "All Historical Events"}</h2>
      <div className="mb-4">
        <label htmlFor="schoolYearFilter" className="mr-2">Filter by School Year:</label>
        <select
          id="schoolYearFilter"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Years</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <button
          onClick={handleDeleteYearData}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
        >
          Delete Year Data
        </button>
      </div>
      <div className="bg-white p-4 rounded shadow">
        {historicalEvents.length === 0 ? (
          <p>No historical records found for the selected year.</p>
        ) : (
          <ul>
            {historicalEvents.map((event) => (
              <li key={event.id} className="mb-2 p-2 border-b last:border-b-0">
                <p><strong>Event:</strong> {event.name}</p>
                <p><strong>Hours:</strong> {event.hours}</p>
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Tag:</strong> {event.tag}</p>
                <p><strong>User:</strong> {event.userName || 'N/A'}</p>
                <p><strong>School Year:</strong> {event.schoolYear}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoricalRecordsView;