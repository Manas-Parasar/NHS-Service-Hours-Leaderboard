import React from "react";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import RoleRouter from "./RoleRouter";
import Login from "../pages/Login";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "./ProtectedRoute";
import { useUser } from "../context/UserContext";

const MainContent = () => {
  const location = useLocation();
  const { user } = useUser();

  return (
    <>
      {location.pathname !== "/login" && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <RoleRouter />
            </ProtectedRoute>
          }
        />
        {!user && <Route path="*" element={<Navigate to="/login" />} />}
      </Routes>
    </>
  );
};

export default MainContent;