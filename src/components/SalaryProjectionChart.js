import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SalaryProjectionChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="year" 
          domain={['dataMin', 'dataMax + 1']}
          tick={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}
        />
        <YAxis 
          label={{ 
            value: 'Salary ($k)', 
            angle: -90, 
            position: 'insideLeft',
            style: { fontSize: 'clamp(0.8rem, 2vw, 1rem)' }
          }}
          tick={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          formatter={(val) => `$${(val / 1000).toFixed(1)}k`}
          contentStyle={{
            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
            padding: '10px'
          }}
        />
        <Legend 
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: 'clamp(0.8rem, 2vw, 1rem)'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="expected" 
          name="Expected (CPI Adjusted)" 
          stroke="#82ca9d" 
          strokeWidth={2}
        />
        <Line 
          type="monotone" 
          dataKey="actual" 
          name="Actual (Wage Growth)" 
          stroke="#8884d8" 
          strokeWidth={2}
        />
        <Line 
          type="monotone" 
          dataKey="difference" 
          name="Difference" 
          stroke="#ff4d4d" 
          strokeDasharray="4 4"
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default SalaryProjectionChart; 