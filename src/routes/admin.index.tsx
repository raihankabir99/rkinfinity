import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, Users, AlertTriangle, MessageSquare, Mail, Globe, RefreshCw, LogOut,
  ShieldCheck, Loader2, BarChart3, Newspaper, Brain, BookOpen, LayoutDashboard,
  Menu, X, ArrowUpRight, Sparkles, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — rkInfinity" },
      { name: "description", content: "rkInfinity real-time management console" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

interface Visitor { id:string; session_id:string|null; path:string|null; country:string|null; city:string|null; created_at:string; }
interface Lead { id:string; name:string|null; email:string|null; message:string|null; source:string|null; created_at:string; }
interface SiteError { id:string; message:string|null; path:string|null; level:string|null; created_at:string; }
interface ChatLog { id:string; user_message:string|null; bot_reply:string|null; created_at:string; }

const nav = [
  { to:"/admin", label:"Overview", icon:LayoutDashboard },
  { to:"/admin/analytics", label:"Analytics", icon:BarChart3 },
  { to:"/admin/leads", label:"Leads", icon:Users },
  { to:"/admin/chats", label:"Conversations", icon:MessageSquare },
  { to:"/admin/blog", label:"Content", icon:Newspaper },
  { to:"/admin/knowledge", label:"Knowledge", icon:BookOpen },
  { to:"/admin/trainer", label:"AI Training", icon:Brain },
] as const;

function AdminPage() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [errors, setErrors] = useState<SiteError[]>([]);
  const [chats, setChats] = useState<ChatLog[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate({ to:"/login" }); return; }
      const { data: roles, error } = await supabase.from("user_roles").select("role").eq("user_id", sess.session.user.id).eq("role", "admin");
      if (!mounted) return;
      if (error) toast.error("Unable to verify admin role");
      const ok = !!roles?.length;
      setIsAdmin(ok); setAuthChecking(false);
      if (!ok) toast.error("Admin access required");
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const loadAll = async () => {
    setRefreshing(true);
    const [v,l,e,c] = await Promise.all([
      supabase.from("visitor_tracking").select("*").order("created_at",{ascending:false}).limit(50),
      supabase.from("leads").select("*").order("created_at",{ascending:false}).limit(25),
      supabase.from("site_errors").select("*").order("created_at",{ascending:false}).limit(25),
      supabase.from("chat_logs").select("*").order("created_at",{ascending:false}).limit(25),
    ]);
    if(v.data) setVisitors(v.data as Visitor[]);
    if(l.data) setLeads(l.data as Lead[]);
    if(e.data) setErrors(e.data as SiteError[]);
    if(c.data) setChats(c.data as ChatLog[]);
    setRefreshing(false);
  };

  useEffect(() => {
    if(!isAdmin) return;
    void loadAll();
    const channel = supabase.channel("admin-live")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"visitor_tracking"},p=>setVisitors(x=>[p.new as Visitor,...x].slice(0,50)))
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"leads"},p=>{setLeads(x=>[p.new as Lead,...x].slice(0,25));toast.success("New lead received");})
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"site_errors"},p=>setErrors(x=>[p.new as SiteError,...x].slice(0,25)))
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },[isAdmin]);

  const stats = useMemo(() => {
    const now=Date.now();
    const pageviews24h=visitors.filter(v=>now-new Date(v.created_at).getTime()<86400000).length;
    const uniqueSessions=new Set(visitors.map(v=>v.session_id).filter(Boolean)).size;
    return {pageviews24h,uniqueSessions,leads:leads.length,errors:errors.length,chats:chats.length};
  },[visitors,leads,errors,chats]);

  if(authChecking) return <LoadingScreen />;
  if(!isAdmin) return <AccessDenied />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar open={mobileOpen} onClose={()=>setMobileOpen(false)} />
      <main className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
            <button onClick={()=>setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-border lg:hidden" aria-label="Open menu"><Menu size={18}/></button>
            <div className="hidden sm:block">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Management Console</p>
              <p className="text-sm font-semibold">rkInfinity Admin</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500 md:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"/>Live</span>
              <button onClick={loadAll} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-50"><RefreshCw size={15} className={refreshing?"animate-spin":""}/><span className="hidden sm:inline">Refresh</span></button>
              <button onClick={async()=>{await supabase.auth.signOut();navigate({to:"/login"});}} className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-destructive/40 hover:text-destructive" aria-label="Sign out"><LogOut size={16}/></button>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[1600px] px-4 py-7 md:px-8 md:py-10">
          <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><Sparkles size={13}/> Real-time operations</div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Good overview, <span className="text-primary">Raihan.</span></h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">A unified view of live website activity, leads, conversations, content and AI operations.</p>
            </div>
            <Link to="/admin/analytics" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">Open analytics <ArrowUpRight size={16}/></Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="Pageviews" value={stats.pageviews24h} detail="Last 24 hours" icon={Activity}/>
            <Metric label="Unique sessions" value={stats.uniqueSessions} detail="Current sample window" icon={Globe}/>
            <Metric label="New leads" value={stats.leads} detail="Most recent 25 records" icon={Mail}/>
            <Metric label="Conversations" value={stats.chats} detail="Most recent 25 records" icon={MessageSquare}/>
            <Metric label="Site alerts" value={stats.errors} detail={stats.errors ? "Needs attention" : "All clear"} icon={AlertTriangle} danger={stats.errors>0}/>
          </div>

          <div className="mt-7 grid gap-6 2xl:grid-cols-[1.5fr_0.85fr]">
            <div className="space-y-6">
              <SectionCard title="Live activity" subtitle="Latest visitor and operational events" action={<Link to="/admin/analytics" className="text-xs font-semibold text-primary hover:underline">View analytics</Link>}>
                <ActivityTable visitors={visitors} leads={leads}/>
              </SectionCard>
              <div className="grid gap-6 xl:grid-cols-2">
                <SectionCard title="Recent leads" subtitle="Latest contact opportunities" action={<Link to="/admin/leads" className="text-xs font-semibold text-primary">Manage <ChevronRight size={14} className="inline"/></Link>}>
                  <SimpleRows empty="No leads received yet." rows={leads.slice(0,6).map(l=>({id:l.id,primary:l.name||"Unknown lead",secondary:l.email||l.source||"No contact detail",time:fmtTime(l.created_at)}))}/>
                </SectionCard>
                <SectionCard title="AI conversations" subtitle="Latest chatbot interactions" action={<Link to="/admin/chats" className="text-xs font-semibold text-primary">Open inbox <ChevronRight size={14} className="inline"/></Link>}>
                  <SimpleRows empty="No conversations yet." rows={chats.slice(0,6).map(c=>({id:c.id,primary:truncate(c.user_message||"Untitled conversation",55),secondary:truncate(c.bot_reply||"No reply",70),time:fmtTime(c.created_at)}))}/>
                </SectionCard>
              </div>
            </div>
            <div className="space-y-6">
              <SectionCard title="Workspace" subtitle="Quick access to every real admin module">
                <div className="space-y-2">{nav.slice(1).map(item=>{const Icon=item.icon;return <Link key={item.to} to={item.to} className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card/50 p-3 transition hover:border-primary/30 hover:bg-primary/5"><span className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-primary"><Icon size={17}/></span><span className="flex-1 text-sm font-medium">{item.label}</span><ChevronRight size={16} className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"/></Link>})}</div>
              </SectionCard>
              <SectionCard title="System health" subtitle="Latest recorded issues">
                <SimpleRows empty="No errors recorded. Your latest sample is clean." rows={errors.slice(0,6).map(e=>({id:e.id,primary:truncate(e.message||"Unknown error",55),secondary:e.path||"Unknown path",time:fmtTime(e.created_at),danger:true}))}/>
              </SectionCard>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function AdminSidebar({open,onClose}:{open:boolean;onClose:()=>void}) {
  return <><button onClick={onClose} className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden ${open?"block":"hidden"}`} aria-label="Close menu"/><aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card/95 p-4 backdrop-blur-xl transition-transform lg:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`}>
    <div className="mb-7 flex items-center justify-between px-2 pt-2"><Link to="/" className="text-xl font-bold tracking-tight">rk<span className="text-primary">Infinity</span></Link><button onClick={onClose} className="lg:hidden"><X size={18}/></button></div>
    <div className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Workspace</div>
    <nav className="space-y-1">{nav.map(item=>{const Icon=item.icon;return <Link key={item.to} to={item.to} onClick={onClose} activeProps={{className:"bg-primary text-primary-foreground shadow-sm"}} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"><Icon size={17}/>{item.label}</Link>})}</nav>
    <div className="mt-auto rounded-2xl border border-border bg-background/60 p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck size={18}/></span><div><p className="text-sm font-semibold">Secure admin</p><p className="text-xs text-muted-foreground">Role-protected access</p></div></div></div>
  </aside></>;
}

function Metric({label,value,detail,icon:Icon,danger}:{label:string;value:number;detail:string;icon:React.ElementType;danger?:boolean}) {
  return <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25"><div className="flex items-start justify-between"><span className="text-sm font-medium text-muted-foreground">{label}</span><span className={`grid h-10 w-10 place-items-center rounded-xl ${danger?"bg-destructive/10 text-destructive":"bg-primary/10 text-primary"}`}><Icon size={18}/></span></div><div className="mt-6 text-3xl font-bold tracking-tight">{value}</div><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

function SectionCard({title,subtitle,action,children}:{title:string;subtitle:string;action?:React.ReactNode;children:React.ReactNode}) {
  return <section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="font-semibold tracking-tight">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div>{action}</div>{children}</section>;
}

function ActivityTable({visitors,leads}:{visitors:Visitor[];leads:Lead[]}) {
  const rows=[...visitors.slice(0,8).map(v=>({id:v.id,type:"Visit",primary:v.path||"/",secondary:[v.city,v.country].filter(Boolean).join(", ")||"Unknown location",time:v.created_at})),...leads.slice(0,8).map(l=>({id:l.id,type:"Lead",primary:l.name||"New lead",secondary:l.email||l.source||"Contact submitted",time:l.created_at}))].sort((a,b)=>+new Date(b.time)-+new Date(a.time)).slice(0,10);
  if(!rows.length) return <Empty text="Waiting for real website activity."/>;
  return <div className="divide-y divide-border/70">{rows.map(r=><div key={r.id} className="flex items-center gap-3 py-3 first:pt-0"><span className={`grid h-9 w-9 place-items-center rounded-xl ${r.type==="Lead"?"bg-primary/10 text-primary":"bg-muted text-muted-foreground"}`}>{r.type==="Lead"?<Mail size={16}/>:<Activity size={16}/>}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{r.primary}</p><p className="truncate text-xs text-muted-foreground">{r.secondary}</p></div><span className="whitespace-nowrap text-xs text-muted-foreground">{fmtTime(r.time)}</span></div>)}</div>;
}

function SimpleRows({rows,empty}:{rows:{id:string;primary:string;secondary:string;time:string;danger?:boolean}[];empty:string}) {
  if(!rows.length) return <Empty text={empty}/>;
  return <div className="divide-y divide-border/70">{rows.map(r=><div key={r.id} className="flex items-center gap-3 py-3 first:pt-0"><span className={`h-2 w-2 rounded-full ${r.danger?"bg-destructive":"bg-primary"}`}/><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{r.primary}</p><p className="truncate text-xs text-muted-foreground">{r.secondary}</p></div><span className="text-[11px] text-muted-foreground">{r.time}</span></div>)}</div>;
}
function Empty({text}:{text:string}) { return <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">{text}</div>; }
function LoadingScreen(){return <div className="grid min-h-screen place-items-center"><div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="animate-spin" size={18}/>Loading secure workspace…</div></div>;}
function AccessDenied(){return <div className="grid min-h-screen place-items-center px-4 text-center"><div><ShieldCheck className="mx-auto mb-4 text-primary" size={40}/><h1 className="text-2xl font-bold">Admin access required</h1><p className="mt-2 text-sm text-muted-foreground">Your account does not have administrator access.</p><Link to="/" className="mt-6 inline-block text-primary hover:underline">← Back home</Link></div></div>;}
function fmtTime(iso:string){const d=new Date(iso);const m=Math.floor((Date.now()-d.getTime())/60000);if(m<1)return"now";if(m<60)return m+"m";const h=Math.floor(m/60);if(h<24)return h+"h";return d.toLocaleDateString();}
function truncate(s:string,n:number){return s.length>n?s.slice(0,n-1)+"…":s;}
