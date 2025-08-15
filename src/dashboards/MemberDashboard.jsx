import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import Leaderboard from "../components/Leaderboard";


const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MemberDashboard = () => {
  const { user, role } = useUser();
  const [events, setEvents] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // Fetch member's events
  useEffect(() => {
    if (!user) return;
    const fetchEvents = async () => {
      const q = query(
        collection(db, "events"),
        where("userId", "==", user.uid)
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
  }, [user]);

  const tags = [...new Set(events.map(e => e.tag))];

  // Filter events by selected month and search term
  const filteredEvents = events.filter(e => {
    const monthMatch = selectedMonth
      ? new Date(e.date).getMonth() + 1 === Number(selectedMonth)
      : true;
    const searchMatch = searchTerm
      ? e.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const tagMatch = selectedTag ? e.tag === selectedTag : true;
    return monthMatch && searchMatch && tagMatch;
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
    <div style={{backgroundColor: '#e0f2f7', color: '#555'}}>
      <div>
        <h1 style={{marginTop: 0, color: '#2b8dd3', fontFamily: "'Cinzel', serif", fontWeight: 'bold'}}>Member Dashboard</h1>
        <p style={{color: '#555'}}>Role: {role}</p>

        <div style={{display: 'flex'}}>

          <div style={{flex: '1', margin: '20px'}}>
            <section style={{backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '15px', padding: '20px', marginBottom: '20px'}}>
              <h2 style={{color: '#2b8dd3', fontSize: '1.75rem', textAlign: 'center'}}>Total Volunteer Hours</h2>
              <p style={{fontSize: '3rem', fontWeight: 'bold', color: '#2b8dd3', textAlign: 'center'}}>{totalHours}</p>
            </section>

            <section style={{backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '15px', padding: '20px', marginBottom: '20px'}}>
              <h2 style={{color: '#2b8dd3'}}>Filter by Month</h2>
              <label style={{display: 'block', color: '#555', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem'}}>
                Filter by Month:
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{marginTop: '0.5rem', display: 'block', width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none'}}
                >
                  <option value="">All Months</option>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </label>
            </section>

            <section style={{backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '15px', padding: '20px', marginBottom: '20px'}}>
              <h2 style={{color: '#2b8dd3'}}>Filter by Tag</h2>
              <label style={{display: 'block', color: '#555', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem'}}>
                Filter by Tag:
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  style={{marginTop: '0.5rem', display: 'block', width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none'}}
                >
                  <option value="">All Tags</option>
                  {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              </label>
            </section>

            <section style={{backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '15px', padding: '20px', marginBottom: '20px'}}>
              <h2 style={{color: '#2b8dd3'}}>Search Event</h2>
              <label style={{display: 'block', color: '#555', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem'}}>
                Search Event:
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type event name..."
                  style={{marginTop: '0.5rem', display: 'block', width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none'}}
                />
              </label>
            </section>
          </div>

          <div style={{flex: '1', margin: '20px'}}>
            <section style={{backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '15px', padding: '20px', marginBottom: '20px'}}>
              <h2 style={{color: '#2b8dd3'}}>Your Activities</h2>
              <ul style={{listStyle: 'none', padding: '0', margin: '0'}}>
                {filteredEvents.length > 0 ? filteredEvents.map((event, idx) => (
                  <li key={idx} style={{padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee'}}>
                    <div>
                      <p style={{fontSize: '1.125rem', fontWeight: '600', color: '#555', margin: '0'}}>{event.name}</p>
                      <p style={{fontSize: '0.875rem', color: '#555', margin: '0'}}>{event.date ? new Date(event.date).toLocaleDateString() : ""}</p>
                    </div>
                    <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                      <p style={{fontSize: '1rem', fontWeight: 'bold', color: '#2b8dd3', margin: '0'}}>{event.hours} hours</p>
                      <span style={{display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', backgroundColor: '#e0f2f7', color: '#2b8dd3', marginTop: '0.25rem'}}>{event.tag}</span>
                    </div>
                  </li>
                )) : <p style={{color: '#555', textAlign: 'center'}}>No activities found.</p>}
              </ul>
            </section>

            <section style={{backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '15px', padding: '20px', marginBottom: '20px'}}>
              <h2 style={{color: '#2b8dd3'}}>Hours Breakdown</h2>
              <ul style={{listStyle: 'none', padding: '0', margin: '0'}}>
                {Object.entries(hoursByTag).map(([tag, hours]) => (
                  <li key={tag} style={{padding: '0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#555', borderBottom: '1px solid #eee'}}>
                    <span style={{fontWeight: '500'}}>{tag}</span>
                    <span style={{fontWeight: 'bold', color: '#2b8dd3'}}>{hours} hrs</span>
                  </li>
                ))}
              </ul>
            </section>

            <section style={{backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '15px', padding: '20px', marginBottom: '20px'}}>
              <h2 style={{color: '#2b8dd3'}}>NHS vs. Non-NHS Hours</h2>
              <div style={{marginBottom: '1rem'}}>
                <p style={{color: '#555', fontWeight: '500', margin: '0'}}>
                  NHS Hours: <span style={{color: '#2b8dd3', fontWeight: 'bold'}}>{nhsHours}</span>
                </p>
                <p style={{color: '#555', fontWeight: '500', margin: '0'}}>
                  Non-NHS Hours: <span style={{color: '#555', fontWeight: 'bold'}}>{nonNhsHours}</span>
                </p>
              </div>
            </section>

            <section style={{backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '15px', padding: '20px', marginBottom: '20px'}}>
              <h2 style={{color: '#2b8dd3'}}>Leaderboard</h2>
              <Leaderboard />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;