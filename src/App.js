import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import LineChart from './components/LineChart';
import BarChart from './components/BarChart';
import SalaryProjectionChart from './components/SalaryProjectionChart';
import AgencySelector from './components/AgencySelector';
import AgencyMultiSelector from './components/AgencyMultiSelector';
import ComparisonChart from './components/ComparisonChart';
import SummaryStats from './components/SummaryStats';
import DataProvenance from './components/DataProvenance';
import salaryData from './data/agencies/index';
import CPIData from './data/cpi-data';

function App() {
  const [chartType, setChartType] = useState('line');
  const [startYear, setStartYear] = useState(2000);
  const [endYear, setEndYear] = useState(2024);
  const [projectionStartYear, setProjectionStartYear] = useState(2000);
  const [selectedAgency, setSelectedAgency] = useState('ABS');
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('APS6');
  const [selectedStep, setSelectedStep] = useState('Step 1');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparedAgencies, setComparedAgencies] = useState([]);
  const [startingSalary, setStartingSalary] = useState(() => {
    if (!salaryData.agencies[selectedAgency]) return 0;
    const agencyData = salaryData.agencies[selectedAgency];
    const years = Object.keys(agencyData.years).map(Number).sort((a, b) => a - b);
    const latestYear = years[years.length - 1];
    return agencyData.years[latestYear]?.[selectedLevel]?.[selectedStep] || 0;
  });

  const toggleChart = () => {
    setChartType(prev => (prev === 'line' ? 'bar' : 'line'));
  };

  // Load years on mount and when agency changes
  useEffect(() => {
    if (!salaryData.agencies[selectedAgency]) return;
    const years = Object.keys(salaryData.agencies[selectedAgency].years)
      .map(Number)
      .sort((a, b) => a - b);
    setYearOptions(years);
    if (years.includes(2000)) {
      setStartYear(2000);
    }
  }, [selectedAgency]);

  // Handle level change
  const handleLevelChange = (e) => {
    const newLevel = e.target.value;
    setSelectedLevel(newLevel);
    setSelectedStep('Step 1');
    const salary = salaryData.agencies[selectedAgency]?.years?.[projectionStartYear]?.[newLevel]?.['Step 1'];
    if (salary) setStartingSalary(salary);
  };

  // Handle step change
  const handleStepChange = (e) => {
    const newStep = e.target.value;
    setSelectedStep(newStep);
    const salary = salaryData.agencies[selectedAgency]?.years?.[projectionStartYear]?.[selectedLevel]?.[newStep];
    if (salary) setStartingSalary(salary);
  };

  // Handle agency change - accepts key string directly from AgencySelector
  const handleAgencyChange = (newAgency) => {
    // Support both string key (from AgencySelector) and event (from select)
    const agencyKey = typeof newAgency === 'string' ? newAgency : newAgency.target.value;
    setSelectedAgency(agencyKey);

    if (!salaryData.agencies[agencyKey]) return;

    const agencyData = salaryData.agencies[agencyKey];
    const years = Object.keys(agencyData.years).map(Number).sort((a, b) => a - b);
    const latestYear = years[years.length - 1];

    // Find a valid level - prefer APS6, fall back to first available
    const availableLevels = Object.keys(agencyData.years[latestYear] || {});
    const newLevel = availableLevels.includes('APS6') ? 'APS6' : availableLevels[0] || 'APS6';
    setSelectedLevel(newLevel);
    setSelectedStep('Step 1');

    const salary = agencyData.years[latestYear]?.[newLevel]?.['Step 1'];
    if (salary) setStartingSalary(salary);
  };

  // Handle projection start year change
  const handleProjectionStartYearChange = (e) => {
    const newYear = Number(e.target.value);
    setProjectionStartYear(newYear);
    const salary = salaryData.agencies[selectedAgency]?.years?.[newYear]?.[selectedLevel]?.[selectedStep];
    if (salary) setStartingSalary(salary);
  };

  // Single agency chart data
  const filteredData = useMemo(() => {
    if (!salaryData.agencies[selectedAgency]) return [];
    const years = Object.keys(salaryData.agencies[selectedAgency].years)
      .map(Number)
      .filter(year => year >= startYear && year <= endYear)
      .sort((a, b) => a - b);

    return years.map((year, index) => {
      const currentSalary = salaryData.agencies[selectedAgency].years[year]?.[selectedLevel]?.[selectedStep] || 0;
      let wageGrowth = 0;

      if (index > 0) {
        const prevYear = years[index - 1];
        const prevSalary = salaryData.agencies[selectedAgency].years[prevYear]?.[selectedLevel]?.[selectedStep] || 0;
        if (prevSalary > 0) {
          wageGrowth = ((currentSalary - prevSalary) / prevSalary) * 100;
        }
      }

      return {
        year,
        wage: wageGrowth,
        cpi: CPIData[year]?.value || 0,
        isProjected: CPIData[year]?.isProjected || false,
        gap: wageGrowth - (CPIData[year]?.value || 0)
      };
    });
  }, [startYear, endYear, selectedAgency, selectedLevel, selectedStep]);

  // Comparison chart data
  const comparisonData = useMemo(() => {
    if (!comparisonMode || comparedAgencies.length === 0) return [];

    // Find common year range
    const allYears = new Set();
    comparedAgencies.forEach(key => {
      if (salaryData.agencies[key]) {
        Object.keys(salaryData.agencies[key].years).map(Number).forEach(y => allYears.add(y));
      }
    });

    const years = [...allYears]
      .filter(y => y >= startYear && y <= endYear)
      .sort((a, b) => a - b);

    return years.map((year, idx) => {
      const point = { year, cpi: CPIData[year]?.value || 0 };
      for (const agencyKey of comparedAgencies) {
        const agency = salaryData.agencies[agencyKey];
        if (!agency) continue;
        if (idx > 0) {
          const prevYear = years[idx - 1];
          const curr = agency.years[year]?.[selectedLevel]?.[selectedStep] || 0;
          const prev = agency.years[prevYear]?.[selectedLevel]?.[selectedStep] || 0;
          point[agencyKey] = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
        } else {
          point[agencyKey] = 0;
        }
      }
      return point;
    });
  }, [comparisonMode, comparedAgencies, startYear, endYear, selectedLevel, selectedStep]);

  // Agency short names for comparison chart legend
  const agencyNames = useMemo(() => {
    const names = {};
    Object.entries(salaryData.agencies).forEach(([key, agency]) => {
      names[key] = agency.shortName || agency.name;
    });
    return names;
  }, []);

  // Salary projection data
  const salaryProjectionData = useMemo(() => {
    if (!startingSalary || !projectionStartYear) return [];
    if (!salaryData.agencies[selectedAgency]) return [];

    let expected = startingSalary;
    const years = Object.keys(salaryData.agencies[selectedAgency].years)
      .map(Number)
      .filter(year => year >= projectionStartYear && year <= endYear)
      .sort((a, b) => a - b);
    const currentYear = new Date().getFullYear();

    return years.map((year, idx) => {
      if (idx > 0) {
        expected *= (1 + (CPIData[year]?.value || 0) / 100);
      }
      const actual = salaryData.agencies[selectedAgency].years[year]?.[selectedLevel]?.[selectedStep] || 0;

      return {
        year,
        expected: Number(expected.toFixed(2)),
        actual: Number(actual.toFixed(2)),
        difference: Number((actual - expected).toFixed(2)),
        isFuture: year > currentYear
      };
    });
  }, [selectedAgency, projectionStartYear, endYear, selectedLevel, selectedStep, startingSalary]);

  // Available levels for current agency
  const availableLevels = useMemo(() => {
    const agency = salaryData.agencies[selectedAgency];
    if (!agency) return [];
    const yearData = agency.years[projectionStartYear] || agency.years[Object.keys(agency.years)[0]];
    return yearData ? Object.keys(yearData) : [];
  }, [selectedAgency, projectionStartYear]);

  // Available steps for current level
  const availableSteps = useMemo(() => {
    const agency = salaryData.agencies[selectedAgency];
    if (!agency) return [];
    const yearData = agency.years[projectionStartYear] || agency.years[Object.keys(agency.years)[0]];
    return yearData?.[selectedLevel] ? Object.keys(yearData[selectedLevel]) : [];
  }, [selectedAgency, projectionStartYear, selectedLevel]);

  const currentAgency = salaryData.agencies[selectedAgency];

  return (
    <div className="app-container">
      <h2 className="app-title">
        {comparisonMode ? 'Agency Comparison' : `${currentAgency?.name || selectedAgency} Wage Growth vs CPI`}
      </h2>

      {/* Data Provenance */}
      {!comparisonMode && currentAgency && (
        <DataProvenance agency={currentAgency} />
      )}

      {/* Controls Row */}
      <div className="controls-row">
        {/* Mode Toggle */}
        <button
          onClick={() => setComparisonMode(!comparisonMode)}
          className="toggle-button mode-toggle"
          type="button"
        >
          {comparisonMode ? 'Single Agency' : 'Compare Agencies'}
        </button>

        {/* Agency Selector */}
        {comparisonMode ? (
          <AgencyMultiSelector
            agencies={salaryData.agencies}
            selectedAgencies={comparedAgencies}
            onAgenciesChange={setComparedAgencies}
          />
        ) : (
          <div className="control-group">
            <span className="control-label">Agency:</span>
            <AgencySelector
              agencies={salaryData.agencies}
              selectedAgency={selectedAgency}
              onAgencyChange={handleAgencyChange}
            />
          </div>
        )}

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
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <span className="control-label"> to </span>
            <select
              className="control-select year-range-select"
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Level/Step selectors (shared between modes) */}
        <div className="control-group">
          <span className="control-label">Level:</span>
          <select
            value={selectedLevel}
            onChange={handleLevelChange}
            className="control-select"
          >
            {availableLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <span className="control-label">Step:</span>
          <select
            value={selectedStep}
            onChange={handleStepChange}
            className="control-select"
          >
            {availableSteps.map(step => (
              <option key={step} value={step}>{step}</option>
            ))}
          </select>
        </div>

        {/* Toggle Chart Button */}
        <button
          onClick={toggleChart}
          className="toggle-button"
          type="button"
        >
          {chartType === 'line' ? 'Bar' : 'Line'} Chart
        </button>
      </div>

      {/* Main Chart */}
      <div className="chart-container">
        {comparisonMode ? (
          <ComparisonChart
            data={comparisonData}
            agencies={comparedAgencies}
            agencyNames={agencyNames}
          />
        ) : (
          chartType === 'line' ? (
            <LineChart data={filteredData} />
          ) : (
            <BarChart data={filteredData} />
          )
        )}
      </div>

      {/* Summary Stats (single agency mode only) */}
      {!comparisonMode && (
        <SummaryStats
          data={filteredData}
          agencyName={currentAgency?.name || selectedAgency}
          selectedLevel={selectedLevel}
          selectedStep={selectedStep}
          startYear={startYear}
          endYear={endYear}
          salaryData={currentAgency}
        />
      )}

      {/* Projection Note */}
      <div className="projection-note">
        Note: CPI values for 2025 and beyond are projected estimates
      </div>

      {/* Salary Projection (single agency mode only) */}
      {!comparisonMode && (
        <div className="salary-projection">
          <h2 className="projection-title">
            Salary Projection
          </h2>

          {/* Projection Controls */}
          <div className="controls-row">
            <div className="control-group">
              <span className="control-label">Start Year:</span>
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
      )}

      {/* References */}
      <div className="references">
        <h3 className="references-title">References</h3>

        <div className="references-list">
          <div>
            <strong>Enterprise Agreements:</strong>
            <ul style={{ listStyle: 'none', padding: '0', margin: '10px 0' }}>
              {Object.entries(salaryData.agencies)
                .filter(([, agency]) => agency.eaLink)
                .map(([key, agency]) => (
                  <li key={key} className="references-item">
                    {'\u2022'} {agency.eaName || `${agency.name} EA`}:&nbsp;
                    <a
                      href={agency.eaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="references-link"
                    >
                      View
                    </a>
                    {agency.dataSource === 'estimated' && (
                      <span className="provenance-badge estimated" style={{ marginLeft: 8, fontSize: '0.75rem' }}>
                        Estimated
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <strong>CPI Data Source:</strong>
            <ul style={{ listStyle: 'none', padding: '0', margin: '10px 0' }}>
              <li className="references-item">
                {'\u2022'} Australian Bureau of Statistics - Consumer Price Index:&nbsp;
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
                {'\u2022'} Original 4 agencies (APSC, Defence, ATO, ABS) use mixed actual/estimated data
              </li>
              <li className="references-item">
                {'\u2022'} Additional agencies use estimated salary data based on APS pay scale patterns
              </li>
              <li className="references-item">
                {'\u2022'} CPI data from 2000-2024 is actual data from ABS
              </li>
              <li className="references-item">
                {'\u2022'} CPI data from 2025-2030 is projected based on economic forecasts
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
