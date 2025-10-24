import axios from 'axios';
import { AllianceMember, AllianceMemberCreate, AllianceMemberUpdate, AllianceStats } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const memberAPI = {
  getAllMembers: async (search?: string): Promise<AllianceMember[]> => {
    const params = search ? { search } : {};
    const response = await api.get<AllianceMember[]>('/members', { params });
    return response.data;
  },

  getMember: async (id: number): Promise<AllianceMember> => {
    const response = await api.get<AllianceMember>(`/members/${id}`);
    return response.data;
  },

  createMember: async (member: AllianceMemberCreate): Promise<AllianceMember> => {
    const response = await api.post<AllianceMember>('/members', member);
    return response.data;
  },

  updateMember: async (id: number, member: AllianceMemberUpdate): Promise<AllianceMember> => {
    const response = await api.put<AllianceMember>(`/members/${id}`, member);
    return response.data;
  },

  deleteMember: async (id: number): Promise<void> => {
    await api.delete(`/members/${id}`);
  },

  getStats: async (): Promise<AllianceStats> => {
    const response = await api.get<AllianceStats>('/stats');
    return response.data;
  },
};

export default api;
