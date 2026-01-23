import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

function LanguageChart({ languages }) {
  const data = Object.entries(languages).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#fa709a',
    '#fee140',
    '#30cfd0',
    '#c471ed',
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default LanguageChart;