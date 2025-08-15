import React, { useState } from "react";
import AdvisorDashboard from "./AdvisorDashboard";
import OfficerDashboard from "./OfficerDashboard";
import MemberDashboard from "./MemberDashboard";
import Leaderboard from "../components/Leaderboard";
import DashboardCard from "../components/DashboardCard"; // Import DashboardCard
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
          <DashboardCard title="Creator Dashboard">
            <p className="text-gray-700 mb-2 text-center">Welcome, {user?.name}! Your role is: {role}</p>
            <p className="text-gray-700 mb-6 text-center">Use the buttons above to view the different dashboards.</p>
            <Leaderboard />
          </DashboardCard>
        );
    }
  };

  return (
    <div className="min-h-screen bg-nhs-blue-light py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-serif text-nhs-blue-dark mb-2">Creator Dashboard</h1>
          <p className="text-gray-700 font-medium text-lg">Role: {role}</p>
        </header>

        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setView("main")}
            className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ease-in-out ${view === "main" ? "bg-nhs-blue-dark text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Creator
          </button>
          <button
            onClick={() => setView("advisor")}
            className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ease-in-out ${view === "advisor" ? "bg-nhs-blue-dark text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            View Advisor Dashboard
          </button>
          <button
            onClick={() => setView("officer")}
            className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ease-in-out ${view === "officer" ? "bg-nhs-blue-dark text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            View Officer Dashboard
          </button>
          <button
            onClick={() => setView("member")}
            className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ease-in-out ${view === "member" ? "bg-nhs-blue-dark text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
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