import { create } from 'zustand';
import { api } from '@/lib/api';

export interface SavedDocument {
  id: string;
  bankId: string; // The explicit client this document belongs to
  title: string;
  subtitle: string;
  activityCode?: string | null;
  parentId: string | null;
  content?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  position?: number;
  visibility?: 'all' | 'specific';
  assignedBanks?: string | null;
  isPublished?: boolean;
  isVersion?: boolean;
  versionLabel?: string | null;
}

export interface DocumentNode {
  id: string;
  bankId: string;
  title: string;
  subtitle: string;
  activityCode?: string | null;
  position?: number;
  visibility?: 'all' | 'specific';
  assignedBanks?: string | null;
  isPublished?: boolean;
  isVersion?: boolean;
  versionLabel?: string | null;
  children: DocumentNode[];
}
interface DocumentStore {
  documents: SavedDocument[];
  isLoading: boolean;
  lastFetchedBankId: string | null;
  lastFetchedWasAdmin: boolean | null;
  fetchDocuments: (bankId?: string, isAdmin?: boolean) => Promise<void>;
  addDocument: (doc: Omit<SavedDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  renameDocument: (id: string, newTitle: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  getDocumentTree: (filterBankId?: string) => DocumentNode[]; // Optional filter for the client portals
  publishDocument: (id: string, published: boolean) => Promise<void>;
  updateActivityCode: (id: string, activityCode: string) => Promise<void>;
  updateDocument: (id: string, updates: Partial<SavedDocument>) => Promise<void>;
  getDocument: (id: string) => SavedDocument | undefined;
  fetchDocumentContent: (id: string) => Promise<SavedDocument | undefined>;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  isLoading: false,
  lastFetchedBankId: null,
  lastFetchedWasAdmin: null,

  fetchDocuments: async (bankId, isAdmin) => {
    // Basic caching logic:
    // 1. If fetching as admin and we already fetched as admin and have documents, skip
    if (isAdmin && get().lastFetchedWasAdmin && get().documents.length > 0) {
      return;
    }
    // 2. If fetching for a bank and we already fetched for this bank and have documents, skip
    if (bankId && bankId === get().lastFetchedBankId && !get().lastFetchedWasAdmin && get().documents.length > 0) {
      return;
    }

    set({ isLoading: true });
    try {
      let endpoint = '/documents';
      const params = new URLSearchParams();
      
      if (bankId) params.append('bankId', bankId);
      if (isAdmin) params.append('admin', 'true');
      
      const queryString = params.toString();
      if (queryString) endpoint += `?${queryString}`;
      
      const data = await api.get(endpoint);
      set({ 
        documents: data, 
        lastFetchedBankId: bankId || null,
        lastFetchedWasAdmin: !!isAdmin
      });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDocumentContent: async (id: string) => {
    const doc = get().documents.find(d => d.id === id);
    if (doc && doc.content !== undefined) {
      return doc;
    }
    try {
      const data = await api.get(`/documents/${id}`);
      set((state) => ({
        documents: state.documents.map(d => d.id === id ? { ...d, content: data.content } : d)
      }));
      return get().documents.find(d => d.id === id);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  addDocument: async (doc) => {
    const id = `sd-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newDoc = {
      ...doc,
      id,
      isPublished: doc.isPublished ?? false
    };
    
    try {
      await api.post('/documents', newDoc);
      // Construct a complete object for the local state prediction
      const fullDoc: SavedDocument = {
        ...newDoc,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      set((state) => ({ documents: [fullDoc, ...state.documents] }));
      return id;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  renameDocument: async (id, newTitle) => {
    try {
      await api.put(`/documents/${id}`, { title: newTitle });
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, title: newTitle, updatedAt: new Date().toISOString() } : doc
        ),
      }));
    } catch (e) {
      console.error(e);
    }
  },

  deleteDocument: async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      set((state) => {
        // Find all IDs to delete locally (this node + all descendants recursively)
        const idsToDelete = new Set<string>();
        const addIdAndChildren = (targetId: string) => {
          idsToDelete.add(targetId);
          state.documents.filter(d => d.parentId === targetId).forEach(child => {
            addIdAndChildren(child.id);
          });
        };
        
        addIdAndChildren(id);

        return {
          documents: state.documents.filter(doc => !idsToDelete.has(doc.id)),
        };
      });
    } catch (e) {
      console.error(e);
    }
  },

  publishDocument: async (id, published) => {
    try {
      await api.put(`/documents/${id}`, { isPublished: published });
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, isPublished: published, updatedAt: new Date().toISOString() } : doc
        ),
      }));
    } catch (e) {
      console.error(e);
    }
  },

  updateActivityCode: async (id, activityCode) => {
    try {
      await api.put(`/documents/${id}`, { activityCode });
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, activityCode, updatedAt: new Date().toISOString() } : doc
        ),
      }));
    } catch (e) {
      console.error(e);
    }
  },

  updateDocument: async (id: string, updates: Partial<SavedDocument>) => {
    try {
      await api.put(`/documents/${id}`, updates);
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
        ),
      }));
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  getDocumentTree: (filterBankId?: string) => {
    // If a filterBankId is provided (e.g., from a client portal), strictly filter by it
    let docs = get().documents;
    if (filterBankId) {
      docs = docs.filter(d => 
        (d.bankId === filterBankId || 
         d.visibility === 'all' || 
         d.assignedBanks?.split(',').includes(filterBankId)) &&
        d.isPublished === true
      );
    }

    const rootDocs = docs.filter((d) => !d.parentId || !docs.some(other => other.id === d.parentId)).sort((a, b) => {
      if (a.position !== undefined && b.position !== undefined && a.position !== b.position) {
        return a.position - b.position;
      }
      return a.title.localeCompare(b.title);
    });
    
    const buildTree = (parentId: string): DocumentNode[] => {
      return docs
        .filter((d) => d.parentId === parentId)
        .sort((a, b) => {
          if (a.isVersion && b.isVersion) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          if (a.position !== undefined && b.position !== undefined && a.position !== b.position) {
            return a.position - b.position;
          }
          return a.title.localeCompare(b.title);
        })
        .map((d) => ({
          id: d.id,
          bankId: d.bankId,
          title: d.title,
          subtitle: d.subtitle,
          activityCode: d.activityCode,
          position: d.position,
          visibility: d.visibility,
          assignedBanks: d.assignedBanks,
          isPublished: d.isPublished,
          isVersion: d.isVersion,
          versionLabel: d.versionLabel,
          children: buildTree(d.id),
        }));
    };
    
    return rootDocs.map((d) => ({
      id: d.id,
      bankId: d.bankId,
      title: d.title,
      subtitle: d.subtitle,
      activityCode: d.activityCode,
      position: d.position,
      visibility: d.visibility,
      assignedBanks: d.assignedBanks,
      isPublished: d.isPublished,
      isVersion: d.isVersion,
      versionLabel: d.versionLabel,
      children: buildTree(d.id),
    }));
  },

  getDocument: (id) => get().documents.find((d) => d.id === id),
}));
