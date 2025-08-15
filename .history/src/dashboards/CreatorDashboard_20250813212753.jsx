import React, { useState } from "react";
import AdvisorDashboard from "./AdvisorDashboard";
import OfficerDashboard from "./OfficerDashboard";
import MemberDashboard from "./MemberDashboard";
import Leaderboard from "../components/Leaderboard";
import { useUser } from "../context/UserContext";

const CreatorDashboard = () => {
  const { user, role } = useUser();
  const [view, setView] = useState("main");

  const renderView = () => {
    switch (view) {
      case "advisor":
        return <AdvisorDashboard />;
      case "officer":
        return <OfficerDashboard />;
      case "member":
        return <MemberDashboard />;
      default:
        return (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Creator Dashboard</h2>
            <p className="text-gray-600 mb-2">Welcome, {user?.name}! Your role is: {role}</p>
            <p className="text-gray-600 mb-6">Use the buttons above to view the different dashboards.</p>
            <Leaderboard />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setView("main")}
            className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ease-in-out ${view === "main" ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Creator
          </button>
          <button
            onClick={() => setView("advisor")}
            className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ease-in-out ${view === "advisor" ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            View Advisor Dashboard
          </button>
          <button
            onClick={() => setView("officer")}
            className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ease-in-out ${view === "officer" ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            View Officer Dashboard
          </button>
          <button
            onClick={() => setView("member")}
            className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ease-in-out ${view === "member" ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            View Member Dashboard
          </button>
        </div>
        <div>{renderView()}</div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
