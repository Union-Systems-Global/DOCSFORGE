import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <FileText className="h-12 w-12 text-muted-foreground/30" />
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate("/")}
        className="h-9 px-4 rounded bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
