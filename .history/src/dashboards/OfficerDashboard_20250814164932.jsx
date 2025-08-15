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

  // Viewing other members
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(user?.uid);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setAllUsers(usersData);
    };
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (!selectedMemberId) return;
    const fetchEvents = async () => {
      const q = query(collection(db, "events"), where("userId", "==", selectedMemberId));
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

  const filteredEvents = events.filter(e => {
    const monthMatch = selectedMonth ? new Date(e.date).getMonth() + 1 === Number(selectedMonth) : true;
    const searchMatch = searchTerm ? e.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return monthMatch && searchMatch;
  });

  const hoursByTag = filteredEvents.reduce((acc, event) => {
    acc[event.tag] = (acc[event.tag] || 0) + (event.hours || 0);
    return acc;
  }, {});

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
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">Officer Dashboard</h1>
        <p className="text-gray-600 mb-6">Role: {role}</p>

        {/* Filters & Total Hours */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transform hover:scale-105 transition duration-300">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Total Volunteer Hours</h2>
            <p className="text-5xl font-bold text-blue-600">{totalHours}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Filter by Month:
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Months</option>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </label>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Search by Event:
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type event name..."
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              View Member:
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Request Advisor Power */}
        <section className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Request Advisor Power</h2>
          <button
            onClick={handleRequestAdvisorPower}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-md transition duration-300"
          >
            Request Advisor Power
          </button>
        </section>

        {/* Activities */}
        <section className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Activities</h2>
          <ul className="divide-y divide-gray-200">
            {filteredEvents.length > 0 ? filteredEvents.map((event, idx) => (
              <li key={idx} className="py-4 flex justify-between items-center hover:bg-blue-50 transition rounded-lg px-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{event.name}</p>
                  <p className="text-sm text-gray-500">{event.date ? new Date(event.date).toLocaleDateString() : ""}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-md font-bold text-blue-600">{event.hours} hours</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">{event.tag}</span>
                </div>
              </li>
            )) : <p className="text-gray-500">No activities found.</p>}
          </ul>
        </section>

        {/* Hours Breakdown */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Hours Breakdown</h2>
            <ul className="divide-y divide-gray-200">
              {Object.entries(hoursByTag).map(([tag, hours]) => (
                <li key={tag} className="py-2 flex justify-between items-center text-gray-700">
                  <span className="font-medium">{tag}</span>
                  <span className="font-bold text-blue-600">{hours} hrs</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">NHS vs. Non-NHS Hours</h2>
            <div className="space-y-3">
              <p className="text-gray-700 font-medium">
                NHS Hours: <span className="text-blue-600 font-bold">{nhsHours}</span>
              </p>
              <p className="text-gray-700 font-medium">
                Non-NHS Hours: <span className="text-gray-600 font-bold">{nonNhsHours}</span>
              </p>
            </div>
          </div>
        </section>

        <Leaderboard />
      </div>
    </div>
  );
};

export default OfficerDashboard;