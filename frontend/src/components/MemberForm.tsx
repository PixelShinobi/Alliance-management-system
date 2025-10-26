import { useState, useEffect } from 'react';
import { AllianceMember, AllianceMemberCreate, normalizeRole } from '../types';

interface MemberFormProps {
  member?: AllianceMember | null;
  onSubmit: (member: AllianceMemberCreate) => Promise<void>;
  onCancel: () => void;
}

function MemberForm({ member, onSubmit, onCancel }: MemberFormProps) {
  const [formData, setFormData] = useState<AllianceMemberCreate>({
    name: '',
    member_id: 0,
    power: 0,
    merits: 0,
    units_killed: 0,
    units_dead: 0,
    role: 'Member',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        member_id: member.member_id,
        power: member.power,
        merits: member.merits,
        units_killed: member.units_killed,
        units_dead: member.units_dead,
        role: normalizeRole(member.role),
        notes: member.notes || '',
      });
    }
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'role' || name === 'notes' ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Name is required');
      return;
    }

    if (formData.member_id <= 0) {
      setFormError('Member ID must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
      setFormData({
        name: '',
        member_id: 0,
        power: 0,
        merits: 0,
        units_killed: 0,
        units_dead: 0,
        role: 'Member',
        notes: '',
      });
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="member-form-container">
      <h2>{member ? 'Edit Member' : 'Add New Member'}</h2>
      <form onSubmit={handleSubmit} className="member-form">
        {formError && <div className="form-error">{formError}</div>}

        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter member name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="member_id">Member ID *</label>
          <input
            type="number"
            id="member_id"
            name="member_id"
            value={formData.member_id}
            onChange={handleChange}
            required
            min="1"
            placeholder="Enter unique member ID"
          />
        </div>

        <div className="form-group">
          <label htmlFor="power">Power</label>
          <input
            type="number"
            id="power"
            name="power"
            value={formData.power}
            onChange={handleChange}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="merits">Merits</label>
          <input
            type="number"
            id="merits"
            name="merits"
            value={formData.merits}
            onChange={handleChange}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="units_killed">Units Killed</label>
          <input
            type="number"
            id="units_killed"
            name="units_killed"
            value={formData.units_killed}
            onChange={handleChange}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="units_dead">Units Dead</label>
          <input
            type="number"
            id="units_dead"
            name="units_dead"
            value={formData.units_dead}
            onChange={handleChange}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="Leader">Leader</option>
            <option value="R4">R4</option>
            <option value="Member">Member</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (Admin Only)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any notes about this member..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : member ? 'Update Member' : 'Add Member'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default MemberForm;
