import React, { useState } from 'react';

const DataProvenance = ({ agency, selectedYear }) => {
  const [showHistory, setShowHistory] = useState(false);

  if (!agency) return null;

  const { dataSource, eaName, eaLink, historicalAgreements } = agency;

  const badgeClass = dataSource === 'actual' ? 'verified' :
                     dataSource === 'mixed' ? 'mixed' : 'estimated';
  const badgeLabel = dataSource === 'actual' ? 'Verified EA Data' :
                     dataSource === 'mixed' ? 'Mixed Sources' : 'Estimated';

  // Find the applicable agreement for the selected year
  const applicableAgreement = historicalAgreements?.find(
    ea => selectedYear >= ea.startYear && selectedYear <= ea.endYear
  );

  return (
    <div className="provenance-indicator-wrapper">
      <div className="provenance-indicator">
        <span className={`provenance-badge ${badgeClass}`}>
          {badgeLabel}
        </span>
        {applicableAgreement ? (
          <a
            href={applicableAgreement.link}
            target="_blank"
            rel="noopener noreferrer"
            className="provenance-link"
          >
            {applicableAgreement.name}
          </a>
        ) : eaLink ? (
          <a
            href={eaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="provenance-link"
          >
            {eaName || 'View Source'}
          </a>
        ) : null}
        {historicalAgreements?.length > 0 && (
          <button
            className="provenance-history-toggle"
            onClick={() => setShowHistory(!showHistory)}
            type="button"
          >
            {showHistory ? 'Hide' : 'Show'} Agreement History
          </button>
        )}
      </div>

      {showHistory && historicalAgreements?.length > 0 && (
        <div className="agreement-history">
          <table className="agreement-history-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Agreement</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {historicalAgreements.map((ea, idx) => (
                <tr
                  key={idx}
                  className={
                    applicableAgreement === ea ? 'agreement-active' : ''
                  }
                >
                  <td>{ea.startYear}&#8211;{ea.endYear}</td>
                  <td>{ea.name}</td>
                  <td>
                    <a
                      href={ea.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="references-link"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataProvenance;
