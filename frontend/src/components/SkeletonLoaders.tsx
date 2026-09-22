import React from "react";
import { cn } from "@/lib/utils";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-muted/40 rounded-md", className)} />
);

export const SidebarSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="space-y-3">
      <Skeleton className="h-4 w-24 mb-4" />
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-1">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
    <div className="space-y-3 pt-6 border-t border-border/50">
      <Skeleton className="h-4 w-32 mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-2 py-1">
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export const ContentSkeleton = () => (
  <div className="w-full max-w-4xl mx-auto px-6 lg:px-12 py-12 space-y-12">
    <div className="space-y-4">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-6 w-1/2 opacity-50" />
    </div>
    
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const TocSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-4 w-32" />
    <div className="space-y-3 border-l-2 border-muted/30 pl-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className={cn("h-3", i % 2 === 0 ? "w-24" : "w-32")} />
      ))}
    </div>
  </div>
);

export const HeaderSkeleton = () => (
  <div className="h-16 border-b border-border/50 bg-background/50 flex items-center justify-between px-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-5 w-40" />
    </div>
    <div className="flex items-center gap-6">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
  </div>
);

export const ElegantLoader = ({ label = "Loading Vault" }: { label?: string }) => (
  <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
    <div className="relative">
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
      
      {/* Spinning Ring */}
      <div className="w-16 h-16 border-[3px] border-primary/10 border-t-primary rounded-full animate-spin shadow-2xl relative z-10" />
      
      {/* Centered Logo/Dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
      </div>
    </div>
    
    <div className="flex flex-col items-center gap-2">
      <div className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/80 ml-[0.4em]">
        {label}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="w-1 h-1 bg-primary/40 rounded-full animate-bounce" 
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);
