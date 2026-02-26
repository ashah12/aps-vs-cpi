import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AGENCY_CATEGORIES } from '../data/agency-metadata';

const MAX_AGENCIES = 5;

const AgencyMultiSelector = ({ agencies, selectedAgencies, onAgenciesChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

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

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

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

  const toggleAgency = (key) => {
    if (selectedAgencies.includes(key)) {
      onAgenciesChange(selectedAgencies.filter(k => k !== key));
    } else if (selectedAgencies.length < MAX_AGENCIES) {
      onAgenciesChange([...selectedAgencies, key]);
    }
  };

  const removeAgency = (key) => {
    onAgenciesChange(selectedAgencies.filter(k => k !== key));
  };

  return (
    <div className="agency-multi-selector" ref={dropdownRef}>
      {/* Selected chips */}
      <div className="agency-chips">
        {selectedAgencies.map(key => (
          <span key={key} className="agency-chip">
            {agencies[key]?.shortName || key}
            <button
              className="agency-chip-remove"
              onClick={() => removeAgency(key)}
              type="button"
            >
              &times;
            </button>
          </span>
        ))}
        <button
          className="agency-multi-trigger"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          {selectedAgencies.length === 0 ? 'Select agencies to compare...' :
           selectedAgencies.length >= MAX_AGENCIES ? `Max ${MAX_AGENCIES} selected` :
           '+ Add agency'}
        </button>
      </div>

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
                {group.items.map(agency => {
                  const isSelected = selectedAgencies.includes(agency.key);
                  const isDisabled = !isSelected && selectedAgencies.length >= MAX_AGENCIES;
                  return (
                    <button
                      key={agency.key}
                      className={`agency-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => !isDisabled && toggleAgency(agency.key)}
                      type="button"
                      disabled={isDisabled}
                    >
                      <span className="agency-option-check">
                        {isSelected ? '\u2611' : '\u2610'}
                      </span>
                      <span className="agency-option-name">{agency.name}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyMultiSelector;
