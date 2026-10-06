import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Library,
  MessageSquare,
  Settings,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

const groups = [
  {
    label: "Command Center",
    items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { label: "Blog", to: "/admin/blog", icon: FileText },
      { label: "Knowledge", to: "/admin/knowledge", icon: Library },
    ],
  },
  {
    label: "AI & Support",
    items: [
      { label: "Chats", to: "/admin/chats", icon: MessageSquare },
      { label: "Trainer", to: "/admin/trainer", icon: Bot },
    ],
  },
  {
    label: "Business",
    items: [{ label: "Leads", to: "/admin/leads", icon: BriefcaseBusiness }],
  },
  {
    label: "Insights & System",
    items: [
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
      { label: "Security", to: "/admin/security", icon: Shield },
      { label: "Activity", to: "/admin/activity", icon: Activity },
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "Settings", to: "/admin/settings", icon: Settings },
    ],
  },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/5 bg-black/70 backdrop-blur-2xl lg:block">
        <div className="flex h-16 items-center border-b border-white/5 px-5">
          <Link to="/admin" className="group flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-white">rk</span>
            <span className="text-lg font-black tracking-tight text-primary">Infinity</span>
            <Zap size={13} className="text-primary transition group-hover:scale-110" />
          </Link>
        </div>

        <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map(({ label, to, icon: Icon }) => {
                  const active =
                    to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={[
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                        active
                          ? "border border-primary/20 bg-primary/10 font-semibold text-primary shadow-[0_0_20px_rgba(212,175,55,0.08)]"
                          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                      ].join(" ")}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-black/75 px-4 backdrop-blur-xl lg:pl-[17rem]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Admin Control Center
          </p>
          <p className="text-xs text-muted-foreground">rkInfinity</p>
        </div>
        <Link
          to="/"
          className="rounded-lg border border-primary/20 px-3 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-primary"
        >
          View website
        </Link>
      </header>

      <main className="min-w-0 lg:pl-64">
        <div className="grid-bg min-h-[calc(100vh-4rem)]">{children}</div>
      </main>
    </div>
  );
}
