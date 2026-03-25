import { create } from 'zustand';

export interface SavedDocument {
  id: string;
  title: string;
  subtitle: string;
  parentId: string | null;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentNode {
  id: string;
  title: string;
  children: DocumentNode[];
}

interface DocumentStore {
  documents: SavedDocument[];
  addDocument: (doc: Omit<SavedDocument, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getDocumentTree: () => DocumentNode[];
  getDocument: (id: string) => SavedDocument | undefined;
}

// Initial mock saved documents
const initialDocuments: SavedDocument[] = [
  {
    id: 'sd-1',
    title: 'Payment Gateway',
    subtitle: '',
    parentId: null,
    content: '# Payment Gateway\n\nCore payment processing system documentation.',
    author: 'Sarah Chen',
    createdAt: '2026-03-20T10:00:00',
    updatedAt: '2026-03-24T14:30:00',
  },
  {
    id: 'sd-2',
    title: 'API Reference',
    subtitle: '',
    parentId: 'sd-1',
    content: '# API Reference\n\n## Endpoints\n\n### POST /api/v1/payments\n\nCreate a new payment transaction.\n\n**Request Body:**\n```json\n{\n  "amount": 1000,\n  "currency": "USD",\n  "method": "card"\n}\n```\n\n**Response:**\n```json\n{\n  "id": "txn_123",\n  "status": "pending"\n}\n```',
    author: 'Sarah Chen',
    createdAt: '2026-03-21T09:00:00',
    updatedAt: '2026-03-24T14:30:00',
  },
  {
    id: 'sd-3',
    title: 'Architecture Overview',
    subtitle: '',
    parentId: 'sd-1',
    content: '# Architecture Overview\n\n## System Design\n\nThe payment gateway uses a microservices architecture with the following components:\n\n- **Gateway Service** — Routes and validates incoming requests\n- **Processing Engine** — Handles transaction logic\n- **Settlement Service** — Manages fund transfers\n\n## Data Flow\n\n1. Client sends payment request\n2. Gateway validates and authenticates\n3. Processing engine creates transaction\n4. Settlement service initiates transfer',
    author: 'James Wilson',
    createdAt: '2026-03-22T11:00:00',
    updatedAt: '2026-03-23T09:00:00',
  },
  {
    id: 'sd-4',
    title: 'User Auth Service',
    subtitle: '',
    parentId: null,
    content: '# User Auth Service\n\nAuthentication and authorization microservice with OAuth2 and SSO support.',
    author: 'Alex Kim',
    createdAt: '2026-03-19T08:00:00',
    updatedAt: '2026-03-23T10:15:00',
  },
  {
    id: 'sd-5',
    title: 'OAuth2 Implementation',
    subtitle: '',
    parentId: 'sd-4',
    content: '# OAuth2 Implementation\n\n## Flow\n\n1. User clicks "Sign in with Google"\n2. Redirect to OAuth provider\n3. Provider returns authorization code\n4. Exchange code for access token\n5. Validate token and create session\n\n## Configuration\n\n```env\nOAUTH_CLIENT_ID=your_client_id\nOAUTH_CLIENT_SECRET=your_secret\nOAUTH_REDIRECT_URI=https://app.example.com/callback\n```',
    author: 'Alex Kim',
    createdAt: '2026-03-20T14:00:00',
    updatedAt: '2026-03-23T10:15:00',
  },
  {
    id: 'sd-6',
    title: 'SSO Configuration',
    subtitle: '',
    parentId: 'sd-4',
    content: '# SSO Configuration\n\n## SAML Setup\n\nConfigure your identity provider with the following settings:\n\n- **Entity ID:** `https://auth.example.com/saml`\n- **ACS URL:** `https://auth.example.com/saml/callback`\n- **SLO URL:** `https://auth.example.com/saml/logout`',
    author: 'Sarah Chen',
    createdAt: '2026-03-21T16:00:00',
    updatedAt: '2026-03-22T11:00:00',
  },
  {
    id: 'sd-7',
    title: 'Data Analytics Platform',
    subtitle: '',
    parentId: null,
    content: '# Data Analytics Platform\n\nReal-time analytics engine for business intelligence and reporting.',
    author: 'David Lee',
    createdAt: '2026-03-18T10:00:00',
    updatedAt: '2026-03-22T11:20:00',
  },
];

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: initialDocuments,

  addDocument: (doc) => {
    const now = new Date().toISOString();
    const newDoc: SavedDocument = {
      ...doc,
      id: `sd-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ documents: [...state.documents, newDoc] }));
  },

  getDocumentTree: () => {
    const docs = get().documents;
    const rootDocs = docs.filter((d) => !d.parentId);
    const buildTree = (parentId: string): DocumentNode[] => {
      return docs
        .filter((d) => d.parentId === parentId)
        .map((d) => ({
          id: d.id,
          title: d.title,
          children: buildTree(d.id),
        }));
    };
    return rootDocs.map((d) => ({
      id: d.id,
      title: d.title,
      children: buildTree(d.id),
    }));
  },

  getDocument: (id) => get().documents.find((d) => d.id === id),
}));
