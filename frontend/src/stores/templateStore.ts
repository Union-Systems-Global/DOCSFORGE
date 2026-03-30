import { create } from 'zustand';
import { api } from '@/lib/api';
import { templates as predefinedTemplates, type Template } from '@/data/mockData';

export interface CustomTemplate extends Template {
  isCustom: boolean;
  category: string;
  content?: string;
}

interface TemplateStore {
  customTemplates: CustomTemplate[];
  loading: boolean;
  fetchTemplates: () => Promise<void>;
  addCustomTemplate: (template: Omit<CustomTemplate, 'id' | 'isCustom'>) => Promise<string>;
  deleteCustomTemplate: (id: string) => Promise<void>;
  getAllTemplates: () => (Template & { isCustom?: boolean, category?: string, content?: string })[];
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  customTemplates: [],
  loading: false,

  fetchTemplates: async () => {
    set({ loading: true });
    try {
      const data = await api.get('/templates');
      set({ customTemplates: data.map((t: any) => ({ ...t, isCustom: true })) });
    } catch (e) {
      console.error('Failed to fetch templates:', e);
    } finally {
      set({ loading: false });
    }
  },

  addCustomTemplate: async (template) => {
    const id = `tpl-${Date.now()}`;
    const newTemplate = { ...template, id, isCustom: true };
    try {
      await api.post('/templates', newTemplate);
      set((state) => ({
        customTemplates: [newTemplate, ...state.customTemplates],
      }));
    } catch (e) {
      console.error('Failed to save template:', e);
    }
    return id;
  },

  deleteCustomTemplate: async (id) => {
    try {
      await api.delete(`/templates/${id}`);
      set((state) => ({
        customTemplates: state.customTemplates.filter((t) => t.id !== id),
      }));
    } catch (e) {
      console.error('Failed to delete template:', e);
    }
  },

  getAllTemplates: () => {
    const standard = predefinedTemplates.map(t => ({ ...t, isCustom: false, category: "Standard" }));
    return [...get().customTemplates, ...standard];
  },
}));

