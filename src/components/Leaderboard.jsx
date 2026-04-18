import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import LeaderboardChart from "./LeaderboardChart";

const Leaderboard = ({ refreshTrigger }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [hourType, setHourType] = useState("all");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const eventsSnapshot = await getDocs(collection(db, "events"));

      const eventsByUser = {};
      eventsSnapshot.docs.forEach((doc) => {
        const event = doc.data();
        if (!eventsByUser[event.userId]) {
          eventsByUser[event.userId] = { nhs: 0, nonNhs: 0 };
        }
        if (event.tag === "NHS") {
          eventsByUser[event.userId].nhs += event.hours || 0;
        } else {
          eventsByUser[event.userId].nonNhs += event.hours || 0;
        }
      });

      const data = usersSnapshot.docs.map((doc) => {
        const userData = doc.data();
        const userEvents = eventsByUser[doc.id] || { nhs: 0, nonNhs: 0 };
        return {
          ...userData,
          id: doc.id,
          totalHours: userData.hours || 0,
          nhsHours: userEvents.nhs,
          nonNhsHours: userEvents.nonNhs,
        };
      });

      data.sort((a, b) => {
        const aHours = hourType === "nhs" ? a.nhsHours : hourType === "nonNhs" ? a.nonNhsHours : a.totalHours;
        const bHours = hourType === "nhs" ? b.nhsHours : hourType === "nonNhs" ? b.nonNhsHours : b.totalHours;
        return bHours - aHours;
      });

      setLeaderboard(data);
    };
    fetchLeaderboard();
  }, [refreshTrigger, hourType]);

  const getHours = (user) => {
    if (hourType === "nhs") return user.nhsHours;
    if (hourType === "nonNhs") return user.nonNhsHours;
    return user.totalHours;
  };

  const getLabel = () => {
    if (hourType === "nhs") return "NHS Hours";
    if (hourType === "nonNhs") return "Non-NHS Hours";
    return "All Hours";
  };

  return (
    <section className="dashboard-leaderboard">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
        <label style={{ fontWeight: "bold", color: "#555" }}>Hours Type:</label>
        <select
          value={hourType}
          onChange={(e) => setHourType(e.target.value)}
          style={{ padding: "5px 10px", borderRadius: "5px", border: "1px solid #ccc" }}
        >
          <option value="all">All Hours</option>
          <option value="nhs">NHS Hours</option>
          <option value="nonNhs">Non-NHS Hours</option>
        </select>
      </div>
      <h2>Overall Leaderboard - {getLabel()}</h2>
      <LeaderboardChart leaderboardData={leaderboard} hourType={hourType} />
      <h3>Top Volunteers - {getLabel()}</h3>
      <ol>
        {leaderboard.map((user) => (
          <li key={user.id}>
            {user.name}: {getHours(user)} hours
          </li>
        ))}
      </ol>
    </section>
  );
};

export default Leaderboard;