import { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function App() {
  const [chartType, setChartType] = useState('line');
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2026);
  const [projectionStartYear, setProjectionStartYear] = useState(2015);
  const [customData, setCustomData] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [startingSalary, setStartingSalary] = useState(60000);

  const toggleChart = () => {
    setChartType(prev => (prev === 'line' ? 'bar' : 'line'));
  };

  // Load mock data on mount
  useEffect(() => {
    const mockData = [
      { year: 2015, wage: 2.5, cpi: 1.5 },
      { year: 2016, wage: 2.0, cpi: 1.3 },
      { year: 2017, wage: 2.2, cpi: 1.9 },
      { year: 2018, wage: 2.4, cpi: 2.1 },
      { year: 2019, wage: 2.3, cpi: 1.8 },
      { year: 2020, wage: 1.5, cpi: 0.9 },
      { year: 2021, wage: 2.1, cpi: 3.0 },
      { year: 2022, wage: 3.5, cpi: 6.8 },
      { year: 2023, wage: 4.0, cpi: 7.1 },
      { year: 2024, wage: 4.0, cpi: 7.1 },
      { year: 2025, wage: 4.0, cpi: 7.1 },
      { year: 2026, wage: 3.4, cpi: 7.1 },
    ];

    setCustomData(mockData);
    setYearOptions(mockData.map(d => d.year));
  }, []);

  const filteredData = useMemo(() => {
    return customData
      .filter(d => d.year >= startYear && d.year <= endYear)
      .map(d => ({
        ...d,
        gap: d.wage - d.cpi // Real wage change
      }));
  }, [startYear, endYear, customData]);

  const salaryProjectionData = useMemo(() => {
    if (!startingSalary || !projectionStartYear) return [];

    let expected = startingSalary;
    let actual = startingSalary;
    const startIndex = customData.findIndex(d => d.year === projectionStartYear);

    if (startIndex === -1) return [];

    return customData
      .slice(startIndex)
      .filter(d => d.year <= endYear)
      .map((d, idx) => {
        if (idx > 0) {
          expected *= (1 + d.cpi / 100);
          actual *= (1 + d.wage / 100);
        }

        return {
          year: d.year,
          expected: Number(expected.toFixed(2)),
          actual: Number(actual.toFixed(2)),
          difference: Number((actual - expected).toFixed(2)),
        };
      });
  }, [customData, projectionStartYear, endYear, startingSalary]);

  return (
    <div style={{ width: '100%', padding: 20, overflowX: 'hidden' }}>
      <h2>ABS Wage Growth vs CPI</h2>

      {/* Toggle Chart Button */}
      <button
        onClick={toggleChart}
        style={{
          marginBottom: 20,
          padding: '8px 16px',
          backgroundColor: '#1d4ed8',
          color: '#fff',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer'
        }}
      >
        Toggle to {chartType === 'line' ? 'Bar' : 'Line'} Chart
      </button>

      {/* Year Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <label>
          Start Year:
          <select
            value={startYear}
            onChange={e => setStartYear(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
        <label>
          End Year:
          <select
            value={endYear}
            onChange={e => setEndYear(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Main Chart */}
      <div style={{ width: '100%', height: 400, maxWidth: '100%', overflowX: 'hidden' }}>
        <ResponsiveContainer width="90%" height="90%">
          {chartType === 'line' ? (
            <LineChart data={filteredData} margin={{ right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" domain={['dataMin', 'dataMax + 1']} />
              <YAxis 
                label={{ 
                  value: 'Percentage Difference (%)', 
                  angle: -90, 
                  position: 'centre',
                  dx: -5
                }} 
              />
              <Tooltip formatter={(val) => `${val.toFixed(2)}%`} />
              <Legend />
              <Line type="monotone" dataKey="wage" name="Wage Growth" stroke="#8884d8" />
              <Line type="monotone" dataKey="cpi" name="CPI" stroke="#82ca9d" />
              <Line type="monotone" dataKey="gap" name="Real Wage Change" stroke="#ff7300" strokeDasharray="5 5" />
            </LineChart>
          ) : (
            <BarChart data={filteredData} margin={{ right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" domain={['dataMin', 'dataMax + 1']} />
              <YAxis 
                label={{ 
                  value: 'Percentage Difference (%)', 
                  angle: -90, 
                  position: 'centre',
                  dx: -5
                }} 
              />
              <Tooltip formatter={(val) => `${val.toFixed(2)}%`} />
              <Legend />
              <Bar dataKey="wage" name="Wage Growth" fill="#8884d8" />
              <Bar dataKey="cpi" name="CPI" fill="#82ca9d" />
              <Bar dataKey="gap" name="Real Wage Change" fill="#ff7300" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Salary Projection */}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Salary Projection</h2>

        <div className="flex flex-wrap gap-4 items-center mb-6">
          <label className="flex items-center gap-2">
            <span>Starting Year for Projection:</span>
            <select 
              value={projectionStartYear}
              onChange={(e) => setProjectionStartYear(Number(e.target.value))}
              className="px-4 py-2 border rounded"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span>Starting Salary ($):</span>
            <input 
              type="number"
              value={startingSalary}
              onChange={(e) => setStartingSalary(Number(e.target.value))}
              className="px-4 py-2 border rounded"
            />
          </label>
        </div>

        <div style={{ height: 400, maxWidth: '100%', overflowX: 'hidden', marginTop: '1rem' }}>
          <ResponsiveContainer width="90%" height="90%">
            <LineChart data={salaryProjectionData} margin={{ right: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" domain={['dataMin', 'dataMax + 1']} />
              <YAxis 
                label={{ 
                  value: 'Salary ($)', 
                  angle: -90, 
                  position: 'insideLeft',
                  dx: -5
                }}
                width={80}
                ticks={Array.from({length: 20}, (_, i) => -50000 + (i * 10000))}
                tickFormatter={(value) => `${value/1000}k`}
              />
              <Tooltip formatter={(val) => `$${val.toFixed(2)}`} />
              <Legend />
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
