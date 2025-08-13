import React from 'react';
import CreatorDashboard from '../dashboards/CreatorDashboard';
import AdvisorDashboard from '../dashboards/AdvisorDashboard';
import OfficerDashboard from '../dashboards/OfficerDashboard';
import MemberDashboard from '../dashboards/MemberDashboard';

const AllDashboardsView = () => {
  return (
    <div>
      <h1>Creator's All Dashboards View</h1>
      <hr />
      <h2>Creator Dashboard</h2>
      <CreatorDashboard />
      <hr />
      <h2>Advisor Dashboard</h2>
      <AdvisorDashboard />
      <hr />
      <h2>Officer Dashboard</h2>
      <OfficerDashboard />
      <hr />
      <h2>Member Dashboard</h2>
      <MemberDashboard />
    </div>
  );
};

export default AllDashboardsView;