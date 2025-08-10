import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ children, role }) => {
  const { userData, loading } = useContext(UserContext);

  if (loading) return <div>Loading...</div>;

  if (!userData) return <Navigate to="/" />;

  if (role && userData.role !== role) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;