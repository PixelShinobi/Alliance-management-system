import { useState, useEffect } from 'react';
import './App.css';
import { AllianceMember, AllianceMemberCreate, AllianceStats, normalizeRole } from './types';
import { memberAPI } from './services/api';
import MemberList from './components/MemberList';
import MemberForm from './components/MemberForm';
import Statistics from './components/Statistics';
import SearchBar from './components/SearchBar';
import Charts from './components/Charts';
import Filter, { FilterOptions } from './components/Filter';

function App() {
  const [members, setMembers] = useState<AllianceMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<AllianceMember[]>([]);
  const [stats, setStats] = useState<AllianceStats | null>(null);
  const [editingMember, setEditingMember] = useState<AllianceMember | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');

  const loadMembers = async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await memberAPI.getAllMembers(search);
      const normalized = data.map(member => ({
        ...member,
        role: normalizeRole(member.role),
      }));
      setMembers(normalized);
      applyFilters(normalized, filters);
    } catch (err) {
      setError('Failed to load members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await memberAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    loadMembers();
    loadStats();
  }, []);

  const applyFilters = (memberList: AllianceMember[], filterOpts: FilterOptions) => {
    let filtered = [...memberList];

    if (filterOpts.powerMin !== undefined) {
      filtered = filtered.filter(m => m.power >= filterOpts.powerMin!);
    }
    if (filterOpts.powerMax !== undefined) {
      filtered = filtered.filter(m => m.power <= filterOpts.powerMax!);
    }
    if (filterOpts.meritsMin !== undefined) {
      filtered = filtered.filter(m => m.merits >= filterOpts.meritsMin!);
    }
    if (filterOpts.meritsMax !== undefined) {
      filtered = filtered.filter(m => m.merits <= filterOpts.meritsMax!);
    }
    if (filterOpts.role) {
      filtered = filtered.filter(m => m.role === filterOpts.role);
    }

    setFilteredMembers(filtered);
  };

  const handleFilterChange = (filterOpts: FilterOptions) => {
    setFilters(filterOpts);
    applyFilters(members, filterOpts);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    loadMembers(term || undefined);
  };

  const handleAddMember = async (member: AllianceMemberCreate) => {
    try {
      setError(null);
      await memberAPI.createMember(member);
      await loadMembers(searchTerm || undefined);
      await loadStats();
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add member');
      throw err;
    }
  };

  const handleUpdateMember = async (id: number, member: AllianceMemberCreate) => {
    try {
      setError(null);
      await memberAPI.updateMember(id, member);
      await loadMembers(searchTerm || undefined);
      await loadStats();
      setEditingMember(null);
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update member');
      throw err;
    }
  };

  const handleDeleteMember = async (id: number) => {
    // Find the member to get their name
    const member = members.find(m => m.id === id);
    const memberName = member ? member.name : 'this member';

    if (!window.confirm(`⚠️ Warning: Are you sure you want to delete "${memberName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      await memberAPI.deleteMember(id);
      await loadMembers(searchTerm || undefined);
      await loadStats();
      setError(`✅ Successfully deleted ${memberName}`);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(`❌ Failed to delete ${memberName}`);
      console.error(err);
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    try {
      setError(null);
      const result = await memberAPI.bulkDelete(ids);
      await loadMembers(searchTerm || undefined);
      await loadStats();
      setError(`✅ Successfully deleted ${result.deleted_count} members!`);
      setTimeout(() => setError(null), 5000);
    } catch (err) {
      setError('Failed to delete selected members');
      console.error(err);
    }
  };

  const handleEdit = (member: AllianceMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  const handleExport = async () => {
    try {
      setError(null);
      const blob = await memberAPI.exportToCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alliance_members_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setError('✅ Successfully exported members to CSV!');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError('Failed to export members');
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      setError('Please login as admin to import members');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      // Skip header row
      const dataLines = lines.slice(1);

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const line of dataLines) {
        // Parse CSV line (handle commas in quotes)
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));

        if (values.length < 6) continue;

        const [name, member_id, power, merits, units_killed, units_dead, role, notes] = values;
        const normalizedRole = normalizeRole(role);

        try {
          const memberData: AllianceMemberCreate = {
            name: name || 'Unknown',
            member_id: parseInt(member_id) || 0,
            power: parseInt(power) || 0,
            merits: parseInt(merits) || 0,
            units_killed: parseInt(units_killed) || 0,
            units_dead: parseInt(units_dead) || 0,
            role: normalizedRole,
            notes: notes || '',
          };

          await memberAPI.createMember(memberData);
          successCount++;
        } catch (err: any) {
          errorCount++;
          errors.push(`Row ${successCount + errorCount}: ${err.response?.data?.detail || 'Failed to add'}`);
        }
      }

      await loadMembers();
      await loadStats();

      if (errorCount > 0) {
        setError(`Import completed: ${successCount} added, ${errorCount} failed. ${errors.slice(0, 3).join(', ')}`);
      } else {
        setError(`✅ Successfully imported ${successCount} members!`);
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      setError('Failed to read CSV file. Please check the format.');
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, use proper backend authentication
    if (loginPassword === 'admin615') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginPassword('');
      setError('✅ Logged in as Admin');
      setTimeout(() => setError(null), 3000);
    } else {
      setError('❌ Incorrect password');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setError('Logged out successfully');
    setTimeout(() => setError(null), 3000);
  };

  const displayMembers = Object.keys(filters).length > 0 ? filteredMembers : members;

  return (
    <div className="app">
      <div className="app-glow" />
      <div className="app-shell">
        <header className="primary-header">
          <div className="header-left">
            <div className="brand">
              <span className="brand-badge">615</span>
              <div>
                <h1 className="brand-title">Alliance Command Center</h1>
                <p className="brand-subtitle">Monitor, analyze, and grow your alliance with confidence.</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="creator-chip">
              <span className="chip-label">Crafted by</span>
              <span className="chip-value">Ninja Cat 忍者猫</span>
            </div>
            {isAdmin ? (
              <button className="btn btn-ghost" onClick={handleLogout}>
                🔓 Logout
              </button>
            ) : (
              <button className="btn btn-ghost" onClick={() => setShowLoginModal(true)}>
                🔒 Admin Login
              </button>
            )}
          </div>
        </header>

        <main className="main-content">
          {error && (
            <div className="alert" role="alert">
              <span>{error}</span>
              <button className="alert-close" onClick={() => setError(null)} aria-label="Dismiss message">
                ×
              </button>
            </div>
          )}

          <section className="section">
            <div className="section-heading">
              <div>
                <h2>Alliance Overview</h2>
                <p>Key metrics updated in real-time from the frontline.</p>
              </div>
              <button
                className="btn btn-toggle"
                onClick={() => setShowCharts(!showCharts)}
              >
                📊 {showCharts ? 'Hide analytics' : 'Show analytics'}
              </button>
            </div>

            <div className="surface">
              <Statistics stats={stats} />
              {showCharts && members.length > 0 && (
                <div className="chart-surface">
                  <Charts members={members} />
                </div>
              )}
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <h2>Member Management</h2>
                <p>Search, filter, and take action on your alliance roster.</p>
              </div>
              {isAdmin && (
                <div className="section-actions">
                  <button className="btn btn-secondary" onClick={handleExport}>
                    📤 Export CSV
                  </button>
                  <label className="btn btn-secondary" htmlFor="csv-upload">
                    📊 Import CSV
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                  >
                    {showForm ? 'Cancel' : '＋ Add Member'}
                  </button>
                </div>
              )}
            </div>

            <div className="toolbar">
              <SearchBar onSearch={handleSearch} />
              <Filter onFilterChange={handleFilterChange} />
            </div>

            {showForm && (
              <div className="surface">
                <MemberForm
                  member={editingMember}
                  onSubmit={editingMember
                    ? (member) => handleUpdateMember(editingMember.id, member)
                    : handleAddMember
                  }
                  onCancel={handleCancelForm}
                />
              </div>
            )}

            <div className="surface">
              {loading ? (
                <div className="loading-state">
                  <span className="spinner" />
                  <p>Loading members...</p>
                </div>
              ) : (
                <MemberList
                  members={displayMembers}
                  onEdit={handleEdit}
                  onDelete={handleDeleteMember}
                  onBulkDelete={handleBulkDelete}
                  isAdmin={isAdmin}
                />
              )}
            </div>
          </section>
        </main>
      </div>

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>Admin Access</h2>
              <p>Enter the secure password to unlock management actions.</p>
            </header>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Login
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginPassword('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
