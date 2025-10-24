import { useState, useEffect } from 'react';
import './App.css';
import { AllianceMember, AllianceMemberCreate, AllianceStats } from './types';
import { memberAPI } from './services/api';
import MemberList from './components/MemberList';
import MemberForm from './components/MemberForm';
import Statistics from './components/Statistics';
import SearchBar from './components/SearchBar';

function App() {
  const [members, setMembers] = useState<AllianceMember[]>([]);
  const [stats, setStats] = useState<AllianceStats | null>(null);
  const [editingMember, setEditingMember] = useState<AllianceMember | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await memberAPI.getAllMembers(search);
      setMembers(data);
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
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    try {
      setError(null);
      await memberAPI.deleteMember(id);
      await loadMembers(searchTerm || undefined);
      await loadStats();
    } catch (err) {
      setError('Failed to delete member');
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Alliance Management System</h1>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>&times;</button>
          </div>
        )}

        <Statistics stats={stats} />

        <div className="controls">
          <SearchBar onSearch={handleSearch} />
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add Member'}
          </button>
        </div>

        {showForm && (
          <MemberForm
            member={editingMember}
            onSubmit={editingMember
              ? (member) => handleUpdateMember(editingMember.id, member)
              : handleAddMember
            }
            onCancel={handleCancelForm}
          />
        )}

        {loading ? (
          <div className="loading">Loading members...</div>
        ) : (
          <MemberList
            members={members}
            onEdit={handleEdit}
            onDelete={handleDeleteMember}
          />
        )}
      </main>
    </div>
  );
}

export default App;
