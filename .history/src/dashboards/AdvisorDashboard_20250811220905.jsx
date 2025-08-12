import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";
import LeaderboardChart from "../components/LeaderboardChart";

const AdvisorDashboard = () => {
    const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map(doc => doc.data());
      data.sort((a, b) => (b.hours || 0) - (a.hours || 0));
      setLeaderboard(data);
    };
    fetchLeaderboard();
  }, []);
  const [newMember, setNewMember] = useState({ name: "", email: "" });
  const [newMemberRole, setNewMemberRole] = useState("member");

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchUsers();
  }, []);

  const resetHours = async () => {
    const currentYear = new Date().getFullYear(); // Or define academic year logic
    for (const user of users) {
      if (user.hours > 0) {
        const historicalHoursRef = doc(db, "users", user.id, "historicalHours", String(currentYear));
        await setDoc(historicalHoursRef, {
          year: currentYear,
          hours: user.hours,
          resetDate: new Date().toISOString()
        });
      }
      await updateDoc(doc(db, "users", user.id), { hours: 0 });
    }
    alert("All hours reset and archived!");
    // Refresh users and leaderboard after reset
    const snapshot = await getDocs(collection(db, "users"));
    setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLeaderboard(snapshot.docs.map(doc => doc.data()).sort((a, b) => (b.hours || 0) - (a.hours || 0)));
  };

  const addMember = async () => {
    // Generate a unique ID (could use email, but UID is better if available)
    const newId = newMember.email; // Or use a generated UID
    await setDoc(doc(db, "users", newId), {
      name: newMember.name,
      email: newMember.email,
      role: newMemberRole,
      hours: 0
    });
    setNewMember({ name: "", email: "" });
    setNewMemberRole("member"); // Reset role dropdown
    // Immediately refresh members list
    const snapshot = await getDocs(collection(db, "users"));
    setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    alert("Member added!");
  };

  const handleRoleChange = async (userId, newRole) => {
    await updateDoc(doc(db, "users", userId), { role: newRole });
    setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
    alert("User role updated!");
  };

  const deleteUser = async (id, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      await deleteDoc(doc(db, "users", id));
      alert("User deleted!");
      // Immediately refresh members list
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email)
      .then(() => alert(`Copied: ${email}`))
      .catch(err => console.error("Failed to copy email: ", err));
  };

  const resetSchoolYear = async () => {
    const currentAcademicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`; // e.g., "2023-2024"

    if (window.confirm("Are you sure you want to completely reset for a new school year? This will archive ALL current users and events, and then clear them for the new year. This action cannot be undone for the current year's data.")) {
      try {
        // 1. Archive current users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const archivedUsersRef = collection(db, "archivedYears", currentAcademicYear, "users");
        for (const userDoc of usersSnapshot.docs) {
          await setDoc(doc(archivedUsersRef, userDoc.id), userDoc.data());
          // Optionally, delete historicalHours subcollection if it's not needed in the main users collection after archiving
          const historicalHoursSnapshot = await getDocs(collection(db, "users", userDoc.id, "historicalHours"));
          for (const histDoc of historicalHoursSnapshot.docs) {
            await deleteDoc(doc(db, "users", userDoc.id, "historicalHours", histDoc.id));
          }
          await deleteDoc(doc(db, "users", userDoc.id)); // Delete user from current collection
        }

        // 2. Archive current events
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const archivedEventsRef = collection(db, "archivedYears", currentAcademicYear, "events");
        for (const eventDoc of eventsSnapshot.docs) {
          await setDoc(doc(archivedEventsRef, eventDoc.id), eventDoc.data());
          await deleteDoc(doc(db, "events", eventDoc.id)); // Delete event from current collection
        }

        alert("School year reset and archived successfully!");
        // Refresh UI
        setUsers([]);
        setLeaderboard([]);
        setEvents([]);
      } catch (error) {
        console.error("Error resetting school year:", error);
        alert("Failed to reset school year. Check console for details.");
      }
    }
  };

  const [events, setEvents] = useState([]);
  const TAG_OPTIONS = ["service", "leadership", "other"];

  const [archivedYears, setArchivedYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [historicalLeaderboard, setHistoricalLeaderboard] = useState([]);

  useEffect(() => {
    const fetchArchivedYears = async () => {
      const snapshot = await getDocs(collection(db, "archivedYears"));
      const years = snapshot.docs.map(doc => doc.id).sort().reverse();
      setArchivedYears(years);
      if (years.length > 0) {
        setSelectedYear(years[0]); // Select the most recent archived year by default
      }
    };
    fetchArchivedYears();
  }, []);

  useEffect(() => {
    const fetchHistoricalLeaderboard = async () => {
      if (selectedYear) {
        const usersSnapshot = await getDocs(collection(db, "archivedYears", selectedYear, "users"));
        const data = usersSnapshot.docs.map(doc => doc.data());
        data.sort((a, b) => (b.hours || 0) - (a.hours || 0));
        setHistoricalLeaderboard(data);
      } else {
        setHistoricalLeaderboard([]);
      }
    };
    fetchHistoricalLeaderboard();
  }, [selectedYear]);

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, "events"));
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchEvents();
  }, []);

  

  const updateTag = async (eventId, newTag) => {
    await updateTag(doc(db, "events", eventId), { tag: newTag });
    setEvents(events => events.map(ev => ev.id === eventId ? { ...ev, tag: newTag } : ev));
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="container">
          <div className="dashboard-header">
            <h1>Advisor Dashboard</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={resetHours}>Reset All Hours</button>
              <button onClick={resetSchoolYear} style={{ backgroundColor: '#dc2626' }}>Reset School Year</button>
            </div>
          </div>

          <section className="dashboard-section">
            <h2>Add New Member</h2>
            <div className="form-group">
              <label htmlFor="memberName">Name</label>
              <input
                id="memberName"
                placeholder="Name"
                value={newMember.name}
                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="memberEmail">Email</label>
              <input
                id="memberEmail"
                placeholder="Email"
                value={newMember.email}
                onChange={e => setNewMember({ ...newMember, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="memberRole">Role</label>
              <select
                id="memberRole"
                value={newMemberRole}
                onChange={e => setNewMemberRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="officer">Officer</option>
                <option value="advisor">Advisor</option>
                <option value="creator">Creator</option>
              </select>
            </div>
            <button onClick={addMember}>Add Member</button>
          </section>

          <section className="dashboard-section">
            <h2>Manage User Roles</h2>
            <table className="user-management-table">
              
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Current Role</th>
                  <th>Change Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td className="email-cell" title={user.email} onClick={() => handleCopyEmail(user.email)}>{user.email}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{user.role}</td>
                    <td>
                      <select
                        className="role-select"
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="member">Member</option>
                        <option value="officer">Officer</option>
                        <option value="advisor">Advisor</option>
                        <option value="creator">Creator</option>
                      </select>
                    </td>
                    <td>
                      <button className="delete-button-red-x" onClick={() => deleteUser(user.id, user.name)}>X</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="dashboard-section">
            <h2>All Events</h2>
            <table>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>User</th>
                  <th>Hours</th>
                  <th>Tag</th>
                  <th>Change Tag</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td>{ev.name}</td>
                    <td>{ev.userId}</td>
                    <td>{ev.hours}</td>
                    <td>{ev.tag}</td>
                    <td>
                      <select value={ev.tag} onChange={e => updateTag(ev.id, e.target.value)}>
                        {TAG_OPTIONS.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="dashboard-section">
            <h2>Overall Leaderboard</h2>
            <LeaderboardChart leaderboardData={leaderboard} />
            <h3>Top Volunteers</h3>
            {leaderboard.length > 0 ? (
              <ol>
                {leaderboard.map((user, idx) => (
                  <li key={idx}>
                    {user.name}: {user.hours || 0} hours
                  </li>
                ))}
              </ol>
            ) : (
              <p>No volunteers yet.</p>
            )}
          </section>

          <section className="dashboard-section">
            <h2>Historical Leaderboards</h2>
            <div className="form-group">
              <label htmlFor="selectYear">Select Year:</label>
              <select
                id="selectYear"
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
              >
                <option value="">Select a year</option>
                {archivedYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            {selectedYear && historicalLeaderboard.length > 0 ? (
              <>
                <h3>Leaderboard for {selectedYear}</h3>
                <ol>
                  {historicalLeaderboard.map((user, idx) => (
                    <li key={idx}>
                      {user.name}: {user.hours || 0} hours
                    </li>
                  ))}
                </ol>
              </>
            ) : selectedYear ? (
              <p>No historical data found for {selectedYear}.</p>
            ) : (
              <p>Select a year to view historical leaderboards.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default AdvisorDashboard;
new_string:
                    <td style={{ whiteSpace: 'nowrap' }}>{user.role}</td>
old_string:
                    <td>{user.role}</td>