import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import LeaderboardChart from "./LeaderboardChart";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      data.sort((a, b) => (b.hours || 0) - (a.hours || 0));
      setLeaderboard(data);
    };
    fetchLeaderboard();
  }, []);

  return (
    <section className="dashboard-leaderboard">
      <h2>Overall Leaderboard</h2>
      <LeaderboardChart leaderboardData={leaderboard} />
      <h3>Top Volunteers</h3>
      <ol>
        {leaderboard.map((user) => (
          <li key={user.id}>
            {user.name}: {user.hours || 0} hours
          </li>
        ))}
      </ol>
    </section>
  );
};

export default Leaderboard;
