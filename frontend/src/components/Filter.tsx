import { useState } from 'react';
import type { AllianceRole } from '../types';

export interface FilterOptions {
  powerMin?: number;
  powerMax?: number;
  meritsMin?: number;
  meritsMax?: number;
  role?: AllianceRole;
}

interface FilterProps {
  onFilterChange: (filters: FilterOptions) => void;
}

const Filter = ({ onFilterChange }: FilterProps) => {
  const [powerMin, setPowerMin] = useState('');
  const [powerMax, setPowerMax] = useState('');
  const [meritsMin, setMeritsMin] = useState('');
  const [meritsMax, setMeritsMax] = useState('');
  const [role, setRole] = useState<AllianceRole | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = () => {
    const filters: FilterOptions = {};
    if (powerMin) filters.powerMin = parseInt(powerMin);
    if (powerMax) filters.powerMax = parseInt(powerMax);
    if (meritsMin) filters.meritsMin = parseInt(meritsMin);
    if (meritsMax) filters.meritsMax = parseInt(meritsMax);
    if (role) filters.role = role;
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setPowerMin('');
    setPowerMax('');
    setMeritsMin('');
    setMeritsMax('');
    setRole('');
    onFilterChange({});
  };

  return (
    <div className="filter-container">
      <button
        className="btn btn-filter"
        onClick={() => setShowFilters(!showFilters)}
      >
        🔍 {showFilters ? 'Hide' : 'Show'} Filters
      </button>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            <div className="filter-group">
              <label>Power Range</label>
              <div className="filter-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={powerMin}
                  onChange={(e) => setPowerMin(e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={powerMax}
                  onChange={(e) => setPowerMax(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Merits Range</label>
              <div className="filter-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={meritsMin}
                  onChange={(e) => setMeritsMin(e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={meritsMax}
                  onChange={(e) => setMeritsMax(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as AllianceRole | '')}>
                <option value="">All Roles</option>
                <option value="Leader">Leader</option>
                <option value="R4">R4</option>
                <option value="Member">Member</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button className="btn btn-primary" onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
