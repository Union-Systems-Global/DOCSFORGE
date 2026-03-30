import { create } from 'zustand';
import { api } from '@/lib/api';

export type PortalType = 'bank' | 'developer';

export interface PortalUser {
  id: string; // The "magic link" ID
  name: string; // "Bank of America" or "Internal USG Developer"
  bankCode?: string; // e.g. "BOA-001"
  logoUrl?: string;
  type: PortalType;
  createdAt: string;
}

interface PortalStore {
  portals: PortalUser[];
  fetchPortals: () => Promise<void>;
  addPortal: (name: string, type: PortalType, bankCode?: string, logoUrl?: string) => Promise<PortalUser>;
  updatePortal: (id: string, updates: Partial<Omit<PortalUser, 'id' | 'type'>>) => Promise<void>;
  deletePortal: (id: string) => Promise<void>;
  getPortal: (id: string) => PortalUser | undefined;
  getBanks: () => PortalUser[];
}

export const usePortalStore = create<PortalStore>((set, get) => ({
  portals: [],

  fetchPortals: async () => {
    try {
      const data = await api.get('/portals');
      set({ portals: data });
    } catch (e) {
      console.error(e);
    }
  },

  addPortal: async (name, type, bankCode, logoUrl) => {
    const id = `${type}-${Math.random().toString(36).substring(2, 10)}`;
    const newPortal = {
      id,
      name,
      bankCode: bankCode || null,
      logoUrl: logoUrl || null,
      type
    };
    
    try {
      const savedPortal = await api.post('/portals', newPortal);
      set((state) => ({ portals: [savedPortal, ...state.portals] }));
      return savedPortal;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  updatePortal: async (id, updates) => {
    try {
      await api.put(`/portals/${id}`, updates);
      set((state) => ({
        portals: state.portals.map(p => p.id === id ? { ...p, ...updates } : p)
      }));
    } catch (e) {
      console.error(e);
    }
  },

  deletePortal: async (id) => {
    try {
      await api.delete(`/portals/${id}`);
      set((state) => ({
        portals: state.portals.filter(p => p.id !== id)
      }));
    } catch (e) {
      console.error(e);
    }
  },

  getPortal: (id) => get().portals.find(p => p.id === id),
  
  getBanks: () => get().portals.filter(p => p.type === 'bank')
}));
