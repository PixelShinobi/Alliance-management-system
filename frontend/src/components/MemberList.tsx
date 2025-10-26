import { useState, useMemo } from 'react';
import { AllianceMember, type AllianceRole, normalizeRole } from '../types';

interface MemberListProps {
  members: AllianceMember[];
  onEdit: (member: AllianceMember) => void;
  onDelete: (id: number) => void;
  onBulkDelete: (ids: number[]) => void;
  isAdmin: boolean;
}

type SortField = 'name' | 'member_id' | 'power' | 'merits' | 'merit_to_power_ratio' | 'units_killed' | 'units_dead' | 'kd_ratio' | 'contribution_percentage' | 'role';
type SortDirection = 'asc' | 'desc';

function MemberList({ members, onEdit, onDelete, onBulkDelete, isAdmin }: MemberListProps) {
  const [sortField, setSortField] = useState<SortField>('power');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getRoleOrder = (role?: AllianceRole | string | null): number => {
    const normalized = normalizeRole(role ?? undefined);
    switch (normalized) {
      case 'Leader': return 1;
      case 'R4': return 2;
      case 'Member': return 3;
      default: return 4;
    }
  };

  const sortedMembers = useMemo(() => {
    const sorted = [...members].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = (a[sortField] || '').toLowerCase();
          bValue = (b[sortField] || '').toLowerCase();
          break;
        case 'role':
          aValue = getRoleOrder(a.role);
          bValue = getRoleOrder(b.role);
          break;
        case 'merit_to_power_ratio':
        case 'kd_ratio':
        case 'contribution_percentage':
          aValue = a[sortField] ?? -1;
          bValue = b[sortField] ?? -1;
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [members, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return ' ⇅';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(members.map(m => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} members?`)) return;
    onBulkDelete(selectedIds);
    setSelectedIds([]);
  };

  const getRoleBadgeClass = (role?: AllianceRole | string | null) => {
    const normalized = normalizeRole(role ?? undefined);
    switch (normalized) {
      case 'Leader': return 'role-badge role-leader';
      case 'R4': return 'role-badge role-r4';
      case 'Member':
      default: return 'role-badge role-member';
    }
  };

  if (members.length === 0) {
    return (
      <div className="empty-state">
        <p>No members found. Add your first member to get started!</p>
      </div>
    );
  }

  return (
    <div className="member-list">
      {isAdmin && selectedIds.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedIds.length} member{selectedIds.length > 1 ? 's' : ''} selected</span>
          <button className="btn btn-delete" onClick={handleBulkDelete}>
            🗑️ Delete Selected
          </button>
        </div>
      )}

      <div className="table-wrapper">
        <table className="member-table">
          <thead>
            <tr>
              {isAdmin && (
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === members.length}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th className="sortable" onClick={() => handleSort('name')}>
                Name{getSortIcon('name')}
              </th>
              <th className="sortable" onClick={() => handleSort('role')}>
                Role{getSortIcon('role')}
              </th>
              <th className="sortable" onClick={() => handleSort('member_id')}>
                ID{getSortIcon('member_id')}
              </th>
              <th className="sortable" onClick={() => handleSort('power')}>
                Power{getSortIcon('power')}
              </th>
              <th className="sortable" onClick={() => handleSort('merits')}>
                Merits{getSortIcon('merits')}
              </th>
              <th className="sortable" onClick={() => handleSort('merit_to_power_ratio')}>
                Merit/Power %{getSortIcon('merit_to_power_ratio')}
              </th>
              <th className="sortable" onClick={() => handleSort('units_killed')}>
                Kills{getSortIcon('units_killed')}
              </th>
              <th className="sortable" onClick={() => handleSort('units_dead')}>
                Deaths{getSortIcon('units_dead')}
              </th>
              <th className="sortable" onClick={() => handleSort('kd_ratio')}>
                K/D Ratio{getSortIcon('kd_ratio')}
              </th>
              {isAdmin && <th>Notes</th>}
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sortedMembers.map((member) => (
              <tr key={member.id} className={selectedIds.includes(member.id) ? 'selected' : ''}>
                {isAdmin && (
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(member.id)}
                      onChange={() => handleSelectOne(member.id)}
                    />
                  </td>
                )}
                <td>{member.name}</td>
                <td>
                  <span className={getRoleBadgeClass(member.role)}>
                    {normalizeRole(member.role)}
                  </span>
                </td>
                <td>{member.member_id}</td>
                <td>{member.power.toLocaleString()}</td>
                <td>{member.merits.toLocaleString()}</td>
                <td>
                  {member.merit_to_power_ratio !== null && member.merit_to_power_ratio !== undefined
                    ? `${member.merit_to_power_ratio.toFixed(2)}%`
                    : 'N/A'}
                </td>
                <td>{member.units_killed.toLocaleString()}</td>
                <td>{member.units_dead.toLocaleString()}</td>
                <td>
                  {member.kd_ratio !== null && member.kd_ratio !== undefined
                    ? member.kd_ratio.toFixed(2)
                    : 'N/A'}
                </td>
                {isAdmin && (
                  <td className="notes-cell" title={member.notes || ''}>
                    {member.notes && member.notes.length > 30
                      ? member.notes.substring(0, 27) + '...'
                      : member.notes || '-'}
                  </td>
                )}
                {isAdmin && (
                  <td className="actions">
                    <button
                      className="btn btn-small btn-edit"
                      onClick={() => onEdit(member)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-delete"
                      onClick={() => onDelete(member.id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MemberList;
