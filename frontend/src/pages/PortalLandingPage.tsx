import { useParams, useNavigate } from "react-router-dom";
import { usePortalStore } from "@/stores/portalStore";
import { useEffect, useState } from "react";
import { ChevronRight, Globe, ShieldCheck, Zap, BarChart3, Users, ArrowRight, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PortalLandingPage() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { getPortal } = usePortalStore();
  const portal = getPortal(linkId || "");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!portal) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4 max-w-md">
           <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
           </div>
           <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
           <p className="text-muted-foreground">This magic link is invalid or has expired. Please contact Union Systems Global support for a fresh access portal.</p>
           <button onClick={() => navigate("/")} className="mt-8 text-primary font-bold hover:underline">Return to Home</button>
        </div>
      </div>
    );
  }

  const isDeveloper = portal.type === "developer";

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500 border-b",
        scrolled ? "bg-background/80 backdrop-blur-xl border-border py-3" : "bg-transparent border-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-xl overflow-hidden shadow-sm">
              {portal.logoUrl ? (
                <img src={portal.logoUrl} className="w-full h-full object-cover" alt="logo" />
              ) : (
                <Globe className="text-primary w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col -space-y-1">
               <span className="font-black text-lg tracking-tighter text-foreground">Union Systems Global</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-primary">{portal.name} Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
               <a href="#" className="hover:text-primary transition-colors">Solutions</a>
               <a href="#" className="hover:text-primary transition-colors">Enterprise</a>
               <a href="#" className="hover:text-primary transition-colors">Security</a>
            </div>
            <button 
              onClick={() => navigate(`/portal/${linkId}/docs`)}
              className="px-5 py-2.5 bg-foreground text-background rounded-full text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-foreground/10 active:scale-95"
            >
              Enter Docs <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest shadow-sm">
             <Zap className="w-3.5 h-3.5" /> Empowering {portal.name}
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] max-w-5xl mx-auto">
             Modern Software for <span className="bg-gradient-to-br from-primary via-primary/80 to-indigo-600 bg-clip-text text-transparent">Modern Banking.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-3xl mx-auto font-medium leading-relaxed">
            Welcome to the official developer portal for {portal.name}. Access your secure project documentation, API references, and integration guides specialized by <span className="text-foreground font-bold">Union Systems Global</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
             <button 
               onClick={() => navigate(`/portal/${linkId}/docs`)}
               className="group relative h-16 px-10 bg-primary text-primary-foreground rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/30 flex items-center gap-3"
             >
                Explore Documentation
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
             <button className="h-16 px-10 bg-white dark:bg-zinc-900 border border-border rounded-2xl font-bold text-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2">
                Contact Technical Support
             </button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-32 text-left">
             <FeatureCard 
               icon={ShieldCheck} 
               title="Military Grade Security" 
               description="Your documentation portal is isolated with unique zero-trust magic links ensured by Union Systems security protocols."
             />
             <FeatureCard 
               icon={BarChart3} 
               title="Real-time Performance" 
               description="Low-latency documentation delivery with optimized load times for critical banking integration workflows."
             />
             <FeatureCard 
               icon={Users} 
               title={isDeveloper ? "Full Vision Workspace" : "Exclusive Portal View"} 
               description={isDeveloper ? "As an internal developer, you have master access to documentation across all banking segments." : "This portal is strictly configured to show only documentation relevant to your organization's projects."}
             />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 border-y border-border bg-white/50 dark:bg-black/20">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-12">Trusted by global financial institutions</p>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700 pb-16">
               <div className="text-2xl font-black tracking-tighter">CITIZEN BANK</div>
               <div className="text-2xl font-black tracking-tighter italic">FINANCE CORE</div>
               <div className="text-2xl font-black tracking-tighter">FIRST NATIONAL</div>
               <div className="text-2xl font-black tracking-tighter underline underline-offset-8">PRIME TRUST</div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-border">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                  <Globe className="w-6 h-6 text-primary" />
                  <span className="font-black text-xl tracking-tighter">USG</span>
               </div>
               <p className="text-sm text-muted-foreground max-w-xs">Building the future of financial software systems worldwide. Secure, reliable, and developer-first.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm">
               <div className="space-y-4">
                  <h4 className="font-bold">Company</h4>
                  <p className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-xs">About Us</p>
                  <p className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-xs">Careers</p>
                  <p className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-xs">Press Kit</p>
               </div>
               <div className="space-y-4">
                  <h4 className="font-bold">Legal</h4>
                  <p className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-xs">Terms of Service</p>
                  <p className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-xs">Privacy Policy</p>
                  <p className="text-muted-foreground hover:text-primary transition-colors cursor-pointer text-xs">Compliance</p>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
       <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
          <Icon className="w-6 h-6" />
       </div>
       <h3 className="text-xl font-bold mb-3">{title}</h3>
       <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
    </div>
  );
}
