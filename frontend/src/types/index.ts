export type AllianceRole = 'Leader' | 'R4' | 'Member';

export interface AllianceMember {
  id: number;
  name: string;
  member_id: number;
  power: number;
  merits: number;
  units_killed: number;
  units_dead: number;
  role?: AllianceRole;
  notes?: string;
  last_updated?: string;
  merit_to_power_ratio?: number | null;
  kd_ratio?: number | null;
  contribution_percentage?: number | null;
}

export interface AllianceMemberCreate {
  name: string;
  member_id: number;
  power: number;
  merits: number;
  units_killed: number;
  units_dead: number;
  role?: AllianceRole;
  notes?: string;
}

export interface AllianceMemberUpdate {
  name?: string;
  member_id?: number;
  power?: number;
  merits?: number;
  units_killed?: number;
  units_dead?: number;
  role?: AllianceRole;
  notes?: string;
}

export interface AllianceStats {
  total_members: number;
  total_power: number;
  total_merits: number;
  total_units_killed: number;
  total_units_dead: number;
}

export const normalizeRole = (value?: string | null): AllianceRole => {
  const upper = (value || '').toUpperCase();
  if (upper === 'R5' || upper === 'LEADER') {
    return 'Leader';
  }
  if (upper === 'R4') {
    return 'R4';
  }
  if (upper === 'R3' || upper === 'MEMBER') {
    return 'Member';
  }
  return 'Member';
};
