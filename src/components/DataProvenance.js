import React from 'react';

const DataProvenance = ({ agency }) => {
  if (!agency) return null;

  const { dataSource, eaName, eaLink } = agency;

  const badgeClass = dataSource === 'actual' ? 'verified' :
                     dataSource === 'mixed' ? 'mixed' : 'estimated';
  const badgeLabel = dataSource === 'actual' ? 'Verified EA Data' :
                     dataSource === 'mixed' ? 'Mixed Sources' : 'Estimated';

  return (
    <div className="provenance-indicator">
      <span className={`provenance-badge ${badgeClass}`}>
        {badgeLabel}
      </span>
      {eaLink && (
        <a
          href={eaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="provenance-link"
        >
          {eaName || 'View Source'}
        </a>
      )}
    </div>
  );
};

export default DataProvenance;
