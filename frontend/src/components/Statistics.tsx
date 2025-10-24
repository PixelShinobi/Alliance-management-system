import { AllianceStats } from '../types';

interface StatisticsProps {
  stats: AllianceStats | null;
}

function Statistics({ stats }: StatisticsProps) {
  if (!stats) {
    return null;
  }

  return (
    <div className="statistics">
      <h2>Alliance Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Members</div>
          <div className="stat-value">{stats.total_members}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Power</div>
          <div className="stat-value">{stats.total_power.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Merits</div>
          <div className="stat-value">{stats.total_merits.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Units Killed</div>
          <div className="stat-value">{stats.total_units_killed.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Units Dead</div>
          <div className="stat-value">{stats.total_units_dead.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
