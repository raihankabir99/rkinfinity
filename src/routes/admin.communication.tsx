import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LockKeyhole, Video, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/communication")({
  head: () => ({
    meta: [
      { title: "Communication Lab — rkInfinity" },
      {
        name: "description",
        content: "Private admin-only Jitsi communication test page for rkInfinity",
      },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: CommunicationLab,
});

function makeRoomName() {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `rkInfinity-lab-${suffix}`;
}

function CommunicationLab() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomName, setRoomName] = useState(makeRoomName);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        navigate({ to: "/login" });
        return;
      }

      const { data: roleRows, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sessionData.session.user.id)
        .eq("role", "admin");

      if (!mounted) return;

      if (error) {
        toast.error("Unable to verify admin role");
        setIsAdmin(false);
      } else {
        setIsAdmin(!!roleRows?.length);
      }

      setChecking(false);
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const jitsiUrl = useMemo(
    () => `https://meet.jit.si/${encodeURIComponent(roomName)}`,
    [roomName],
  );

  const newRoom = () => {
    setRoomName(makeRoomName());
    setReloadKey((value) => value + 1);
  };

  if (checking) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-white/10 bg-black/40 p-8 text-center">
          <LockKeyhole className="mx-auto mb-4 text-primary" size={28} />
          <h1 className="text-xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This communication test page is private and is not part of the public website.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Video size={18} className="text-primary" />
              <h1 className="text-lg font-semibold">Communication Lab</h1>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                Private
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Admin-only Jitsi test. Supabase remains the application/data layer; Jitsi handles the live meeting.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={newRoom}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs transition hover:border-primary/40 hover:text-primary"
            >
              <RefreshCw size={14} />
              New room
            </button>
            <a
              href={jitsiUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-primary/20 px-3 py-2 text-xs text-primary transition hover:border-primary/50"
            >
              <ExternalLink size={14} />
              Open Jitsi
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/60">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Test room
              </p>
              <p className="mt-1 break-all font-mono text-xs text-foreground">{roomName}</p>
            </div>
            <span className="text-[10px] text-muted-foreground">meet.jit.si</span>
          </div>

          <iframe
            key={reloadKey}
            title="rkInfinity private Jitsi meeting"
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="h-[70vh] min-h-[520px] w-full border-0"
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-muted-foreground">
          <strong className="text-foreground">Not public:</strong> this route is intentionally not
          added to the public site or AdminShell navigation. The page also checks the Supabase
          <code className="mx-1">user_roles.role = admin</code> before loading Jitsi.
        </div>
      </div>
    </div>
  );
}
