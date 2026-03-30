import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Camera, AlertTriangle, Check, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "docs": true,
    "projects": false,
    "versions": true,
    "mentions": true
  });

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 sm:p-10 space-y-16 animate-in fade-in duration-500 pb-32">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Workspace Settings</h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl">
            Manage your personal profile, notification preferences, and account security.
          </p>
        </div>

        {/* Profile Section */}
        <section className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
             <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <User className="w-5 h-5" />
             </div>
             <h2 className="text-2xl font-bold tracking-tight">Public Profile</h2>
          </div>
          
          {/* Interactive Avatar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="relative group w-32 h-32 shrink-0 rounded-3xl overflow-hidden cursor-pointer shadow-xl shadow-black/5 border-4 border-background ring-1 ring-border">
              <img src="https://i.pravatar.cc/300?img=47" alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white gap-2">
                <Camera className="w-8 h-8 scale-50 group-hover:scale-100 transition-transform duration-500 delay-100" />
                <span className="text-xs font-bold uppercase tracking-wider translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Change</span>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl">Profile Picture</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm leading-relaxed">PNG, JPG or GIF up to 5MB. We recommend an image of at least 256x256px.</p>
              <div className="flex gap-3">
                <button className="px-5 py-2.5 bg-primary/10 text-primary font-bold text-sm rounded-xl hover:bg-primary/20 transition-colors">Upload New Photo</button>
                <button className="px-5 py-2.5 text-muted-foreground font-bold text-sm rounded-xl hover:bg-muted transition-colors">Remove</button>
              </div>
            </div>
          </div>

          {/* Floating Label Inputs */}
          <div className="grid gap-6 p-8 rounded-3xl border border-border/60 bg-card shadow-sm">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="relative group">
                <input 
                  type="text" 
                  id="firstName" 
                  className="peer w-full h-14 px-4 pt-4 pb-1 rounded-xl border-2 border-border/50 bg-transparent text-sm font-medium focus:border-primary focus:outline-none transition-colors"
                  placeholder=" " 
                  defaultValue="Sarah"
                />
                <label htmlFor="firstName" className="absolute left-4 top-4 text-xs font-bold text-muted-foreground uppercase tracking-wider transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-focus:text-xs peer-focus:top-2 peer-focus:text-primary peer-focus:-translate-y-1 peer-focus:font-bold peer-valid:top-2 peer-valid:text-xs peer-valid:-translate-y-1 cursor-text">First Name</label>
              </div>
              
              <div className="relative group">
                <input 
                  type="text" 
                  id="lastName" 
                  className="peer w-full h-14 px-4 pt-4 pb-1 rounded-xl border-2 border-border/50 bg-transparent text-sm font-medium focus:border-primary focus:outline-none transition-colors"
                  placeholder=" " 
                  defaultValue="Chen"
                />
                <label htmlFor="lastName" className="absolute left-4 top-4 text-xs font-bold text-muted-foreground uppercase tracking-wider transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-focus:text-xs peer-focus:top-2 peer-focus:text-primary peer-focus:-translate-y-1 peer-focus:font-bold peer-valid:top-2 peer-valid:text-xs peer-valid:-translate-y-1 cursor-text">Last Name</label>
              </div>
            </div>
            
            <div className="relative group">
              <input 
                type="email" 
                id="email" 
                className="peer w-full h-14 px-4 pt-4 pb-1 rounded-xl border-2 border-border/50 bg-transparent text-sm font-medium focus:border-primary focus:outline-none transition-colors"
                placeholder=" " 
                defaultValue="sarah.chen@company.com"
              />
              <label htmlFor="email" className="absolute left-4 top-4 text-xs font-bold text-muted-foreground uppercase tracking-wider transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-focus:text-xs peer-focus:top-2 peer-focus:text-primary peer-focus:-translate-y-1 peer-focus:font-bold peer-valid:top-2 peer-valid:text-xs peer-valid:-translate-y-1 cursor-text">Email Address</label>
            </div>
            
            <div className="pt-4 flex justify-end">
               <button className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                 Save Profile
               </button>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Bell className="w-5 h-5" />
             </div>
             <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm">
            {[
              { id: "docs", label: "Document Updates", desc: "Notify me when a document I'm watching is edited." },
              { id: "projects", label: "New Projects", desc: "Notify me when a new project is created in my team." },
              { id: "versions", label: "Version Published", desc: "Notify me when a new major version is released." },
              { id: "mentions", label: "Comment Mentions", desc: "Always notify me when someone @mentions me." },
            ].map((item, idx, arr) => (
              <div key={item.id} className={cn("p-6 flex items-center justify-between hover:bg-muted/30 transition-colors", idx !== arr.length - 1 && "border-b border-border/50")}>
                <div className="pr-6">
                  <h4 className="font-bold text-base">{item.label}</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
                
                {/* Premium Toggle Switch */}
                <button
                  onClick={() => setToggles(p => ({ ...p, [item.id]: !p[item.id] }))}
                  className={cn(
                    "relative shrink-0 w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                    toggles[item.id] ? "bg-emerald-500" : "bg-muted-foreground/30"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center",
                    toggles[item.id] ? "translate-x-6" : "translate-x-0"
                  )}>
                     {toggles[item.id] && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone Section */}
        <section className="space-y-8 mt-16 animate-in slide-in-from-bottom-8 duration-700 delay-200">
           <h3 className="text-sm font-bold text-destructive flex items-center gap-2 uppercase tracking-widest pl-2">
              <AlertTriangle className="w-4 h-4" /> Danger Zone
           </h3>
           <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-destructive/10 rounded-full blur-3xl -mr-24 -mt-24 transition-transform duration-700 group-hover:scale-150 group-hover:bg-destructive/20" />
              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                 <div className="max-w-xl">
                    <h4 className="font-bold text-foreground text-lg">Delete Account</h4>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      Once you delete your account, there is no going back. Please be certain. All your custom templates and personal edits will be permanently destroyed and removed from our servers.
                    </p>
                 </div>
                 <button className="shrink-0 px-8 py-3 h-12 bg-destructive/10 text-destructive font-bold rounded-xl border border-destructive/20 hover:bg-destructive hover:text-white transition-all shadow-sm">
                   Permanently Delete
                 </button>
              </div>
           </div>
        </section>

      </div>
    </AppLayout>
  );
}
