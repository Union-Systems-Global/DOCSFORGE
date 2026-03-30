import { create } from 'zustand';
import { api } from '@/lib/api';

export interface SavedDocument {
  id: string;
  bankId: string; // The explicit client this document belongs to
  title: string;
  subtitle: string;
  formCode?: string | null;
  parentId: string | null;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  position?: number;
  visibility?: 'all' | 'specific';
  assignedBanks?: string | null;
  isPublished?: boolean;
  isVersion?: boolean;
}

export interface DocumentNode {
  id: string;
  bankId: string;
  title: string;
  subtitle: string;
  formCode?: string | null;
  position?: number;
  visibility?: 'all' | 'specific';
  assignedBanks?: string | null;
  isPublished?: boolean;
  isVersion?: boolean;
  children: DocumentNode[];
}

interface DocumentStore {
  documents: SavedDocument[];
  fetchDocuments: (bankId?: string) => Promise<void>;
  addDocument: (doc: Omit<SavedDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  renameDocument: (id: string, newTitle: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  getDocumentTree: (filterBankId?: string) => DocumentNode[]; // Optional filter for the client portals
  publishDocument: (id: string, published: boolean) => Promise<void>;
  updateFormCode: (id: string, formCode: string) => Promise<void>;
  updateDocument: (id: string, updates: Partial<SavedDocument>) => Promise<void>;
  getDocument: (id: string) => SavedDocument | undefined;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],

  fetchDocuments: async (bankId) => {
    try {
      const endpoint = bankId ? `/documents?bankId=${bankId}` : '/documents';
      const data = await api.get(endpoint);
      set({ documents: data });
    } catch (e) {
      console.error(e);
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

  updateFormCode: async (id, formCode) => {
    try {
      await api.put(`/documents/${id}`, { formCode });
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, formCode, updatedAt: new Date().toISOString() } : doc
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
        d.bankId === filterBankId || 
        d.visibility === 'all' || 
        d.assignedBanks?.split(',').includes(filterBankId)
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
          formCode: d.formCode,
          position: d.position,
          visibility: d.visibility,
          assignedBanks: d.assignedBanks,
          isPublished: d.isPublished,
          isVersion: d.isVersion,
          children: buildTree(d.id),
        }));
    };
    
    return rootDocs.map((d) => ({
      id: d.id,
      bankId: d.bankId,
      title: d.title,
      subtitle: d.subtitle,
      formCode: d.formCode,
      position: d.position,
      visibility: d.visibility,
      assignedBanks: d.assignedBanks,
      isPublished: d.isPublished,
      isVersion: d.isVersion,
      children: buildTree(d.id),
    }));
  },

  getDocument: (id) => get().documents.find((d) => d.id === id),
}));
