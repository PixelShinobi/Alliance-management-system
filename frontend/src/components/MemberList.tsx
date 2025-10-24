import { AllianceMember } from '../types';

interface MemberListProps {
  members: AllianceMember[];
  onEdit: (member: AllianceMember) => void;
  onDelete: (id: number) => void;
}

function MemberList({ members, onEdit, onDelete }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="empty-state">
        <p>No members found. Add your first member to get started!</p>
      </div>
    );
  }

  return (
    <div className="member-list">
      <table className="member-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Member ID</th>
            <th>Power</th>
            <th>Merits</th>
            <th>Units Killed</th>
            <th>Units Dead</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>{member.member_id}</td>
              <td>{member.power.toLocaleString()}</td>
              <td>{member.merits.toLocaleString()}</td>
              <td>{member.units_killed.toLocaleString()}</td>
              <td>{member.units_dead.toLocaleString()}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MemberList;
