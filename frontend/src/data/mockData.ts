export interface Project {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  lastUpdated: string;
  tags: string[];
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  content: string;
  lastUpdated: string;
  author: string;
  tags: string[];
}

export interface Version {
  id: string;
  documentId: string;
  version: number;
  date: string;
  author: string;
  summary: string;
  content: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Activity {
  id: string;
  type: "created" | "updated" | "deleted";
  entity: "document" | "project";
  entityName: string;
  projectName: string;
  author: string;
  date: string;
}

export interface DocPage {
  id: string;
  title: string;
  children?: DocPage[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  sections: string[];
}

export const tags: Tag[] = [
  { id: "1", name: "API", color: "blue" },
  { id: "2", name: "Security", color: "red" },
  { id: "3", name: "Payments", color: "green" },
  { id: "4", name: "Database", color: "purple" },
  { id: "5", name: "Authentication", color: "orange" },
  { id: "6", name: "Infrastructure", color: "teal" },
  { id: "7", name: "Frontend", color: "pink" },
  { id: "8", name: "Backend", color: "indigo" },
];

export const projects: Project[] = [
  { id: "1", name: "Payment Gateway", description: "Core payment processing system handling transactions, refunds, and settlements.", documentCount: 12, lastUpdated: "2026-03-24", tags: ["API", "Payments", "Security"] },
  { id: "2", name: "User Auth Service", description: "Authentication and authorization microservice with OAuth2 and SSO support.", documentCount: 8, lastUpdated: "2026-03-23", tags: ["Authentication", "Security", "API"] },
  { id: "3", name: "Data Analytics Platform", description: "Real-time analytics engine for business intelligence and reporting.", documentCount: 15, lastUpdated: "2026-03-22", tags: ["Database", "Backend", "Infrastructure"] },
  { id: "4", name: "Mobile App Backend", description: "REST API backend serving the iOS and Android mobile applications.", documentCount: 10, lastUpdated: "2026-03-21", tags: ["API", "Backend"] },
  { id: "5", name: "Admin Dashboard", description: "Internal administration panel for system management and monitoring.", documentCount: 6, lastUpdated: "2026-03-20", tags: ["Frontend", "Infrastructure"] },
  { id: "6", name: "Notification Service", description: "Multi-channel notification system supporting email, SMS, and push notifications.", documentCount: 7, lastUpdated: "2026-03-19", tags: ["Backend", "Infrastructure"] },
];

export const documents: Document[] = [
  { id: "1", projectId: "1", title: "API Reference", content: "Complete API reference for the Payment Gateway...", lastUpdated: "2026-03-24", author: "Sarah Chen", tags: ["API"] },
  { id: "2", projectId: "1", title: "Architecture Overview", content: "System architecture and design decisions...", lastUpdated: "2026-03-23", author: "James Wilson", tags: ["Infrastructure"] },
  { id: "3", projectId: "1", title: "Deployment Guide", content: "Step-by-step deployment instructions...", lastUpdated: "2026-03-22", author: "Maria Garcia", tags: ["Infrastructure"] },
  { id: "4", projectId: "2", title: "OAuth2 Implementation", content: "OAuth2 flow implementation details...", lastUpdated: "2026-03-23", author: "Alex Kim", tags: ["Authentication", "Security"] },
  { id: "5", projectId: "2", title: "SSO Configuration", content: "Single sign-on setup and configuration...", lastUpdated: "2026-03-21", author: "Sarah Chen", tags: ["Authentication"] },
  { id: "6", projectId: "3", title: "Data Pipeline Docs", content: "Documentation for the ETL pipeline...", lastUpdated: "2026-03-22", author: "David Lee", tags: ["Database", "Backend"] },
  { id: "7", projectId: "3", title: "Query Optimization Guide", content: "Best practices for query optimization...", lastUpdated: "2026-03-20", author: "James Wilson", tags: ["Database"] },
  { id: "8", projectId: "4", title: "REST API Endpoints", content: "All REST endpoints for the mobile backend...", lastUpdated: "2026-03-21", author: "Maria Garcia", tags: ["API"] },
];

export const versions: Version[] = [
  { id: "1", documentId: "1", version: 3, date: "2026-03-24", author: "Sarah Chen", summary: "Updated authentication headers section", content: "Version 3 content..." },
  { id: "2", documentId: "1", version: 2, date: "2026-03-20", author: "James Wilson", summary: "Added rate limiting documentation", content: "Version 2 content..." },
  { id: "3", documentId: "1", version: 1, date: "2026-03-15", author: "Sarah Chen", summary: "Initial API reference document", content: "Version 1 content..." },
  { id: "4", documentId: "2", version: 2, date: "2026-03-23", author: "James Wilson", summary: "Updated architecture diagrams", content: "Version 2 content..." },
  { id: "5", documentId: "2", version: 1, date: "2026-03-18", author: "James Wilson", summary: "Initial architecture document", content: "Version 1 content..." },
];

export const activities: Activity[] = [
  { id: "1", type: "updated", entity: "document", entityName: "API Reference", projectName: "Payment Gateway", author: "Sarah Chen", date: "2026-03-24T14:30:00" },
  { id: "2", type: "created", entity: "document", entityName: "SSO Configuration", projectName: "User Auth Service", author: "Alex Kim", date: "2026-03-23T10:15:00" },
  { id: "3", type: "updated", entity: "document", entityName: "Architecture Overview", projectName: "Payment Gateway", author: "James Wilson", date: "2026-03-23T09:00:00" },
  { id: "4", type: "created", entity: "project", entityName: "Notification Service", projectName: "Notification Service", author: "Maria Garcia", date: "2026-03-22T16:45:00" },
  { id: "5", type: "updated", entity: "document", entityName: "Data Pipeline Docs", projectName: "Data Analytics Platform", author: "David Lee", date: "2026-03-22T11:20:00" },
  { id: "6", type: "deleted", entity: "document", entityName: "Legacy API Docs", projectName: "Mobile App Backend", author: "Alex Kim", date: "2026-03-21T15:00:00" },
  { id: "7", type: "created", entity: "document", entityName: "REST API Endpoints", projectName: "Mobile App Backend", author: "Maria Garcia", date: "2026-03-21T08:30:00" },
  { id: "8", type: "updated", entity: "document", entityName: "Query Optimization Guide", projectName: "Data Analytics Platform", author: "James Wilson", date: "2026-03-20T13:45:00" },
];

export const projectPages: Record<string, DocPage[]> = {
  "1": [
    { id: "p1", title: "Overview" },
    { id: "p2", title: "Architecture", children: [
      { id: "p2-1", title: "System Design" },
      { id: "p2-2", title: "Data Flow" },
    ]},
    { id: "p3", title: "API Documentation", children: [
      { id: "p3-1", title: "Authentication" },
      { id: "p3-2", title: "Endpoints" },
      { id: "p3-3", title: "Error Codes" },
    ]},
    { id: "p4", title: "Database Documentation" },
    { id: "p5", title: "Deployment Guide" },
    { id: "p6", title: "User Guide" },
  ],
  "2": [
    { id: "p1", title: "Overview" },
    { id: "p2", title: "OAuth2 Implementation" },
    { id: "p3", title: "SSO Configuration" },
    { id: "p4", title: "Security Best Practices" },
  ],
};

export const templates: Template[] = [
  {
    id: "1",
    name: "Software Overview",
    description: "General overview template for any software system",
    sections: ["System Name", "Description", "Purpose", "Key Features", "Dependencies", "Architecture", "Deployment"],
  },
  {
    id: "2",
    name: "API Documentation",
    description: "Template for documenting REST API endpoints",
    sections: ["Endpoint", "Method", "Request Parameters", "Request Example", "Response Example", "Error Codes"],
  },
  {
    id: "3",
    name: "Deployment Guide",
    description: "Step-by-step deployment instructions template",
    sections: ["Environment Requirements", "Installation Steps", "Configuration", "Deployment Commands", "Verification", "Rollback Procedure"],
  },
  {
    id: "4",
    name: "Database Schema",
    description: "Template for documenting database schemas and models",
    sections: ["Overview", "Tables / Collections", "Relationships", "Indexes", "Migration Guide"],
  },
  {
    id: "5",
    name: "Architecture Decision Record",
    description: "Template for recording architecture decisions",
    sections: ["Title", "Status", "Context", "Decision", "Consequences", "Alternatives Considered"],
  },
];
