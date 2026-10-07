import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Video } from "lucide-react";

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

function makeRoomName() {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `rkInfinity-chat-${suffix}`;
}

function Communication() {
  const [roomName, setRoomName] = useState(makeRoomName);
  const [reloadKey, setReloadKey] = useState(0);

  const jitsiUrl = useMemo(
    () => `https://meet.jit.si/${encodeURIComponent(roomName)}`,
    [roomName],
  );

  const newRoom = () => {
    setRoomName(makeRoomName());
    setReloadKey((value) => value + 1);
  };

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
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Room</p>
              <p className="mt-1 break-all font-mono text-xs text-foreground">{roomName}</p>
            </div>
            <span className="text-[10px] text-muted-foreground">meet.jit.si</span>
          </div>

          <iframe
            key={reloadKey}
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
