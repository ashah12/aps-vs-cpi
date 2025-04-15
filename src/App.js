import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import LineChart from './components/LineChart';
import BarChart from './components/BarChart';
import SalaryProjectionChart from './components/SalaryProjectionChart';
import { AGENCIES } from './constants/data';
import salaryData from './data/salary-data.json';

// ABS CPI data for June quarter (annual)
const CPIData = {
  2000: { value: 3.0, isProjected: false },
  2001: { value: 6.0, isProjected: false },
  2002: { value: 2.8, isProjected: false },
  2003: { value: 2.8, isProjected: false },
  2004: { value: 2.5, isProjected: false },
  2005: { value: 2.5, isProjected: false },
  2006: { value: 4.0, isProjected: false },
  2007: { value: 2.1, isProjected: false },
  2008: { value: 4.5, isProjected: false },
  2009: { value: 1.5, isProjected: false },
  2010: { value: 3.1, isProjected: false },
  2011: { value: 3.6, isProjected: false },
  2012: { value: 1.2, isProjected: false },
  2013: { value: 2.4, isProjected: false },
  2014: { value: 3.0, isProjected: false },
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

function App() {
  const [chartType, setChartType] = useState('line');
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2030);
  const [projectionStartYear, setProjectionStartYear] = useState(2015);
  const [selectedAgency, setSelectedAgency] = useState('APS');
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('APS6');
  const [selectedStep, setSelectedStep] = useState('Step 1');
  const [startingSalary, setStartingSalary] = useState(
    salaryData.agencies[selectedAgency].years[projectionStartYear][selectedLevel][selectedStep]
  );

  const toggleChart = () => {
    setChartType(prev => (prev === 'line' ? 'bar' : 'line'));
  };

  // Load data on mount and when agency changes
  useEffect(() => {
    const years = Object.keys(salaryData.agencies[selectedAgency].years).map(Number).sort((a, b) => a - b);
    setYearOptions(years);
    // Set default start year to 2000 if it's available
    if (years.includes(2000)) {
      setStartYear(2000);
    }
  }, [selectedAgency]);

  // Handle level change
  const handleLevelChange = (e) => {
    const newLevel = e.target.value;
    setSelectedLevel(newLevel);
    setSelectedStep('Step 1'); // Reset to first step
    // Update starting salary based on new level and first step
    setStartingSalary(salaryData.agencies[selectedAgency].years[projectionStartYear][newLevel]['Step 1']);
  };

  // Handle step change
  const handleStepChange = (e) => {
    const newStep = e.target.value;
    setSelectedStep(newStep);
    // Update starting salary based on new step
    setStartingSalary(salaryData.agencies[selectedAgency].years[projectionStartYear][selectedLevel][newStep]);
  };

  // Handle agency change
  const handleAgencyChange = (e) => {
    const newAgency = e.target.value;
    setSelectedAgency(newAgency);
    
    // Check if the agency exists in the salary data
    if (!salaryData.agencies[newAgency]) {
      console.error(`No salary data found for agency: ${newAgency}`);
      return;
    }

    // Reset to default level and step
    setSelectedLevel('APS6');
    setSelectedStep('Step 1');
    
    // Update starting salary based on new agency's default level and step
    const agencyData = salaryData.agencies[newAgency];
    const years = Object.keys(agencyData.years).map(Number).sort((a, b) => a - b);
    const latestYear = years[years.length - 1];
    
    if (agencyData.years[latestYear] && 
        agencyData.years[latestYear]['APS6'] && 
        agencyData.years[latestYear]['APS6']['Step 1']) {
      setStartingSalary(agencyData.years[latestYear]['APS6']['Step 1']);
    } else {
      console.error(`No salary data found for ${newAgency} APS6 Step 1 in year ${latestYear}`);
    }
  };

  // Handle projection start year change
  const handleProjectionStartYearChange = (e) => {
    const newYear = Number(e.target.value);
    setProjectionStartYear(newYear);
    // Update starting salary based on new year
    setStartingSalary(salaryData.agencies[selectedAgency].years[newYear][selectedLevel][selectedStep]);
  };

  const filteredData = useMemo(() => {
    const years = Object.keys(salaryData.agencies[selectedAgency].years)
      .map(Number)
      .filter(year => year >= startYear && year <= endYear)
      .sort((a, b) => a - b);

    return years.map((year, index) => {
      const currentSalary = salaryData.agencies[selectedAgency].years[year][selectedLevel][selectedStep];
      let wageGrowth = 0;
      
      if (index > 0) {
        const prevYear = years[index - 1];
        const prevSalary = salaryData.agencies[selectedAgency].years[prevYear][selectedLevel][selectedStep];
        wageGrowth = ((currentSalary - prevSalary) / prevSalary) * 100;
      }

      return {
        year,
        wage: wageGrowth,
        cpi: CPIData[year]?.value || 0,
        isProjected: CPIData[year]?.isProjected || false,
        gap: wageGrowth - (CPIData[year]?.value || 0) // Real wage change
      };
    });
  }, [startYear, endYear, selectedAgency, selectedLevel, selectedStep]);

  const salaryProjectionData = useMemo(() => {
    if (!startingSalary || !projectionStartYear) return [];

    let expected = startingSalary;
    let actual = startingSalary;
    const years = Object.keys(salaryData.agencies[selectedAgency].years)
      .map(Number)
      .filter(year => year >= projectionStartYear && year <= endYear)
      .sort((a, b) => a - b);
    const currentYear = new Date().getFullYear();

    return years.map((year, idx) => {
      if (idx > 0) {
        expected *= (1 + (CPIData[year]?.value || 0) / 100);
        actual = salaryData.agencies[selectedAgency].years[year][selectedLevel][selectedStep];
      }

      return {
        year,
        expected: Number(expected.toFixed(2)),
        actual: Number(actual.toFixed(2)),
        difference: Number((actual - expected).toFixed(2)),
        isFuture: year > currentYear
      };
    });
  }, [selectedAgency, projectionStartYear, endYear, selectedLevel, selectedStep, startingSalary]);

  return (
    <div className="app-container">
      <h2 className="app-title">
        {salaryData.agencies[selectedAgency].name} Wage Growth vs CPI
      </h2>

      {/* Controls Row */}
      <div className="controls-row">
        {/* Agency Selector */}
        <div className="control-group">
          <span className="control-label">Agency:</span>
          <select
            value={selectedAgency}
            onChange={handleAgencyChange}
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
              onChange={handleProjectionStartYearChange}
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
              {salaryData.agencies[selectedAgency] && Object.keys(salaryData.agencies[selectedAgency].years[projectionStartYear]).map(level => (
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
                {salaryData.agencies[selectedAgency].years[projectionStartYear][selectedLevel] && 
                 Object.keys(salaryData.agencies[selectedAgency].years[projectionStartYear][selectedLevel]).map(step => (
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
