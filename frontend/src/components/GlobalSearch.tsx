import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, CornerDownLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore, SavedDocument } from '@/stores/documentStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalSearchProps {
  linkId: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ linkId }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SavedDocument[]>([]);
  const { documents } = useDocumentStore();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter logic
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    
    const filtered = documents.filter(doc => 
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      doc.content.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6); // Limit to 6 results for the inline view
    
    setResults(filtered);
  }, [query, documents]);

  // Handle document selection
  const onSelect = (doc: SavedDocument) => {
    const queryVal = doc.activityCode ? encodeURIComponent(doc.activityCode) : `docId=${doc.id}`;
    navigate(`/portal/${linkId}/docs?${queryVal}`);
    setIsOpen(false);
    setQuery("");
  };

  // Content Keyword Extractor (Finds snippet of content where search term matches)
  const getContextSnippet = (content: string, q: string) => {
    if (!q || q.length < 3) return null;
    const cleanContent = content.replace(/<[^>]*>/g, ' ');
    const index = cleanContent.toLowerCase().indexOf(q.toLowerCase());
    if (index === -1) return null;
    const start = Math.max(0, index - 40);
    const end = Math.min(cleanContent.length, index + q.length + 60);
    let snippet = cleanContent.substring(start, end).trim();
    if (start > 0) snippet = "..." + snippet;
    if (end < cleanContent.length) snippet = snippet + "...";
    return snippet;
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-sm">
      <div className="relative flex items-center">
        <Search className={cn(
          "absolute left-3 w-4 h-4 transition-colors duration-300", 
          isOpen ? "text-primary" : "text-muted-foreground/60"
        )} />
        <input 
          type="text"
          placeholder="Global search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          className={cn(
            "h-9 w-full bg-muted/40 hover:bg-muted/60 border border-transparent focus:border-primary/20 rounded-full pl-9 pr-10 text-sm focus:ring-2 ring-primary/5 transition-all outline-none backdrop-blur-sm",
            isOpen && query && "rounded-b-none border-b-0 hover:bg-muted/40"
          )}
        />
        {query && (
          <button 
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 p-0.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            className="absolute top-full left-0 right-0 z-50 bg-background/95 backdrop-blur-2xl border border-primary/20 border-t-0 rounded-b-3xl shadow-[0_20px_50px_-15px_rgba(var(--primary),0.2)] overflow-hidden"
          >
            <div className="py-2 max-h-[400px] overflow-y-auto no-scrollbar">
              {results.length > 0 ? (
                <>
                  <div className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 select-none">Documentation Results</div>
                  {results.map((doc) => {
                    const snippet = getContextSnippet(doc.content, query);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => onSelect(doc)}
                        className="group flex flex-col gap-1 px-4 py-3 cursor-pointer hover:bg-primary/10 transition-all duration-200 border-l-2 border-transparent hover:border-primary"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold transition-colors group-hover:text-primary leading-tight">{doc.title}</span>
                              <span className="text-[10px] text-muted-foreground/70">{doc.subtitle}</span>
                            </div>
                          </div>
                          <CornerDownLeft className="h-3 w-3 text-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {snippet && (
                          <div className="pl-6">
                            <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic line-clamp-1">
                              {snippet}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="px-6 py-10 text-center flex flex-col items-center gap-2">
                   <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center mb-1">
                      <Search className="w-4 h-4 text-muted-foreground/50" />
                   </div>
                   <p className="text-xs font-medium text-muted-foreground">No matches for "{query}"</p>
                   <p className="text-[10px] text-muted-foreground/40">Try searching for technical terms or modules.</p>
                </div>
              )}
            </div>
            
            <div className="bg-muted/10 px-4 py-2 flex items-center justify-between border-t border-border/40">
               <span className="text-[9px] text-muted-foreground/50 font-medium">ESC to close</span>
               <div className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-primary/40" />
                  <span className="text-[9px] text-muted-foreground/50 font-black tracking-widest uppercase">Global Portal</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
