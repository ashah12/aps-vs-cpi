import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const BarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data} margin={{ top: 20, right: 10, left: 20, bottom: 20 }}>
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
        <Bar 
          dataKey="wage" 
          name="Wage Growth" 
          fill="#8884d8" 
          barSize={30}
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="cpi" 
          name="CPI" 
          fill="#82ca9d" 
          barSize={30}
          radius={[4, 4, 0, 0]}
          fillOpacity={d => d.isProjected ? 0.5 : 1}
        />
        <Bar 
          dataKey="gap" 
          name="Real Wage Change" 
          fill="#ff7300" 
          barSize={30}
          radius={[4, 4, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart; 