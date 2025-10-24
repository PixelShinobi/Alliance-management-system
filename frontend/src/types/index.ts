export interface AllianceMember {
  id: number;
  name: string;
  member_id: number;
  power: number;
  merits: number;
  units_killed: number;
  units_dead: number;
}

export interface AllianceMemberCreate {
  name: string;
  member_id: number;
  power: number;
  merits: number;
  units_killed: number;
  units_dead: number;
}

export interface AllianceMemberUpdate {
  name?: string;
  member_id?: number;
  power?: number;
  merits?: number;
  units_killed?: number;
  units_dead?: number;
}

export interface AllianceStats {
  total_members: number;
  total_power: number;
  total_merits: number;
  total_units_killed: number;
  total_units_dead: number;
}
