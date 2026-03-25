import { Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered, Code, Quote, Table, Image, Minus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const toolbarGroups = [
  [
    { icon: Bold, label: "Bold", shortcut: "⌘B" },
    { icon: Italic, label: "Italic", shortcut: "⌘I" },
    { icon: Underline, label: "Underline", shortcut: "⌘U" },
  ],
  [
    { icon: Heading1, label: "Heading 1" },
    { icon: Heading2, label: "Heading 2" },
  ],
  [
    { icon: List, label: "Bullet List" },
    { icon: ListOrdered, label: "Numbered List" },
  ],
  [
    { icon: Code, label: "Code Block" },
    { icon: Quote, label: "Quote" },
    { icon: Table, label: "Table" },
    { icon: Image, label: "Image" },
    { icon: Minus, label: "Divider" },
  ],
];

interface Props {
  initialContent?: string;
  onChange?: (content: string) => void;
}

export function DocumentEditor({ initialContent, onChange }: Props) {
  const [content, setContent] = useState(
    initialContent ||
      `# Getting Started\n\nWelcome to the documentation editor. Start writing your documentation here.\n\n## Overview\n\nThis section provides a high-level overview of the system.\n\n## Architecture\n\nDescribe the system architecture, including:\n\n- Component diagrams\n- Data flow\n- Integration points\n\n## API Reference\n\n\`\`\`json\n{\n  "endpoint": "/api/v1/resource",\n  "method": "GET",\n  "response": {\n    "status": 200,\n    "data": []\n  }\n}\n\`\`\`\n\n> **Note:** All endpoints require authentication via Bearer token.\n\n## Deployment\n\n1. Clone the repository\n2. Install dependencies\n3. Configure environment variables\n4. Run deployment script`
  );

  const handleChange = (val: string) => {
    setContent(val);
    onChange?.(val);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-2 flex items-center gap-0.5 flex-wrap">
        {toolbarGroups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <div className="w-px h-5 bg-border mx-1" />}
            {group.map((tool) => (
              <button
                key={tool.label}
                title={tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label}
                className="h-8 w-8 rounded flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <tool.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <div className="max-w-[840px] mx-auto py-8 px-6">
          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full min-h-[600px] bg-transparent text-sm leading-relaxed resize-none focus:outline-none font-mono"
            placeholder="Start writing..."
          />
        </div>
      </div>
    </div>
  );
}
