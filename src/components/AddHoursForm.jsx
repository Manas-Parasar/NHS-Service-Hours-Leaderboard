import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";

const AddHoursForm = ({ onHoursAdded }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [hours, setHours] = useState("");
  const [tag, setTag] = useState("NHS"); // Default to NHS
  const [eventName, setEventName] = useState("");
  const [eventMonth, setEventMonth] = useState((new Date().getMonth() + 1).toString());
  const [eventYear, setEventYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setUsers(usersData);
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser || !hours || !eventName || !eventMonth || !eventYear) {
      alert("Please fill in all fields.");
      return;
    }

    const hoursToAdd = parseInt(hours);
    if (isNaN(hoursToAdd) || hoursToAdd <= 0) {
      alert("Please enter a valid number of hours.");
      return;
    }

    const year = parseInt(eventYear);
    const month = parseInt(eventMonth);
    if (isNaN(year) || year < 2000 || isNaN(month) || month < 1 || month > 12) {
      alert("Please enter a valid month and year.");
      return;
    }

    const eventDate = `${year}-${month.toString().padStart(2, '0')}-01`; // Default day to 01

    try {
      // Add event to events collection
      await addDoc(collection(db, "events"), {
        userId: selectedUser,
        hours: hoursToAdd,
        tag: tag,
        name: eventName,
        date: eventDate,
      });

      // Update user's total hours
      const userRef = doc(db, "users", selectedUser);
      const userDocSnap = await getDocs(userRef);
      const currentHours = userDocSnap.data().hours || 0;
      await updateDoc(userRef, { hours: currentHours + hoursToAdd });

      alert("Hours added successfully!");
      setSelectedUser("");
      setHours("");
      setEventName("");
      setTag("NHS");
      setEventMonth((new Date().getMonth() + 1).toString());
      setEventYear(new Date().getFullYear().toString());
      if (onHoursAdded) onHoursAdded(); // Callback to refresh parent components
    } catch (error) {
      console.error("Error adding hours: ", error);
      alert("Failed to add hours.");
    }
  };

  return (
    <div className="add-hours-form mt-8">
      <h3 className="text-xl font-semibold mb-2">Add Volunteer Hours</h3>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userSelect">
            Select User:
          </label>
          <select
            id="userSelect"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">-- Select a user --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hoursInput">
            Hours:
          </label>
          <input
            type="number"
            id="hoursInput"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., 5"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tagSelect">
            Tag:
          </label>
          <select
            id="tagSelect"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="NHS">NHS</option>
            <option value="Non-NHS">Non-NHS</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Event Date:</label>
          <div className="flex space-x-2">
            <select
              value={eventMonth}
              onChange={(e) => setEventMonth(e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {[...Array(12).keys()].map((i) => (
                <option key={i + 1} value={(i + 1).toString()}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={eventYear}
              onChange={(e) => setEventYear(e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-24"
              placeholder="Year"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventNameInput">
            Event Name:
          </label>
          <input
            type="text"
            id="eventNameInput"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., School Cleanup"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Hours
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHoursForm;