import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Bot,
  Cpu,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { type SavedDocument } from "@/stores/documentStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  engine?: "chrome-ai" | "semantic";
}

interface AIAssistantProps {
  activeDoc: SavedDocument | null;
}

// ─── Stopwords ────────────────────────────────────────────────────────────────

// Stop words only used on the DOCUMENT side, not the query side — keeps user terms intact
const DOC_STOP_WORDS = new Set([
  "a","an","the","is","it","in","on","at","to","for","of","and","or","but","be",
  "are","was","were","has","have","had","do","does","did","with","from","by",
  "this","that","these","those","my","your","our","its","me","him","her","us",
  "them","no","so","if","then","than","as","up","out","into","more","also",
  "just","there","their","very",
]);

// Lighter filter for the QUERY — keep meaningful words like "how", "what", "when"
const QUERY_NOISE = new Set(["please","tell","give","show","describe","get","like","make","want","need","can","you"]);

// ─── Semantic Engine ──────────────────────────────────────────────────────────

function tokenizeDoc(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter((t) => t.length > 2 && !DOC_STOP_WORDS.has(t));
}

function tokenizeQuery(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter((t) => t.length > 1 && !QUERY_NOISE.has(t));
}

interface Chunk {
  heading: string;   // parent section heading
  text: string;      // plain text of this chunk
  tokens: string[];  // doc-side tokens
  score: number;
}

/** Extract all text from HTML doc, returning flat sentence-level chunks with parent heading */
function extractChunks(content: string): Chunk[] {
  if (!content) return [];
  const chunks: Chunk[] = [];

  try {
    const parser = new DOMParser();
    const dom = parser.parseFromString(`<div>${content}</div>`, "text/html");
    const container = dom.body.firstChild as HTMLElement;
    if (!container) return [];

    let currentHeading = "Introduction";

    const processNode = (el: Element) => {
      const tag = el.tagName?.toLowerCase();
      if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
        currentHeading = (el.textContent || "").replace(/\s+/g, " ").trim();
        return;
      }
      // paragraph / list item / table cell — split into sentences
      const rawText = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (rawText.length < 15) return;

      // Split by sentence boundaries
      const sentences = rawText
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10);

      // If short enough keep as one chunk, otherwise use sentences
      if (rawText.length <= 200 || sentences.length <= 1) {
        chunks.push({ heading: currentHeading, text: rawText, tokens: tokenizeDoc(rawText), score: 0 });
      } else {
        // Group sentences into ~150-char chunks so context is preserved
        let buf = "";
        for (const s of sentences) {
          if (buf.length + s.length > 200 && buf.length > 0) {
            chunks.push({ heading: currentHeading, text: buf.trim(), tokens: tokenizeDoc(buf), score: 0 });
            buf = s + " ";
          } else {
            buf += s + " ";
          }
        }
        if (buf.trim().length > 10)
          chunks.push({ heading: currentHeading, text: buf.trim(), tokens: tokenizeDoc(buf), score: 0 });
      }
    };

    // Walk all elements
    const all = Array.from(container.querySelectorAll("h1,h2,h3,h4,p,li,td,th,blockquote"));
    for (const el of all) processNode(el);

    // If no elements found, fall back on raw text split
    if (chunks.length === 0) {
      const raw = (container.textContent || "").replace(/\s+/g, " ");
      const words = raw.split(" ");
      for (let i = 0; i < words.length; i += 40) {
        const slice = words.slice(i, i + 40).join(" ").trim();
        if (slice.length > 10)
          chunks.push({ heading: "Document", text: slice, tokens: tokenizeDoc(slice), score: 0 });
      }
    }
  } catch {
    // bare text fallback
    const raw = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
    const words = raw.split(" ");
    for (let i = 0; i < words.length; i += 40) {
      const slice = words.slice(i, i + 40).join(" ").trim();
      if (slice.length > 10)
        chunks.push({ heading: "Document", text: slice, tokens: tokenizeDoc(slice), score: 0 });
    }
  }

  return chunks;
}

function scoreChunk(queryTokens: string[], rawQuery: string, chunk: Chunk): number {
  let score = 0;
  const cText = chunk.text.toLowerCase();
  const cTokenSet: Record<string, number> = {};
  for (const t of chunk.tokens) cTokenSet[t] = (cTokenSet[t] || 0) + 1;

  for (const qt of queryTokens) {
    // Direct substring hit — strongest signal
    if (cText.includes(qt)) score += 2.0;
    // Token frequency match
    if (cTokenSet[qt]) score += cTokenSet[qt] * 0.8;
    // Prefix / stem match
    for (const ct of Object.keys(cTokenSet)) {
      if (ct !== qt && (ct.startsWith(qt) || qt.startsWith(ct)) && Math.abs(ct.length - qt.length) <= 3) {
        score += 0.4;
      }
    }
  }

  // Bonus: raw multi-word phrase appears verbatim
  const phrase = rawQuery.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  if (phrase.length > 4 && cText.includes(phrase)) score += 5.0;

  // Penalise very short chunks slightly
  if (chunk.text.length < 30) score *= 0.7;

  return score;
}

function buildSemanticResponse(prompt: string, doc: SavedDocument): string {
  const pLower = prompt.toLowerCase();
  const queryTokens = tokenizeQuery(prompt);
  const title = doc.title || "this document";
  const subtitle = doc.subtitle || "";

  // ── Strict summarize intent (only explicit summarize requests) ────────────
  const isSummary = /^(summar|give.*summar|overview|brief.*summar|key points|main points|what.*document.*about|tell.*about.*document)/.test(pLower);

  if (isSummary) {
    const chunks = extractChunks(doc.content || "");
    // Collect unique headings in order
    const headings: string[] = [];
    const seen = new Set<string>();
    for (const c of chunks) {
      if (!seen.has(c.heading) && c.heading !== "Introduction") {
        seen.add(c.heading);
        headings.push(c.heading);
      }
    }
    const intro = chunks[0]?.text.slice(0, 220) || subtitle;
    let response = `**${title}**\n\n`;
    if (subtitle) response += `${subtitle}\n\n`;
    if (intro && intro !== subtitle) response += `${intro}${chunks[0]?.text.length > 220 ? "..." : ""}\n\n`;
    if (headings.length > 0)
      response += `**Sections covered:**\n${headings.slice(0, 7).map((h) => `→ ${h}`).join("\n")}`;
    if (doc.activityCode) response += `\n\n*Ref: ${doc.activityCode}*`;
    return response;
  }

  // ── Score every chunk against the query ───────────────────────────────────
  const chunks = extractChunks(doc.content || "");
  if (chunks.length === 0) return `I couldn't extract readable content from **${title}**. The document may still be loading.`;

  const scored = chunks
    .map((c) => ({ ...c, score: scoreChunk(queryTokens, prompt, c) }))
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 3).filter((c) => c.score > 0);

  // ── Nothing matched ───────────────────────────────────────────────────────
  if (top.length === 0) {
    if (/deadline|due date|release|version|when/.test(pLower)) {
      return `I don't see specific dates or deadlines in **${title}** (last updated: ${new Date(doc.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}). Check with the document owner for timelines.`;
    }
    // Surface the headings as hints
    const headingHints = [...new Set(chunks.map((c) => c.heading))].slice(0, 4);
    return `I couldn't find that specific topic in **${title}**. This document covers: ${headingHints.map((h) => `**${h}**`).join(", ")}. Try rephrasing or ask me to summarize it.`;
  }

  // ── Build answer from top matches ─────────────────────────────────────────
  const best = top[0];
  // Highlight the query terms inside the snippet
  const snippet = best.text.length > 320 ? best.text.slice(0, 320) + "..." : best.text;

  let response = `From **"${best.heading}"** in *${title}*:\n\n`;
  response += `"${snippet}"\n\n`;

  // Add up to one more distinct-section match
  const second = top.find((c) => c.heading !== best.heading);
  if (second) {
    const s2 = second.text.length > 200 ? second.text.slice(0, 200) + "..." : second.text;
    response += `Also in **"${second.heading}"**: "${s2}"\n\n`;
  }

  if (doc.activityCode) response += `*Ref: ${doc.activityCode}*`;
  return response;
}

// ─── Chrome Built-in AI ───────────────────────────────────────────────────────

type ChromeAISession = {
  promptStreaming: (prompt: string) => AsyncIterable<string>;
  destroy: () => void;
};

async function tryGetChromeAISession(systemPrompt: string): Promise<ChromeAISession | null> {
  try {
    // @ts-ignore — window.ai is experimental
    const ai = window.ai?.languageModel ?? window.ai;
    if (!ai) return null;
    // new Prompt API shape
    if (ai.capabilities) {
      const caps = await ai.capabilities();
      if (caps?.available === "no") return null;
      return await ai.create({ systemPrompt });
    }
    // legacy shape
    if (ai.canCreateTextSession) {
      const status = await ai.canCreateTextSession();
      if (status === "no") return null;
      return await ai.createTextSession();
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTED = [
  "Summarize this document",
  "What are the key requirements?",
  "Explain the main sections",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AIAssistant({ activeDoc }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [aiEngine, setAiEngine] = useState<"chrome-ai" | "semantic" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<ChromeAISession | null>(null);

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Focus input on open ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  // ── Detect AI engine once ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const session = await tryGetChromeAISession("You are a helpful document assistant.");
      if (session) {
        sessionRef.current = session;
        setAiEngine("chrome-ai");
      } else {
        setAiEngine("semantic");
      }
    })();
    return () => { sessionRef.current?.destroy(); };
  }, []);

  // ── Reset chat when document changes ────────────────────────────────────────
  useEffect(() => {
    if (activeDoc) {
      setMessages([
        {
          id: `welcome-${activeDoc.id}`,
          role: "assistant",
          content: `I've read **"${activeDoc.title}"**. Ask me to summarize it, explain a section, or anything else about this document.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [activeDoc?.id]);

  // ── Send handler ────────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (text: string = input) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        // ── Layer 1: Chrome built-in AI ──────────────────────────────────────
        if (aiEngine === "chrome-ai" && sessionRef.current) {
          const contextSnippet = activeDoc
            ? buildSemanticResponse(trimmed, activeDoc).slice(0, 800)
            : "";
          const fullPrompt = activeDoc
            ? `Document: "${activeDoc.title}"\n\nContext extracted from document:\n${contextSnippet}\n\nUser question: ${trimmed}\n\nAnswer using the context above:`
            : trimmed;

          const assistantId = (Date.now() + 1).toString();
          setMessages((prev) => [
            ...prev,
            { id: assistantId, role: "assistant", content: "", timestamp: new Date(), engine: "chrome-ai" },
          ]);

          let fullText = "";
          try {
            const stream = sessionRef.current.promptStreaming(fullPrompt);
            for await (const chunk of stream) {
              fullText = chunk; // Chrome AI gives cumulative chunks
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: fullText } : m
                )
              );
            }
          } catch {
            // Chrome AI session may have expired — rebuild it
            const newSession = await tryGetChromeAISession(
              "You are a helpful document assistant. Answer questions about the provided document context."
            );
            if (newSession) {
              sessionRef.current?.destroy();
              sessionRef.current = newSession;
              const stream2 = newSession.promptStreaming(fullPrompt);
              for await (const chunk of stream2) {
                fullText = chunk;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullText } : m
                  )
                );
              }
            } else {
              throw new Error("Chrome AI unavailable");
            }
          }
          setIsTyping(false);
          return;
        }

        // ── Layer 2: Semantic engine (instant, zero-download) ────────────────
        await new Promise((r) => setTimeout(r, 180)); // tiny delay so typing indicator shows
        const response = activeDoc
          ? buildSemanticResponse(trimmed, activeDoc)
          : "Please open a document first so I can help you understand it.";

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response,
            timestamp: new Date(),
            engine: "semantic",
          },
        ]);
      } catch (err) {
        console.error("AI error:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I encountered an issue processing your request. Please try again.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, isTyping, aiEngine, activeDoc]
  );

  // ─── Render message content (support basic **bold** and → bullets) ─────────
  const renderContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const formatted = parts.map((part, j) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={j}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={j}>{part}</span>
        )
      );
      return (
        <span key={i} className="block">
          {formatted}
          {i < lines.length - 1 && line === "" && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-[100] h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-primary/30 ring-4 ring-primary/10"
          >
            <Bot className="h-6 w-6" />
            {/* Live indicator */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-background" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className={cn(
              "fixed bottom-6 right-6 z-[100] w-[420px] h-[620px] flex flex-col rounded-3xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] overflow-hidden border",
              "bg-[#111111] text-zinc-100 border-white/10",
              "dark:bg-[#fafafa] dark:text-zinc-900 dark:border-black/10"
            )}
          >
            {/* Header */}
            <div className={cn(
              "px-5 py-4 border-b flex items-center justify-between shrink-0",
              "bg-white/[0.04] border-white/10",
              "dark:bg-black/[0.04] dark:border-black/10"
            )}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-[13px] font-black tracking-tight leading-none mb-1">Doc AI</div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      {aiEngine === "chrome-ai" ? (
                        <span className="flex items-center gap-1"><Cpu className="h-2.5 w-2.5 inline" /> On-device AI</span>
                      ) : (
                        <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5 inline" /> Semantic Engine</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Context badge */}
                {activeDoc && (
                  <div className="hidden sm:flex max-w-[120px] items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary truncate">
                    <span className="truncate">{activeDoc.title}</span>
                  </div>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-100 hover:bg-white/10 dark:hover:text-zinc-900 dark:hover:bg-black/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
              {messages.length === 0 && !activeDoc && (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 dark:bg-black/5 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-zinc-300 dark:text-zinc-700">Open a document to get started</p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Select any document from the sidebar and I'll help you understand it instantly.
                  </p>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : cn(
                          "rounded-tl-sm border",
                          "bg-white/[0.06] border-white/8 text-zinc-200",
                          "dark:bg-black/[0.06] dark:border-black/8 dark:text-zinc-800"
                        )
                  )}>
                    {m.content ? renderContent(m.content) : (
                      <span className="opacity-40 italic text-xs">Thinking...</span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                      {m.role === "user" ? "You" : "AI"}
                    </span>
                    {m.engine === "chrome-ai" && (
                      <span className="text-[8px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest">· on-device</span>
                    )}
                    {m.engine === "semantic" && (
                      <span className="text-[8px] font-bold text-emerald-400 dark:text-emerald-600 uppercase tracking-widest">· instant</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 ml-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce"
                        style={{ animationDelay: `${i * 0.12}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Analyzing...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts — show when few messages */}
            {messages.length <= 1 && !isTyping && activeDoc && (
              <div className="px-5 pb-3 flex flex-col gap-1.5 shrink-0">
                {SUGGESTED.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className={cn(
                      "text-[11px] font-bold px-4 py-2 rounded-xl border text-left transition-all",
                      "bg-white/[0.04] border-white/8 text-zinc-400 hover:text-zinc-100 hover:bg-primary/15 hover:border-primary/30",
                      "dark:bg-black/[0.04] dark:border-black/8 dark:text-zinc-500 dark:hover:text-zinc-900 dark:hover:bg-primary/8 dark:hover:border-primary/20"
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className={cn(
                "px-5 py-4 border-t mt-auto shrink-0",
                "border-white/8 bg-white/[0.03]",
                "dark:border-black/8 dark:bg-black/[0.03]"
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={activeDoc ? `Ask about "${activeDoc.title}"...` : "Open a document first..."}
                  disabled={!activeDoc}
                  className={cn(
                    "flex-1 bg-transparent text-[13px] outline-none",
                    "placeholder:text-zinc-600 dark:placeholder:text-zinc-400",
                    "disabled:opacity-40"
                  )}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || !activeDoc}
                  className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-30 transition-all active:scale-95 hover:bg-primary/90"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-center mt-2.5">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700 dark:text-zinc-400">
                  USG Doc AI · Zero-latency engine
                </span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
