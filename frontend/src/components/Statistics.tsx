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
      <div className="stat-card">
        <h3>Total Members</h3>
        <p className="value">{stats.total_members}</p>
      </div>
      <div className="stat-card">
        <h3>Total Power</h3>
        <p className="value">{stats.total_power.toLocaleString()}</p>
      </div>
      <div className="stat-card">
        <h3>Total Merits</h3>
        <p className="value">{stats.total_merits.toLocaleString()}</p>
      </div>
      <div className="stat-card">
        <h3>Total Units Killed</h3>
        <p className="value">{stats.total_units_killed.toLocaleString()}</p>
      </div>
      <div className="stat-card">
        <h3>Total Units Dead</h3>
        <p className="value">{stats.total_units_dead.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default Statistics;
