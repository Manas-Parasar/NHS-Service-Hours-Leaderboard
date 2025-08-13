import React from "react";
import Navbar from "./components/Navbar";
import RoleRouter from "./components/RoleRouter";
import { UserProvider, useUser } from "./context/UserContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading application...</div>; // Or a loading spinner
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Navbar />
              <RoleRouter />
            </ProtectedRoute>
          }
        />
        {/* Redirect to login if not authenticated and trying to access a protected route */}
        {!user && <Route path="*" element={<Navigate to="/login" />} />}
      </Routes>
    </BrowserRouter>
  );
}

export default App;