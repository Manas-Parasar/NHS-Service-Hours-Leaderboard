import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import Leaderboard from "../components/Leaderboard";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const OfficerDashboard = () => {
  const { user, role } = useUser();
  const [events, setEvents] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // State for viewing other members' data
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(user?.uid); // Default to own ID

  // Fetch all users for the dropdown
  useEffect(() => {
    const fetchAllUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setAllUsers(usersData);
    };
    fetchAllUsers();
  }, []);

  // Fetch events for the selected member (or officer's own events)
  useEffect(() => {
    if (!selectedMemberId) return;
    const fetchEvents = async () => {
      const q = query(
        collection(db, "events"),
        where("userId", "==", selectedMemberId)
      );
      const snapshot = await getDocs(q);
      let hours = 0;
      const data = snapshot.docs.map(doc => {
        const event = doc.data();
        hours += event.hours || 0;
        return event;
      });
      setEvents(data);
      setTotalHours(hours);
    };
    fetchEvents();
  }, [selectedMemberId]);

  // Filter events by selected month and search term
  const filteredEvents = events.filter(e => {
    const monthMatch = selectedMonth
      ? new Date(e.date).getMonth() + 1 === Number(selectedMonth)
      : true;
    const searchMatch = searchTerm
      ? e.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return monthMatch && searchMatch;
  });

  // Group hours by tag
  const hoursByTag = filteredEvents.reduce((acc, event) => {
    acc[event.tag] = (acc[event.tag] || 0) + (event.hours || 0);
    return acc;
  }, {});

  // NHS/Non-NHS hours
  const nhsHours = filteredEvents.filter(e => e.tag === "NHS").reduce((sum, e) => sum + (e.hours || 0), 0);
  const nonNhsHours = filteredEvents.filter(e => e.tag !== "NHS").reduce((sum, e) => sum + (e.hours || 0), 0);

  return (
    <>
      <div className="dashboard-page">
        <div className="container">
          <h1>Officer Dashboard</h1>
          <p className="text-gray-700">Role: {role}</p>

          <section className="dashboard-summary">
            <div className="summary-item">
              <h2>Total Volunteer Hours</h2>
              <p><b>{totalHours}</b></p>
            </div>
            <div className="summary-item">
              <label>
                Filter by Month:{" "}
                <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                  <option value="">All Months</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="summary-item">
              <label>
                Search by Event Name:{" "}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Event name..."
                  className="p-2 border rounded"
                />
              </label>
            </div>
            <div className="summary-item">
              <label>
                View Member:
                <select
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                  className="p-2 border rounded ml-2"
                >
                  <option value={user?.uid}>My Data</option>
                  {allUsers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="dashboard-activities">
            <h2>Activities</h2>
            <ul>
              {filteredEvents.map((event, idx) => (
                <li key={idx}>
                  {event.name} — {event.hours} hours [{event.tag}] ({event.date ? new Date(event.date).toLocaleDateString() : ""})
                </li>
              ))}
            </ul>
          </section>

          <section className="dashboard-hours-breakdown">
            <h2>Hours Breakdown</h2>
            <div className="hours-by-tag">
              <h3>By Tag</h3>
              <ul>
                {Object.entries(hoursByTag).map(([tag, hours]) => (
                  <li key={tag}>{tag}: {hours} hours</li>
                ))}
              </ul>
            </div>
            <div className="nhs-other-hours">
              <p>NHS Hours: {nhsHours}</p>
              <p>Non-NHS Hours: {nonNhsHours}</p>
            </div>
          </section>

          <Leaderboard />
        </div>
      </div>
    </>
  );
};

export default OfficerDashboard;
