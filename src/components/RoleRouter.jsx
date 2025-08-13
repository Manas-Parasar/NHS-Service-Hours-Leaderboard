import React from "react";
import { useUser } from "../context/UserContext";
import CreatorDashboard from "../dashboards/CreatorDashboard";
import AdvisorDashboard from "../dashboards/AdvisorDashboard";
import OfficerDashboard from "../dashboards/OfficerDashboard";
import MemberDashboard from "../dashboards/MemberDashboard";


const RoleRouter = () => {
  const { user, role, loading } = useUser();

  if (loading) return null;

  if (!user || !role) {
    // Optionally redirect or render nothing
    return null;
  }

  switch (role) {
    case "creator":
      return <CreatorDashboard />;
    case "advisor":
      return <AdvisorDashboard />;
    case "officer":
      return <OfficerDashboard />;
    case "member":
      return <MemberDashboard />;
    default:
      return <div>Unknown role</div>;
  }
};

export default RoleRouter;