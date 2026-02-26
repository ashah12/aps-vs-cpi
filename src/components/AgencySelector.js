import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AGENCY_CATEGORIES } from '../data/agency-metadata';

const AgencySelector = ({ agencies, selectedAgency, onAgencyChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Group and filter agencies
  const groupedAgencies = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return AGENCY_CATEGORIES
      .map(cat => ({
        name: cat.name,
        items: cat.keys
          .filter(key => agencies[key])
          .map(key => ({ key, ...agencies[key] }))
          .filter(a => !term ||
            a.name.toLowerCase().includes(term) ||
            (a.shortName && a.shortName.toLowerCase().includes(term)) ||
            a.key.toLowerCase().includes(term)
          ),
      }))
      .filter(cat => cat.items.length > 0);
  }, [agencies, searchTerm]);

  const handleSelect = (key) => {
    onAgencyChange(key);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const selectedName = agencies[selectedAgency]?.shortName || agencies[selectedAgency]?.name || selectedAgency;

  return (
    <div className="agency-selector" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        className="agency-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="agency-selector-value">{selectedName}</span>
        <span className="agency-selector-arrow">{isOpen ? '\u25B2' : '\u25BC'}</span>
      </button>
      {isOpen && (
        <div className="agency-selector-dropdown">
          <input
            ref={searchRef}
            className="agency-selector-search"
            type="text"
            placeholder="Search agencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="agency-selector-list">
            {groupedAgencies.map(group => (
              <div key={group.name} className="agency-selector-group">
                <div className="agency-group-header">{group.name}</div>
                {group.items.map(agency => (
                  <button
                    key={agency.key}
                    className={`agency-option ${agency.key === selectedAgency ? 'selected' : ''}`}
                    onClick={() => handleSelect(agency.key)}
                    type="button"
                  >
                    <span className="agency-option-name">{agency.name}</span>
                    {agency.dataSource === 'estimated' && (
                      <span className="agency-option-badge estimated">Est.</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
            {groupedAgencies.length === 0 && (
              <div className="agency-selector-empty">No agencies found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencySelector;
