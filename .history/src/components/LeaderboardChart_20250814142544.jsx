import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LeaderboardChart = ({ leaderboardData }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={leaderboardData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="hours" fill="#4febd4ff" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LeaderboardChart;
