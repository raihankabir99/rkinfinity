import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Video } from "lucide-react";

export const Route = createFileRoute("/communication")({
  head: () => ({
    meta: [
      { title: "Infinit Chat — rkInfinity" },
      {
        name: "description",
        content: "Infinit Chat communication room powered by Jitsi Meet.",
      },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: Communication,
});

const ROOM_NAME = "rkInfinity-Chat";

function Communication() {

  const jitsiUrl = useMemo(
    () => `https://meet.jit.si/${encodeURIComponent(ROOM_NAME)}`,
    [],
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Video size={18} className="text-primary" />
              <h1 className="text-lg font-semibold">Infinit Chat</h1>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                Jitsi
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Private-style communication room powered by Jitsi Meet. No rkInfinity account is required for this test room.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 px-3 py-2 text-xs text-muted-foreground">
            rkInfinity Chat
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/60">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Room</p>
              <p className="mt-1 break-all font-mono text-xs text-foreground">{ROOM_NAME}</p>
            </div>
            <span className="text-[10px] text-muted-foreground">meet.jit.si</span>
          </div>

          <iframe
            title="Infinit Chat Jitsi room"
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="h-[70vh] min-h-[520px] w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
