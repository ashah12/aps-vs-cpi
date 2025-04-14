import { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Agency data structure
const AGENCIES = {
  'APS': {
    name: 'Australian Public Service',
    data: [
      { year: 2015, wage: 2.5 },
      { year: 2016, wage: 2.0 },
      { year: 2017, wage: 2.2 },
      { year: 2018, wage: 2.4 },
      { year: 2019, wage: 2.3 },
      { year: 2020, wage: 1.5 },
      { year: 2021, wage: 2.1 },
      { year: 2022, wage: 3.5 },
      { year: 2023, wage: 4.0 },
      { year: 2024, wage: 4.0 },
      { year: 2025, wage: 4.0 },
      { year: 2026, wage: 3.4 },
      { year: 2027, wage: 3.2 },
      { year: 2028, wage: 3.0 },
      { year: 2029, wage: 2.8 },
      { year: 2030, wage: 2.8 }
    ]
  },
  'Defence': {
    name: 'Department of Defence',
    data: [
      { year: 2015, wage: 2.7 },
      { year: 2016, wage: 2.2 },
      { year: 2017, wage: 2.4 },
      { year: 2018, wage: 2.6 },
      { year: 2019, wage: 2.5 },
      { year: 2020, wage: 1.7 },
      { year: 2021, wage: 2.3 },
      { year: 2022, wage: 3.7 },
      { year: 2023, wage: 4.2 },
      { year: 2024, wage: 4.2 },
      { year: 2025, wage: 4.2 },
      { year: 2026, wage: 3.6 },
      { year: 2027, wage: 3.4 },
      { year: 2028, wage: 3.2 },
      { year: 2029, wage: 3.0 },
      { year: 2030, wage: 3.0 }
    ]
  },
  'ATO': {
    name: 'Australian Taxation Office',
    data: [
      { year: 2015, wage: 2.3 },
      { year: 2016, wage: 1.8 },
      { year: 2017, wage: 2.0 },
      { year: 2018, wage: 2.2 },
      { year: 2019, wage: 2.1 },
      { year: 2020, wage: 1.3 },
      { year: 2021, wage: 1.9 },
      { year: 2022, wage: 3.3 },
      { year: 2023, wage: 3.8 },
      { year: 2024, wage: 3.8 },
      { year: 2025, wage: 3.8 },
      { year: 2026, wage: 3.2 },
      { year: 2027, wage: 3.0 },
      { year: 2028, wage: 2.8 },
      { year: 2029, wage: 2.6 },
      { year: 2030, wage: 2.6 }
    ]
  }
};

// ABS CPI data for June quarter
const CPIData = {
  2015: 1.5,
  2016: 1.0,
  2017: 1.9,
  2018: 2.1,
  2019: 1.6,
  2020: -0.3,
  2021: 3.8,
  2022: 6.1,
  2023: 6.0,
  2024: 3.5, // Projected
  2025: 2.8, // Projected
  2026: 2.5, // Projected
  2027: 2.5, // Projected
  2028: 2.5, // Projected
  2029: 2.5, // Projected
  2030: 2.5  // Projected
};

export default function App() {
  const [chartType, setChartType] = useState('line');
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2030);
  const [projectionStartYear, setProjectionStartYear] = useState(2015);
  const [selectedAgency, setSelectedAgency] = useState('APS');
  const [yearOptions, setYearOptions] = useState([]);
  const [startingSalary, setStartingSalary] = useState(60000);

  const toggleChart = () => {
    setChartType(prev => (prev === 'line' ? 'bar' : 'line'));
  };

  // Load data on mount and when agency changes
  useEffect(() => {
    const agencyData = AGENCIES[selectedAgency].data;
    setYearOptions(agencyData.map(d => d.year));
  }, [selectedAgency]);

  const filteredData = useMemo(() => {
    const agencyData = AGENCIES[selectedAgency].data;
    return agencyData
      .filter(d => d.year >= startYear && d.year <= endYear)
      .map(d => ({
        ...d,
        cpi: CPIData[d.year] || 0,
        gap: d.wage - (CPIData[d.year] || 0) // Real wage change
      }));
  }, [startYear, endYear, selectedAgency]);

  const salaryProjectionData = useMemo(() => {
    if (!startingSalary || !projectionStartYear) return [];

    let expected = startingSalary;
    let actual = startingSalary;
    const agencyData = AGENCIES[selectedAgency].data;
    const startIndex = agencyData.findIndex(d => d.year === projectionStartYear);
    const currentYear = new Date().getFullYear();

    if (startIndex === -1) return [];

    return agencyData
      .slice(startIndex)
      .filter(d => d.year <= endYear)
      .map((d, idx) => {
        if (idx > 0) {
          expected *= (1 + (CPIData[d.year] || 0) / 100);
          actual *= (1 + d.wage / 100);
        }

        return {
          year: d.year,
          expected: Number(expected.toFixed(2)),
          actual: Number(actual.toFixed(2)),
          difference: Number((actual - expected).toFixed(2)),
          isFuture: d.year > currentYear
        };
      });
  }, [selectedAgency, projectionStartYear, endYear, startingSalary]);

  return (
    <div style={{ 
      width: '100%', 
      padding: '10px',
      maxWidth: '100%',
      margin: '0 auto',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ 
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
        marginBottom: '15px',
        textAlign: 'center',
        padding: '0 10px'
      }}>
        {AGENCIES[selectedAgency].name} Wage Growth vs CPI
      </h2>

      {/* Controls Row */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '15px',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Agency Selector */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          flex: '0 1 auto'
        }}>
          <span style={{ 
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            whiteSpace: 'nowrap'
          }}>Agency:</span>
          <select
            value={selectedAgency}
            onChange={e => setSelectedAgency(e.target.value)}
            style={{ 
              padding: '8px',
              fontSize: 'clamp(1rem, 3vw, 1.2rem)',
              borderRadius: '5px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              minWidth: '200px'
            }}
          >
            {Object.keys(AGENCIES).map(agency => (
              <option key={agency} value={agency}>{AGENCIES[agency].name}</option>
            ))}
          </select>
        </div>

        {/* Year Filters */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          flex: '0 1 auto'
        }}>
          <span style={{ 
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            whiteSpace: 'nowrap'
          }}>Years:</span>
          <div style={{ display: 'flex', gap: '5px' }}>
            <select
              value={startYear}
              onChange={e => setStartYear(Number(e.target.value))}
              style={{
                padding: '8px',
                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                minWidth: '100px'
              }}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <span style={{ 
              fontSize: 'clamp(1rem, 3vw, 1.2rem)',
              display: 'flex',
              alignItems: 'center'
            }}>to</span>
            <select
              value={endYear}
              onChange={e => setEndYear(Number(e.target.value))}
              style={{
                padding: '8px',
                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                minWidth: '100px'
              }}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle Chart Button */}
        <button
          onClick={toggleChart}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1d4ed8',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            minWidth: '120px'
          }}
        >
          Toggle to {chartType === 'line' ? 'Bar' : 'Line'} Chart
        </button>
      </div>

      {/* Main Chart */}
      <div style={{ 
        width: '100%', 
        height: 'clamp(300px, 50vh, 500px)',
        marginBottom: '20px',
        padding: '0 10px',
        boxSizing: 'border-box'
      }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={filteredData} margin={{ top: 20, right: 10, left: 20, bottom: 20 }}>
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
                formatter={(val) => `${val.toFixed(2)}%`}
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
              <Line type="monotone" dataKey="cpi" name="CPI" stroke="#82ca9d" />
              <Line type="monotone" dataKey="gap" name="Real Wage Change" stroke="#ff7300" strokeDasharray="5 5" />
            </LineChart>
          ) : (
            <BarChart data={filteredData} margin={{ top: 20, right: 10, left: 20, bottom: 20 }}>
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
                formatter={(val) => `${val.toFixed(2)}%`}
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
              />
              <Bar 
                dataKey="gap" 
                name="Real Wage Change" 
                fill="#ff7300" 
                barSize={30}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Salary Projection */}
      <div style={{ 
        marginTop: '20px',
        borderTop: '1px solid #ccc',
        paddingTop: '15px',
        padding: '0 10px'
      }}>
        <h2 style={{ 
          fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          Salary Projection
        </h2>

        {/* Projection Controls */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '15px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            flex: '0 1 auto'
          }}>
            <span style={{ 
              fontSize: 'clamp(1rem, 3vw, 1.2rem)',
              whiteSpace: 'nowrap'
            }}>Projection Year:</span>
            <select 
              value={projectionStartYear}
              onChange={(e) => setProjectionStartYear(Number(e.target.value))}
              style={{
                padding: '8px',
                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                minWidth: '100px'
              }}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            flex: '0 1 auto'
          }}>
            <span style={{ 
              fontSize: 'clamp(1rem, 3vw, 1.2rem)',
              whiteSpace: 'nowrap'
            }}>Starting Salary:</span>
            <input 
              type="number"
              value={startingSalary}
              onChange={(e) => setStartingSalary(Number(e.target.value))}
              style={{
                padding: '8px',
                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                minWidth: '150px'
              }}
            />
          </div>
        </div>

        <div style={{ 
          width: '100%', 
          height: 'clamp(300px, 50vh, 500px)',
          marginBottom: '40px'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salaryProjectionData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
