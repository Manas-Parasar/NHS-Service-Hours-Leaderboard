import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Officer Dashboard</h1>
        <p className="text-gray-600 mb-6">Role: {role}</p>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Volunteer Hours</h2>
            <p className="text-4xl font-bold text-blue-600">{totalHours}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Filter by Month:
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Months</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Search by Event Name:
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Event name..."
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              View Member:
              <select
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Request Advisor Power</h2>
          <button
            onClick={handleRequestAdvisorPower}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
          >
            Request Advisor Power
          </button>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Activities</h2>
          <ul className="divide-y divide-gray-200">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, idx) => (
                <li key={idx} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-900">{event.name}</p>
                    <p className="text-sm text-gray-500">{event.date ? new Date(event.date).toLocaleDateString() : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-md font-semibold text-blue-600">{event.hours} hours</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {event.tag}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No activities found.</p>
            )}
          </ul>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Hours Breakdown</h2>
            <h3 className="text-xl font-medium text-gray-700 mb-2">By Tag</h3>
            <ul className="divide-y divide-gray-200">
              {Object.entries(hoursByTag).map(([tag, hours]) => (
                <li key={tag} className="py-2 flex justify-between items-center text-gray-700">
                  <span>{tag}:</span>
                  <span className="font-semibold">{hours} hours</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">NHS vs. Non-NHS Hours</h2>
            <div className="space-y-2">
              <p className="text-gray-700">NHS Hours: <span className="font-semibold text-blue-600">{nhsHours}</span></p>
              <p className="text-gray-700">Non-NHS Hours: <span className="font-semibold text-gray-600">{nonNhsHours}</span></p>
            </div>
          </div>
        </section>

        <Leaderboard />
      </div>
    </div>
  );
};

export default OfficerDashboard;