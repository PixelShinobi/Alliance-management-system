import { AllianceMember, normalizeRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';

interface ChartsProps {
  members: AllianceMember[];
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea', '#fed6e3'];

const Charts = ({ members }: ChartsProps) => {
  const renderMeritLabel = ({ name, percent }: PieLabelRenderProps) => {
    const labelName = typeof name === 'string' ? name : String(name ?? 'Unknown');
    const percentage = typeof percent === 'number' ? (percent * 100).toFixed(0) : '0';
    return `${labelName}: ${percentage}%`;
  };

  const renderRoleLabel = ({ name, payload }: PieLabelRenderProps) => {
    const labelName = typeof name === 'string' ? name : String(name ?? 'Unknown');
    const payloadWithValue = payload as { value?: number } | undefined;
    const total = typeof payloadWithValue?.value === 'number' ? payloadWithValue.value : 0;
    return `${labelName}: ${total}`;
  };
  // Get top 10 by merits
  const topByMerits = [...members]
    .sort((a, b) => b.merits - a.merits)
    .slice(0, 10)
    .map(m => ({
      name: m.name.length > 15 ? m.name.substring(0, 12) + '...' : m.name,
      merits: m.merits,
      power: m.power
    }));

  // Get merit distribution for pie chart (top 8 + others)
  const sortedByMerits = [...members].sort((a, b) => b.merits - a.merits);
  const top8 = sortedByMerits.slice(0, 8);
  const others = sortedByMerits.slice(8);

  const meritDistribution = [
    ...top8.map(m => ({
      name: m.name.length > 12 ? m.name.substring(0, 9) + '...' : m.name,
      value: m.merits
    })),
    ...(others.length > 0 ? [{
      name: 'Others',
      value: others.reduce((sum, m) => sum + m.merits, 0)
    }] : [])
  ];

  // Role distribution
  const roleDistribution = members.reduce((acc, member) => {
    const role = normalizeRole(member.role);
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roleData = Object.entries(roleDistribution).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="charts-container">
      <div className="chart-section">
        <h3 className="chart-title">🏆 Top 10 Contributors</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={topByMerits}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="name"
              stroke="#fff"
              tick={{ fill: '#fff', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#fff" tick={{ fill: '#fff' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
              formatter={(value: number) => value.toLocaleString()}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Bar dataKey="merits" fill="#667eea" name="Merits" />
            <Bar dataKey="power" fill="#fa709a" name="Power" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-row">
        <div className="chart-section">
          <h3 className="chart-title">📊 Merit Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={meritDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderMeritLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {meritDistribution.map((item, index) => (
                  <Cell key={`${item.name ?? 'segment'}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => value.toLocaleString()}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h3 className="chart-title">👥 Role Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderRoleLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {roleData.map((item, index) => (
                  <Cell key={`${item.name ?? 'role'}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
