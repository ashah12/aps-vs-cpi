import React, { useMemo } from 'react';

const StatCard = ({ label, value, colorClass }) => (
  <div className="stat-card">
    <span className="stat-label">{label}</span>
    <span className={`stat-value ${colorClass || ''}`}>{value}</span>
  </div>
);

const SummaryStats = ({ data, agencyName, selectedLevel, selectedStep, startYear, endYear, salaryData }) => {
  const stats = useMemo(() => {
    if (!data || data.length < 2) return null;

    const dataSlice = data.slice(1); // Skip first year (no growth calculated)
    const wageGrowths = dataSlice.map(d => d.wage);
    const cpiValues = dataSlice.map(d => d.cpi);
    const realChanges = dataSlice.map(d => d.gap);

    const cumulativeRealChange = realChanges.reduce((sum, v) => sum + v, 0);
    const avgWageGrowth = wageGrowths.reduce((sum, v) => sum + v, 0) / wageGrowths.length;
    const avgCpi = cpiValues.reduce((sum, v) => sum + v, 0) / cpiValues.length;

    // Purchasing power: compound the real changes
    let purchasingPower = 100;
    for (const gap of realChanges) {
      purchasingPower *= (1 + gap / 100);
    }

    const bestYear = dataSlice.reduce((best, d) => d.gap > best.gap ? d : best);
    const worstYear = dataSlice.reduce((worst, d) => d.gap < worst.gap ? d : worst);

    const startSalary = salaryData?.years?.[startYear]?.[selectedLevel]?.[selectedStep] || 0;
    const endSalary = salaryData?.years?.[endYear]?.[selectedLevel]?.[selectedStep] || 0;

    return {
      cumulativeRealChange,
      avgWageGrowth,
      avgCpi,
      purchasingPower,
      bestYear: { year: bestYear.year, value: bestYear.gap },
      worstYear: { year: worstYear.year, value: worstYear.gap },
      salaryChange: endSalary - startSalary,
      startSalary,
      endSalary,
    };
  }, [data, salaryData, selectedLevel, selectedStep, startYear, endYear]);

  if (!stats) return null;

  return (
    <div className="summary-stats">
      <h3 className="summary-stats-title">
        Summary: {agencyName} {selectedLevel} {selectedStep} ({startYear}\u2013{endYear})
      </h3>
      <div className="stats-grid">
        <StatCard
          label="Cumulative Real Wage Change"
          value={`${stats.cumulativeRealChange >= 0 ? '+' : ''}${stats.cumulativeRealChange.toFixed(1)}%`}
          colorClass={stats.cumulativeRealChange >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          label="Avg Annual Wage Growth"
          value={`${stats.avgWageGrowth.toFixed(1)}%`}
        />
        <StatCard
          label="Avg Annual CPI"
          value={`${stats.avgCpi.toFixed(1)}%`}
        />
        <StatCard
          label="Purchasing Power Index"
          value={stats.purchasingPower.toFixed(1)}
          colorClass={stats.purchasingPower >= 100 ? 'positive' : 'negative'}
        />
        <StatCard
          label="Best Year"
          value={`${stats.bestYear.year} (+${stats.bestYear.value.toFixed(1)}%)`}
          colorClass="positive"
        />
        <StatCard
          label="Worst Year"
          value={`${stats.worstYear.year} (${stats.worstYear.value.toFixed(1)}%)`}
          colorClass="negative"
        />
      </div>
    </div>
  );
};

export default SummaryStats;
