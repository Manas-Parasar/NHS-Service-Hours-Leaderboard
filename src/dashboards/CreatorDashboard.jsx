import React, { useState } from "react";
import AdvisorDashboard from "./AdvisorDashboard";
import OfficerDashboard from "./OfficerDashboard";
import MemberDashboard from "./MemberDashboard";
import Leaderboard from "../components/Leaderboard";

const CreatorDashboard = () => {
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
          <div>
            <h2 className="text-2xl font-bold mb-4">Creator Dashboard</h2>
            <p>Welcome, Creator! Use the buttons above to view the different dashboards.</p>
            <Leaderboard />
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-center space-x-4 mb-4">
        <button onClick={() => setView("main")} className="px-4 py-2 bg-gray-200 rounded">
          Creator
        </button>
        <button onClick={() => setView("advisor")} className="px-4 py-2 bg-blue-500 text-white rounded">
          View Advisor Dashboard
        </button>
        <button onClick={() => setView("officer")} className="px-4 py-2 bg-green-500 text-white rounded">
          View Officer Dashboard
        </button>
        <button onClick={() => setView("member")} className="px-4 py-2 bg-purple-500 text-white rounded">
          View Member Dashboard
        </button>
      </div>
      <div>{renderView()}</div>
    </div>
  );
};

export default CreatorDashboard;