import React from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "./context/UserContext";
import Login from "./pages/Login";
import CreatorDashboard from "./dashboards/CreatorDashboard";
import AdvisorDashboard from "./dashboards/AdvisorDashboard";
import OfficerDashboard from "./dashboards/OfficerDashboard";
import MemberDashboard from "./dashboards/MemberDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Navbar />
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}

function AppRoutes() {
  const { user, role, loading } = useUser();

  if (loading) {
    return <div>Loading application...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Redirect from root to login if not authenticated */}
      <Route path="/" element={user ? <Navigate to={`/${role}`} /> : <Navigate to="/login" />} />

      {/* Protected Routes for Dashboards */}
      <Route
        path="/creator"
        element={
          <ProtectedRoute role="creator">
            <CreatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advisor"
        element={
          <ProtectedRoute role="advisor">
            <AdvisorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer"
        element={
          <ProtectedRoute role="officer">
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member"
        element={
          <ProtectedRoute role="member">
            <MemberDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback for unknown routes */}
      <Route path="*" element={user ? <Navigate to={`/${role}`} /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;