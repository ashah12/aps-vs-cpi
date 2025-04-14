import { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Agency-specific salary data
const SALARY_DATA = {
  'APS': { // APSC salary data
    'APS1': {
      'Step 1': 51963,
      'Step 2': 53278,
      'Step 3': 54603
    },
    'APS2': {
      'Step 1': 56273,
      'Step 2': 57739,
      'Step 3': 59216
    },
    'APS3': {
      'Step 1': 61156,
      'Step 2': 62750,
      'Step 3': 64352
    },
    'APS4': {
      'Step 1': 66693,
      'Step 2': 68416,
      'Step 3': 70149
    },
    'APS5': {
      'Step 1': 72908,
      'Step 2': 74778,
      'Step 3': 76660
    },
    'APS6': {
      'Step 1': 81115,
      'Step 2': 83180,
      'Step 3': 85260
    },
    'EL1': {
      'Step 1': 99465,
      'Step 2': 103641,
      'Step 3': 109301
    },
    'EL2': {
      'Step 1': 125133,
      'Step 2': 131393,
      'Step 3': 137661
    }
  },
  'Defence': { // Defence salary data (slightly higher than APS)
    'APS1': {
      'Step 1': 53522,
      'Step 2': 54876,
      'Step 3': 56241
    },
    'APS2': {
      'Step 1': 57961,
      'Step 2': 59471,
      'Step 3': 60992
    },
    'APS3': {
      'Step 1': 62991,
      'Step 2': 64633,
      'Step 3': 66283
    },
    'APS4': {
      'Step 1': 68694,
      'Step 2': 70468,
      'Step 3': 72253
    },
    'APS5': {
      'Step 1': 75095,
      'Step 2': 77021,
      'Step 3': 78960
    },
    'APS6': {
      'Step 1': 83548,
      'Step 2': 85675,
      'Step 3': 87818
    },
    'EL1': {
      'Step 1': 102449,
      'Step 2': 106750,
      'Step 3': 112580
    },
    'EL2': {
      'Step 1': 128887,
      'Step 2': 135335,
      'Step 3': 141791
    }
  },
  'ATO': { // ATO salary data
    'APS1': {
      'Step 1': 52223,
      'Step 2': 53547,
      'Step 3': 54882
    },
    'APS2': {
      'Step 1': 56554,
      'Step 2': 58032,
      'Step 3': 59520
    },
    'APS3': {
      'Step 1': 61461,
      'Step 2': 63066,
      'Step 3': 64680
    },
    'APS4': {
      'Step 1': 67026,
      'Step 2': 68758,
      'Step 3': 70500
    },
    'APS5': {
      'Step 1': 73273,
      'Step 2': 75149,
      'Step 3': 77043
    },
    'APS6': {
      'Step 1': 81520,
      'Step 2': 83596,
      'Step 3': 85687
    },
    'EL1': {
      'Step 1': 99962,
      'Step 2': 104158,
      'Step 3': 109848
    },
    'EL2': {
      'Step 1': 125759,
      'Step 2': 132050,
      'Step 3': 138349
    }
  }
};

// Agency data structure with actual wage increases
const AGENCIES = {
  'APS': {
    name: 'Australian Public Service Commission',
    data: [
      { year: 2015, wage: 1.5 }, // 2014-17 EA
      { year: 2016, wage: 2.0 }, // 2014-17 EA
      { year: 2017, wage: 2.0 }, // 2014-17 EA
      { year: 2018, wage: 2.0 }, // 2017-20 EA
      { year: 2019, wage: 2.0 }, // 2017-20 EA
      { year: 2020, wage: 2.0 }, // 2017-20 EA
      { year: 2021, wage: 1.5 }, // 2020-23 EA
      { year: 2022, wage: 3.0 }, // 2020-23 EA
      { year: 2023, wage: 3.0 }, // 2020-23 EA
      { year: 2024, wage: 4.0 }, // 2024-25 EA
      { year: 2025, wage: 3.8 }, // 2024-25 EA
      { year: 2026, wage: 3.4 }, // Projected
      { year: 2027, wage: 3.2 }, // Projected
      { year: 2028, wage: 3.0 }, // Projected
      { year: 2029, wage: 2.8 }, // Projected
      { year: 2030, wage: 2.8 }  // Projected
    ]
  },
  'Defence': {
    name: 'Department of Defence',
    data: [
      { year: 2015, wage: 1.5 }, // 2014-17 EA
      { year: 2016, wage: 2.0 }, // 2014-17 EA
      { year: 2017, wage: 2.0 }, // 2014-17 EA
      { year: 2018, wage: 2.0 }, // 2017-20 EA
      { year: 2019, wage: 2.0 }, // 2017-20 EA
      { year: 2020, wage: 2.0 }, // 2017-20 EA
      { year: 2021, wage: 1.5 }, // 2020-23 EA
      { year: 2022, wage: 3.0 }, // 2020-23 EA
      { year: 2023, wage: 3.0 }, // 2020-23 EA
      { year: 2024, wage: 4.2 }, // 2024-25 EA
      { year: 2025, wage: 4.0 }, // 2024-25 EA
      { year: 2026, wage: 3.6 }, // Projected
      { year: 2027, wage: 3.4 }, // Projected
      { year: 2028, wage: 3.2 }, // Projected
      { year: 2029, wage: 3.0 }, // Projected
      { year: 2030, wage: 3.0 }  // Projected
    ]
  },
  'ATO': {
    name: 'Australian Taxation Office',
    data: [
      { year: 2015, wage: 1.5 }, // 2014-17 EA
      { year: 2016, wage: 2.0 }, // 2014-17 EA
      { year: 2017, wage: 2.0 }, // 2014-17 EA
      { year: 2018, wage: 2.0 }, // 2017-20 EA
      { year: 2019, wage: 2.0 }, // 2017-20 EA
      { year: 2020, wage: 2.0 }, // 2017-20 EA
      { year: 2021, wage: 1.5 }, // 2020-23 EA
      { year: 2022, wage: 3.0 }, // 2020-23 EA
      { year: 2023, wage: 3.0 }, // 2020-23 EA
      { year: 2024, wage: 3.8 }, // 2024-25 EA
      { year: 2025, wage: 3.6 }, // 2024-25 EA
      { year: 2026, wage: 3.2 }, // Projected
      { year: 2027, wage: 3.0 }, // Projected
      { year: 2028, wage: 2.8 }, // Projected
      { year: 2029, wage: 2.6 }, // Projected
      { year: 2030, wage: 2.6 }  // Projected
    ]
  }
};

// ABS CPI data for June quarter
const CPIData = {
  2015: { value: 1.5, isProjected: false },
  2016: { value: 1.0, isProjected: false },
  2017: { value: 1.9, isProjected: false },
  2018: { value: 2.1, isProjected: false },
  2019: { value: 1.6, isProjected: false },
  2020: { value: -0.3, isProjected: false },
  2021: { value: 3.8, isProjected: false },
  2022: { value: 6.1, isProjected: false },
  2023: { value: 6.0, isProjected: false },
  2024: { value: 3.8, isProjected: false },
  2025: { value: 2.8, isProjected: true },
  2026: { value: 2.5, isProjected: true },
  2027: { value: 2.5, isProjected: true },
  2028: { value: 2.5, isProjected: true },
  2029: { value: 2.5, isProjected: true },
  2030: { value: 2.5, isProjected: true }
};

export default function App() {
  const [chartType, setChartType] = useState('line');
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2030);
  const [projectionStartYear, setProjectionStartYear] = useState(2015);
  const [selectedAgency, setSelectedAgency] = useState('APS');
  const [yearOptions, setYearOptions] = useState([]);
  const [startingSalary, setStartingSalary] = useState(60000);
  const [selectedAPSLevel, setSelectedAPSLevel] = useState('');
  const [selectedAPSStep, setSelectedAPSStep] = useState('');

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
        cpi: CPIData[d.year]?.value || 0,
        isProjected: CPIData[d.year]?.isProjected || false,
        gap: d.wage - (CPIData[d.year]?.value || 0) // Real wage change
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
          expected *= (1 + (CPIData[d.year]?.value || 0) / 100);
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

  // Reset APS level when agency changes
  useEffect(() => {
    setSelectedAPSLevel('');
    setSelectedAPSStep('');
  }, [selectedAgency]);

  // Handle APS level change
  const handleAPSLevelChange = (e) => {
    const level = e.target.value;
    setSelectedAPSLevel(level);
    
    if (level && SALARY_DATA[selectedAgency][level]) {
      // Default to first step when level changes
      const firstStep = Object.keys(SALARY_DATA[selectedAgency][level])[0];
      setSelectedAPSStep(firstStep);
      setStartingSalary(SALARY_DATA[selectedAgency][level][firstStep]);
    }
  };

  // Handle APS step change
  const handleAPSStepChange = (e) => {
    const step = e.target.value;
    setSelectedAPSStep(step);
    
    if (selectedAPSLevel && step) {
      setStartingSalary(SALARY_DATA[selectedAgency][selectedAPSLevel][step]);
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      padding: '5px',
      maxWidth: '100%',
      margin: '0 auto',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ 
        fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
        marginBottom: '15px',
        textAlign: 'center',
        padding: '0 5px'
      }}>
        {AGENCIES[selectedAgency].name} Wage Growth vs CPI
      </h2>

      {/* Controls Row */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '15px',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 5px'
      }}>
        {/* Agency Selector */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          flex: '1 1 auto',
          minWidth: '150px',
          maxWidth: '300px'
        }}>
          <span style={{ 
            fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
            whiteSpace: 'nowrap'
          }}>Agency:</span>
          <select
            value={selectedAgency}
            onChange={e => setSelectedAgency(e.target.value)}
            style={{ 
              padding: '8px',
              fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
              borderRadius: '5px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
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
          flex: '1 1 auto',
          minWidth: '150px',
          maxWidth: '300px'
        }}>
          <span style={{ 
            fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
            whiteSpace: 'nowrap'
          }}>Years:</span>
          <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
            <select
              value={startYear}
              onChange={e => setStartYear(Number(e.target.value))}
              style={{
                padding: '8px',
                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                width: '45%'
              }}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <span style={{ 
              fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
              display: 'flex',
              alignItems: 'center'
            }}>to</span>
            <select
              value={endYear}
              onChange={e => setEndYear(Number(e.target.value))}
              style={{
                padding: '8px',
                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                width: '45%'
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
            fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
            width: '100%',
            maxWidth: '300px'
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
        padding: '0 5px',
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
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Projection Note */}
      <div style={{ 
        textAlign: 'center',
        fontSize: 'clamp(0.8rem, 2vw, 1rem)',
        color: '#666',
        marginBottom: '20px'
      }}>
        Note: CPI values for 2024 and beyond are projected estimates
      </div>

      {/* Salary Projection */}
      <div style={{ 
        marginTop: '20px',
        borderTop: '1px solid #ccc',
        paddingTop: '15px',
        padding: '0 5px'
      }}>
        <h2 style={{ 
          fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
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
          gap: '8px',
          marginBottom: '15px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            flex: '1 1 auto',
            minWidth: '120px',
            maxWidth: '180px'
          }}>
            <span style={{ 
              fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
              whiteSpace: 'nowrap'
            }}>Year:</span>
            <select 
              value={projectionStartYear}
              onChange={(e) => setProjectionStartYear(Number(e.target.value))}
              style={{
                padding: '8px',
                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                width: '100%'
              }}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* APS Level Selector */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            flex: '1 1 auto',
            minWidth: '120px',
            maxWidth: '180px'
          }}>
            <span style={{ 
              fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
              whiteSpace: 'nowrap'
            }}>Level:</span>
            <select
              value={selectedAPSLevel}
              onChange={handleAPSLevelChange}
              style={{
                padding: '8px',
                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                width: '100%'
              }}
            >
              <option value="">Select</option>
              {SALARY_DATA[selectedAgency] && Object.keys(SALARY_DATA[selectedAgency]).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* APS Step Selector - only shown if level is selected */}
          {selectedAPSLevel && (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              flex: '1 1 auto',
              minWidth: '120px',
              maxWidth: '180px'
            }}>
              <span style={{ 
                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                whiteSpace: 'nowrap'
              }}>Step:</span>
              <select
                value={selectedAPSStep}
                onChange={handleAPSStepChange}
                style={{
                  padding: '8px',
                  fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                  width: '100%'
                }}
              >
                {SALARY_DATA[selectedAgency][selectedAPSLevel] && 
                 Object.keys(SALARY_DATA[selectedAgency][selectedAPSLevel]).map(step => (
                  <option key={step} value={step}>{step}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            flex: '1 1 auto',
            minWidth: '120px',
            maxWidth: '180px'
          }}>
            <span style={{ 
              fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
              whiteSpace: 'nowrap'
            }}>Salary:</span>
            <input 
              type="number"
              value={startingSalary}
              onChange={(e) => setStartingSalary(Number(e.target.value))}
              style={{
                padding: '8px',
                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                width: '100%'
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

      {/* References */}
      <div style={{ 
        marginTop: '40px',
        padding: '20px',
        borderTop: '1px solid #ccc',
        fontSize: 'clamp(0.8rem, 2vw, 1rem)',
        color: '#666'
      }}>
        <h3 style={{ 
          fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
          marginBottom: '15px',
          color: '#333'
        }}>
          References
        </h3>
        
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div>
            <strong>Enterprise Agreements:</strong>
            <ul style={{ 
              listStyle: 'none',
              padding: '0',
              margin: '10px 0'
            }}>
              <li style={{ marginBottom: '8px' }}>
                • APSC Enterprise Agreement 2024-2027:&nbsp;
                <a 
                  href="https://www.apsc.gov.au/sites/default/files/2024-03/APSC%20Enterprise%20Agreement%202024-2027.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#1d4ed8' }}
                >
                  APSC EA PDF
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                • Defence Enterprise Agreement 2024-25:&nbsp;
                <a 
                  href="https://www.defence.gov.au/about/reports-publications/enterprise-agreements" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#1d4ed8' }}
                >
                  Defence Website
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                • ATO Enterprise Agreement 2024-25:&nbsp;
                <a 
                  href="https://www.ato.gov.au/about-ato/careers/working-at-the-ato/enterprise-agreement/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#1d4ed8' }}
                >
                  ATO Website
                </a>
              </li>
            </ul>
          </div>

          <div>
            <strong>CPI Data Source:</strong>
            <ul style={{ 
              listStyle: 'none',
              padding: '0',
              margin: '10px 0'
            }}>
              <li style={{ marginBottom: '8px' }}>
                • Australian Bureau of Statistics - Consumer Price Index:&nbsp;
                <a 
                  href="https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#1d4ed8' }}
                >
                  ABS Website
                </a>
              </li>
            </ul>
          </div>

          <div>
            <strong>Notes:</strong>
            <ul style={{ 
              listStyle: 'none',
              padding: '0',
              margin: '10px 0'
            }}>
              <li style={{ marginBottom: '8px' }}>
                • Wage data from 2015-2023 is based on historical Enterprise Agreements
              </li>
              <li style={{ marginBottom: '8px' }}>
                • Wage data for 2024-2025 is based on current Enterprise Agreements
              </li>
              <li style={{ marginBottom: '8px' }}>
                • Wage data from 2026-2030 is projected based on current trends
              </li>
              <li style={{ marginBottom: '8px' }}>
                • CPI data from 2015-2023 is actual data from ABS
              </li>
              <li style={{ marginBottom: '8px' }}>
                • CPI data from 2024-2030 is projected based on economic forecasts
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
