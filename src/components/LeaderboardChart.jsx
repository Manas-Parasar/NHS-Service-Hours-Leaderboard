import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';

const COLORS = ['#e63946', '#f77f00', '#fcbf49', '#2b8dd3', '#457b9d', '#1d3557', '#2a9d8f', '#264653'];

const LeaderboardChart = ({ leaderboardData, hourType = "all" }) => {
  const dataKey = hourType === "nhs" ? "nhsHours" : hourType === "nonNhs" ? "nonNhsHours" : "totalHours";

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, leaderboardData.length * 50)}>
      <BarChart
        data={leaderboardData}
        layout="vertical"
        margin={{
          top: 5,
          right: 60,
          left: 80,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fontWeight: 'bold' }} />
        <Tooltip formatter={(value) => [`${value} hours`, hourType === "nhs" ? "NHS Hours" : hourType === "nonNhs" ? "Non-NHS Hours" : "Total Hours"]} />
        <Legend />
        <Bar dataKey={dataKey} name={hourType === "nhs" ? "NHS Hours" : hourType === "nonNhs" ? "Non-NHS Hours" : "Total Hours"} radius={[0, 4, 4, 0]}>
          {leaderboardData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
          <LabelList
            dataKey={dataKey}
            position="right"
            style={{ fill: '#333', fontSize: 12, fontWeight: 'bold' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LeaderboardChart;
