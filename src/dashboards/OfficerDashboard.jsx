import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import Leaderboard from "../components/Leaderboard";
import DashboardCard from "../components/DashboardCard"; // Import the new DashboardCard

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

  const handleRequestAdvisorPower = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, "advisorRequests"), {
        userId: user.uid,
        userName: user.displayName || user.email,
        status: "pending",
        timestamp: new Date(),
      });
      alert("Request for temporary advisor power sent successfully!");
    } catch (error) {
      console.error("Error sending request: ", error);
      alert("Failed to send request.");
    }
  };

  return (
    <div style={{backgroundColor: '#e0f2f7', color: '#555'}}>
      <div>
        <h1 style={{marginTop: 0, color: '#2b8dd3', fontFamily: "'Cinzel', serif", fontWeight: 'bold'}}>Officer Dashboard</h1>
        <p style={{color: '#555'}}>Role: {role}</p>

        <div style={{display: 'flex'}}>
          <div style={{backgroundColor: 'white', border: '1px solid #ccc', flex: '1', margin: '20px', borderRadius: '15px', padding: '20px'}}>
            <section>
              <h2 style={{color: '#2b8dd3'}}>Leaderboard</h2>
              <p style={{color: '#555'}}>View the current service hours leaderboard.</p>
              <Leaderboard />
            </section>

            <section style={{backgroundColor: 'white', border: '1px solid #ccc', flex: '1', margin: '20px', borderRadius: '15px', padding: '20px'}}>
              <h2 style={{color: '#2b8dd3'}}>Activities</h2>
              <p style={{color: '#555'}}>Your recorded service activities.</p>
              <ul style={{listStyle: 'none', padding: 0}}>
                {filteredEvents.length > 0 ? filteredEvents.map((event, idx) => (
                  <li key={idx} style={{padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <p style={{margin: 0, fontWeight: 'bold', color: '#333'}}>{event.name}</p>
                      <p style={{margin: 0, fontSize: '0.9em', color: '#666'}}>{event.date ? new Date(event.date).toLocaleDateString() : ""}</p>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <p style={{margin: 0, fontWeight: 'bold', color: '#2b8dd3'}}>{event.hours} hours</p>
                      <span style={{fontSize: '0.8em', backgroundColor: '#e0f2f7', color: '#2b8dd3', padding: '3px 8px', borderRadius: '10px'}}>{event.tag}</span>
                    </div>
                  </li>
                )) : <p style={{color: '#555', textAlign: 'center'}}>No activities found.</p>}
              </ul>
            </section>

            <section style={{backgroundColor: 'white', border: '1px solid #ccc', flex: '1', margin: '20px', borderRadius: '15px', padding: '20px'}}>
              <h2 style={{color: '#2b8dd3'}}>Hours Breakdown</h2>
              <ul style={{listStyle: 'none', padding: 0}}>
                {Object.entries(hoursByTag).map(([tag, hours]) => (
                  <li key={tag} style={{padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#555'}}>
                    <span style={{fontWeight: 'bold'}}>{tag}</span>
                    <span style={{color: '#2b8dd3', fontWeight: 'bold'}}>{hours} hrs</span>
                  </li>
                ))}
              </ul>
            </section>

            <section style={{backgroundColor: 'white', border: '1px solid #ccc', flex: '1', margin: '20px', borderRadius: '15px', padding: '20px'}}>
              <h2 style={{color: '#2b8dd3'}}>NHS vs. Non-NHS Hours</h2>
              <div style={{marginTop: '10px'}}>
                <p style={{color: '#555', margin: '5px 0'}}>
                  NHS Hours: <span style={{color: '#2b8dd3', fontWeight: 'bold'}}>{nhsHours}</span>
                </p>
                <p style={{color: '#555', margin: '5px 0'}}>
                  Non-NHS Hours: <span style={{color: '#555', fontWeight: 'bold'}}>{nonNhsHours}</span>
                </p>
              </div>
            </section>
          </div>

          <div style={{flex: '1', margin: '20px'}}>
            <div style={{backgroundColor: 'white', border: '1px solid #ccc', flex: '1', margin: '20px', borderRadius: '15px', padding: '20px'}}>
              <h2 style={{color: '#2b8dd3', fontSize: '1.75rem', textAlign: 'center'}}>Dashboard Overview</h2>
              <p style={{color: '#555', textAlign: 'center'}}>Quick actions and filters.</p>
              <section>
                <h3 style={{color: '#2b8dd3'}}>Filters & Total Hours</h3>
                <div style={{marginBottom: '15px'}}>
                  <h4 style={{color: '#2b8dd3', margin: '10px 0'}}>Total Volunteer Hours</h4>
                  <p style={{fontSize: '3em', fontWeight: 'bold', color: '#2b8dd3', textAlign: 'center'}}>{totalHours}</p>
                </div>

                <div style={{marginBottom: '15px'}}>
                  <label style={{display: 'block', color: '#555', fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px'}}>
                    Filter by Month:
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      style={{marginTop: '5px', display: 'block', width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '5px'}}
                    >
                      <option value="">All Months</option>
                      {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                  </label>
                </div>

                <div style={{marginBottom: '15px'}}>
                  <label style={{display: 'block', color: '#555', fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px'}}>
                    Search by Event Name:
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Event name..."
                      style={{marginTop: '5px', display: 'block', width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '5px'}}
                    />
                  </label>
                </div>

                <div style={{marginBottom: '15px'}}>
                  <label style={{display: 'block', color: '#555', fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px'}}>
                    View Member:
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      style={{marginTop: '5px', display: 'block', width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '5px'}}
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
            </div>

            <section style={{backgroundColor: 'white', border: '1px solid #ccc', flex: '1', margin: '20px', borderRadius: '15px', padding: '20px'}}>
              <h2 style={{color: '#2b8dd3'}}>Request Advisor Power</h2>
              <p style={{color: '#555'}}>Request temporary advisor privileges.</p>
              <button
                onClick={handleRequestAdvisorPower}
                style={{backgroundColor: '#2b8dd3', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer'}}
              >
                Request Advisor Power
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;