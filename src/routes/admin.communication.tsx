import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { LiveKitRoom } from "@/components/LiveKitRoom";

export const Route = createFileRoute("/admin/communication")({
  head: () => ({
    meta: [
      { title: "Communication Lab — rkInfinity" },
      {
        name: "description",
        content: "Private admin-only LiveKit communication test page for rkInfinity.",
      },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: CommunicationLab,
});

function CommunicationLab() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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

  return <LiveKitRoom roomName="Infinit Chat Admin" adminOnly />;
}
