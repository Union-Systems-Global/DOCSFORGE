import { create } from 'zustand';
import { api } from '@/lib/api';

export interface ActivityItem {
  id: number;
  type: string;
  message: string;
  user_name: string;
  bankId: string | null;
  createdAt: string;
}

export interface WorkspaceStats {
  totalDocuments: number;
  totalPortals: number;
  recentActivityCount: number;
  activeContributors: number;
}

interface ActivityStore {
  activities: ActivityItem[];
  stats: WorkspaceStats;
  loading: boolean;
  fetchActivities: () => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  activities: [],
  stats: {
    totalDocuments: 0,
    totalPortals: 0,
    recentActivityCount: 0,
    activeContributors: 1
  },
  loading: false,

  fetchActivities: async () => {
    set({ loading: true });
    try {
      const data = await api.get('/activities');
      set({ activities: data });
    } catch (e) {
      console.error('Failed to fetch activities:', e);
    } finally {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const data = await api.get('/activities/stats');
      set({ stats: data });
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }
}));
