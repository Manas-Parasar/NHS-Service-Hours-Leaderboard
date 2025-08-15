import React from 'react';

const DashboardCard = ({ title, description, children }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-serif text-nhs-blue-dark mb-2 text-center">{title}</h2>
      {description && <p className="text-gray-700 mb-4 text-center font-sans">{description}</p>}
      <div className="font-sans">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;