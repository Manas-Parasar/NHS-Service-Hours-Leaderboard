import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import Navbar from "../components/Navbar";
import LeaderboardChart from "../components/LeaderboardChart";
import '../styles/Dashboard.css';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MemberDashboard = () => {
  const { firebaseUser } = useUser();
  const [events, setEvents] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  // Fetch member's events
  useEffect(() => {
    if (!firebaseUser) return;
    const fetchEvents = async () => {
      const q = query(
        collection(db, "events"),
        where("userId", "==", firebaseUser.uid)
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
  }, [firebaseUser]);

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map(doc => doc.data());
      data.sort((a, b) => (b.hours || 0) - (a.hours || 0));
      setLeaderboard(data);
    };
    fetchLeaderboard();
  }, []);

  // Filter events by selected month
  const filteredEvents = selectedMonth
    ? events.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === Number(selectedMonth);
      })
    : events;

  // Group hours by tag
  const hoursByTag = filteredEvents.reduce((acc, event) => {
    acc[event.tag] = (acc[event.tag] || 0) + (event.hours || 0);
    return acc;
  }, {});

  // NHS/Other hours
  const nhsHours = filteredEvents.filter(e => e.tag === "NHS").reduce((sum, e) => sum + (e.hours || 0), 0);
  const otherHours = filteredEvents.filter(e => e.tag !== "NHS").reduce((sum, e) => sum + (e.hours || 0), 0);

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="container">
          <div className="dashboard-header">
            <h1>Member Dashboard</h1>
          </div>

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
          </section>

          <section className="dashboard-activities">
            <h2>Your Activities</h2>
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
              <p>Other Hours: {otherHours}</p>
            </div>
          </section>

          <section className="dashboard-section dashboard-leaderboard">
            <h2>Overall Leaderboard</h2>
            <LeaderboardChart leaderboardData={leaderboard} />
            <h3>Top Volunteers</h3>
            <ol>
              {leaderboard.map((user, idx) => (
                <li key={idx}>
                  {user.displayName}: {user.hours || 0} hours
                </li>
              ))}
            </ol>
          </section>
      </div>
    </>
  );
};

export default MemberDashboard;