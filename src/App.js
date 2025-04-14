import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import LineChart from './components/LineChart';
import BarChart from './components/BarChart';
import SalaryProjectionChart from './components/SalaryProjectionChart';
import { SALARY_DATA, AGENCIES, CPIData } from './constants/data';

function App() {
  const [chartType, setChartType] = useState('line');
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2030);
  const [projectionStartYear, setProjectionStartYear] = useState(2015);
  const [selectedAgency, setSelectedAgency] = useState('APS');
  const [yearOptions, setYearOptions] = useState([]);
  const [startingSalary, setStartingSalary] = useState(60000);
  const [selectedLevel, setSelectedLevel] = useState('APS6');
  const [selectedStep, setSelectedStep] = useState('Step 1');

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

  // Handle level change
  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
    setSelectedStep('Step 1'); // Reset to first step
  };

  // Handle step change
  const handleStepChange = (e) => {
    setSelectedStep(e.target.value);
  };

  return (
    <div className="app-container">
      <h2 className="app-title">
        {AGENCIES[selectedAgency].name} Wage Growth vs CPI
      </h2>

      {/* Controls Row */}
      <div className="controls-row">
        {/* Agency Selector */}
        <div className="control-group">
          <span className="control-label">Agency:</span>
          <select
            value={selectedAgency}
            onChange={e => setSelectedAgency(e.target.value)}
            className="control-select"
          >
            {Object.keys(AGENCIES).map(agency => (
              <option key={agency} value={agency}>{AGENCIES[agency].name}</option>
            ))}
          </select>
        </div>

        {/* Year Filters */}
        <div className="control-group">
          <label className="control-label">Year Range:</label>
          <div className="year-range-group">
            <select
              className="control-select year-range-select"
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <span className="control-label"> to </span>
            <select
              className="control-select year-range-select"
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle Chart Button */}
        <button
          onClick={toggleChart}
          className="toggle-button"
        >
          Toggle to {chartType === 'line' ? 'Bar' : 'Line'} Chart
        </button>
      </div>

      {/* Main Chart */}
      <div className="chart-container">
        {chartType === 'line' ? (
          <LineChart data={filteredData} />
        ) : (
          <BarChart data={filteredData} />
        )}
      </div>

      {/* Projection Note */}
      <div className="projection-note">
        Note: CPI values for 2024 and beyond are projected estimates
      </div>

      {/* Salary Projection */}
      <div className="salary-projection">
        <h2 className="projection-title">
          Salary Projection
        </h2>

        {/* Projection Controls */}
        <div className="controls-row">
          <div className="control-group">
            <span className="control-label">Year:</span>
            <select 
              value={projectionStartYear}
              onChange={(e) => setProjectionStartYear(Number(e.target.value))}
              className="control-select"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* APS Level Selector */}
          <div className="control-group">
            <span className="control-label">Level:</span>
            <select
              value={selectedLevel}
              onChange={handleLevelChange}
              className="control-select"
            >
              <option value="">Select</option>
              {SALARY_DATA[selectedAgency] && Object.keys(SALARY_DATA[selectedAgency]).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* APS Step Selector - only shown if level is selected */}
          {selectedLevel && (
            <div className="control-group">
              <span className="control-label">Step:</span>
              <select
                value={selectedStep}
                onChange={handleStepChange}
                className="control-select"
              >
                {SALARY_DATA[selectedAgency][selectedLevel] && 
                 Object.keys(SALARY_DATA[selectedAgency][selectedLevel]).map(step => (
                  <option key={step} value={step}>{step}</option>
                ))}
              </select>
            </div>
          )}

          <div className="control-group">
            <span className="control-label">Salary:</span>
            <input 
              type="number"
              value={startingSalary}
              onChange={(e) => setStartingSalary(Number(e.target.value))}
              className="control-select"
            />
          </div>
        </div>

        <div className="chart-container">
          <SalaryProjectionChart data={salaryProjectionData} />
        </div>
      </div>

      {/* References */}
      <div className="references">
        <h3 className="references-title">
          References
        </h3>
        
        <div className="references-list">
          <div>
            <strong>Enterprise Agreements:</strong>
            <ul style={{ listStyle: 'none', padding: '0', margin: '10px 0' }}>
              <li className="references-item">
                • APSC Enterprise Agreement 2024-2027:&nbsp;
                <a 
                  href="https://www.apsc.gov.au/sites/default/files/2024-03/APSC%20Enterprise%20Agreement%202024-2027.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="references-link"
                >
                  APSC EA PDF
                </a>
              </li>
              <li className="references-item">
                • Defence Enterprise Agreement 2024-25:&nbsp;
                <a 
                  href="https://www.defence.gov.au/about/reports-publications/enterprise-agreements" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="references-link"
                >
                  Defence Website
                </a>
              </li>
              <li className="references-item">
                • ATO Enterprise Agreement 2024-25:&nbsp;
                <a 
                  href="https://www.ato.gov.au/about-ato/careers/working-at-the-ato/enterprise-agreement/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="references-link"
                >
                  ATO Website
                </a>
              </li>
            </ul>
          </div>

          <div>
            <strong>CPI Data Source:</strong>
            <ul style={{ listStyle: 'none', padding: '0', margin: '10px 0' }}>
              <li className="references-item">
                • Australian Bureau of Statistics - Consumer Price Index:&nbsp;
                <a 
                  href="https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="references-link"
                >
                  ABS Website
                </a>
              </li>
            </ul>
          </div>

          <div>
            <strong>Notes:</strong>
            <ul style={{ listStyle: 'none', padding: '0', margin: '10px 0' }}>
              <li className="references-item">
                • Wage data from 2015-2023 is based on historical Enterprise Agreements
              </li>
              <li className="references-item">
                • Wage data for 2024-2025 is based on current Enterprise Agreements
              </li>
              <li className="references-item">
                • Wage data from 2026-2030 is projected based on current trends
              </li>
              <li className="references-item">
                • CPI data from 2015-2023 is actual data from ABS
              </li>
              <li className="references-item">
                • CPI data from 2024-2030 is projected based on economic forecasts
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
