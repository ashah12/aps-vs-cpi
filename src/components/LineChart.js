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

const LineChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 20, right: 10, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="year" 
          domain={['dataMin', 'dataMax + 1']}
          tick={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}
        />
        <YAxis 
          label={{ 
            value: 'Percentage Difference (%)', 
            angle: -90, 
            position: 'insideLeft',
            offset: 5,
            style: { 
              fontSize: 'clamp(0.8rem, 2vw, 1rem)',
              textAnchor: 'middle'
            }
          }}
          tick={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}
          width={40}
        />
        <Tooltip 
          formatter={(val, name, props) => {
            const isProjected = props.payload.isProjected;
            return [`${val.toFixed(2)}%${isProjected ? ' (Projected)' : ''}`, name];
          }}
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
        <Line type="monotone" dataKey="wage" name="Wage Growth" stroke="#8884d8" />
        <Line 
          type="monotone" 
          dataKey="cpi" 
          name="CPI" 
          stroke="#82ca9d"
          strokeDasharray={d => d.isProjected ? "5 5" : "0"}
        />
        <Line type="monotone" dataKey="gap" name="Real Wage Change" stroke="#ff7300" strokeDasharray="5 5" />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart; 