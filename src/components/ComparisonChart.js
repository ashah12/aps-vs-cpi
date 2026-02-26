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
import { COMPARISON_COLORS, CPI_COLOR } from '../data/agency-metadata';

const ComparisonChart = ({ data, agencies, agencyNames }) => {
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
            value: 'Wage Growth (%)',
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
          formatter={(val, name) => [`${val.toFixed(2)}%`, name]}
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
        {/* CPI reference line */}
        <Line
          type="monotone"
          dataKey="cpi"
          name="CPI"
          stroke={CPI_COLOR}
          strokeWidth={2}
          strokeDasharray="5 5"
        />
        {/* One line per compared agency */}
        {agencies.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={agencyNames[key] || key}
            stroke={COMPARISON_COLORS[i % COMPARISON_COLORS.length]}
            strokeWidth={2}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default ComparisonChart;
