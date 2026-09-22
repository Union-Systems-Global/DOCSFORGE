import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import DocumentsPage from "./pages/DocumentsPage";
import CreateDocumentPage from "./pages/CreateDocumentPage";
import ActivityPage from "./pages/ActivityPage";
import TemplatesPage from "./pages/TemplatesPage";
import SettingsPage from "./pages/SettingsPage";
import PortalSetupPage from "./pages/PortalSetupPage";
import PortalLandingPage from "./pages/PortalLandingPage";
import DocsViewer from "./pages/DocsViewer";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { usePortalStore } from "./stores/portalStore";
import { useDocumentStore } from "./stores/documentStore";
import { ElegantLoader } from "@/components/SkeletonLoaders";

const DataLoader = ({ children }: { children: React.ReactNode }) => {
  const fetchPortals = usePortalStore(s => s.fetchPortals);
  const portalsLoading = usePortalStore(s => s.isLoading);
  const portals = usePortalStore(s => s.portals);
  
  const fetchDocuments = useDocumentStore(s => s.fetchDocuments);
  const documentsLoading = useDocumentStore(s => s.isLoading);
  const documents = useDocumentStore(s => s.documents);

  const location = useLocation();
  const isPortalRoute = location.pathname.startsWith("/portal/");

  useEffect(() => {
    fetchPortals();
    if (!isPortalRoute) {
      // Only fetch as admin (including drafts) if we are on an admin dashboard route
      fetchDocuments(undefined, true);
    }
  }, [fetchPortals, fetchDocuments, isPortalRoute]);



  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Toaster />
      <Sonner />
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <BrowserRouter>
          <DataLoader>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/create-new" element={<CreateDocumentPage />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId" element={<ProjectWorkspace />} />
              <Route path="/projects/:projectId/docs/:docId" element={<ProjectWorkspace />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/setup" element={<PortalSetupPage />} />
              <Route path="/portal/:linkId" element={<PortalLandingPage />} />
              <Route path="/portal/:linkId/docs" element={<DocsViewer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DataLoader>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
