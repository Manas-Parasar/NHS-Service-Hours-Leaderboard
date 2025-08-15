import React, { useState } from "react";
import AdvisorDashboard from "./AdvisorDashboard";
import OfficerDashboard from "./OfficerDashboard";
import MemberDashboard from "./MemberDashboard";
import Leaderboard from "../components/Leaderboard";
import DashboardCard from "../components/DashboardCard";

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
    <div style={{backgroundColor: '#e0f2f7', color: '#555'}}>
      <div>
        <h1 style={{marginTop: 0, color: '#2b8dd3', fontFamily: "'Cinzel', serif", fontWeight: 'bold'}}>Creator Dashboard</h1>
        <p style={{color: '#555'}}>Role: {role}</p>

        <div style={{display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px'}}>
          <button
            onClick={() => setView("main")}
            style={{backgroundColor: view === "main" ? '#2b8dd3' : '#ccc', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer'}}
          >
            Creator
          </button>
          <button
            onClick={() => setView("advisor")}
            style={{backgroundColor: view === "advisor" ? '#2b8dd3' : '#ccc', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer'}}
          >
            View Advisor Dashboard
          </button>
          <button
            onClick={() => setView("officer")}
            style={{backgroundColor: view === "officer" ? '#2b8dd3' : '#ccc', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer'}}
          >
            View Officer Dashboard
          </button>
          <button
            onClick={() => setView("member")}
            style={{backgroundColor: view === "member" ? '#2b8dd3' : '#ccc', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer'}}
          >
            View Member Dashboard
          </button>
        </div>
        {view === "main" ? (
          <div style={{display: 'flex'}}>
            <div style={{backgroundColor: 'white', border: '1px solid #ccc', flex: '1', margin: '20px', borderRadius: '15px', padding: '20px'}}>
              <h2 style={{color: '#2b8dd3', fontSize: '1.75rem', textAlign: 'center'}}>Creator Dashboard Overview</h2>
              <p style={{color: '#555', textAlign: 'center'}}>Welcome, {user?.name}! Your role is: {role}</p>
              <p style={{color: '#555', textAlign: 'center'}}>Use the buttons above to view the different dashboards.</p>
              <Leaderboard />
            </div>
            <div style={{flex: '1', margin: '20px'}}>
              {/* Additional sections for Creator Dashboard can go here */}
            </div>
          </div>
        ) : (
          renderView()
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;