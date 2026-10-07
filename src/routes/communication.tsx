import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Video } from "lucide-react";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: {
        roomName: string;
        parentNode: HTMLElement;
        width?: string;
        height?: string;
      },
    ) => {
      addListener: (event: string, listener: () => void) => void;
      dispose: () => void;
    };
  }
}

export const Route = createFileRoute("/communication")({
  head: () => ({
    meta: [
      { title: "Infinit Chat — rkInfinity" },
      {
        name: "description",
        content: "Infinit Chat communication room.",
      },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: Communication,
});

const ROOM_NAME = "rkInfinity-Chat";

function Communication() {
  const navigate = useNavigate();
  const meetContainerRef = useRef<HTMLDivElement>(null);

  const jitsiUrl = useMemo(
    () => `https://meet.jit.si/${encodeURIComponent(ROOM_NAME)}`,
    [],
  );

  useEffect(() => {
    let api: { addListener: (event: string, listener: () => void) => void; dispose: () => void } | null = null;
    let cancelled = false;

    const leavePage = () => {
      navigate({ to: "/" });
    };

    const createMeeting = () => {
      if (
        cancelled ||
        !meetContainerRef.current ||
        !window.JitsiMeetExternalAPI
      ) {
        return;
      }

      meetContainerRef.current.innerHTML = "";
      api = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName: ROOM_NAME,
        parentNode: meetContainerRef.current,
        width: "100%",
        height: "100%",
      });

      api.addListener("videoConferenceLeft", leavePage);
    };

    const existingScript = document.querySelector(
      'script[src="https://meet.jit.si/external_api.js"]',
    );

    if (existingScript) {
      if (window.JitsiMeetExternalAPI) {
        createMeeting();
      } else {
        existingScript.addEventListener("load", createMeeting, { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = createMeeting;
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      api?.dispose();
    };
  }, [navigate, jitsiUrl]);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              aria-label="Go back"
              className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 transition hover:border-primary/40 hover:text-primary"
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Video size={18} className="text-primary" />
                <h1 className="text-lg font-semibold">Infinit Chat</h1>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                  rkInfinity
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                rkInfinity Chat
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 px-3 py-2 text-xs text-muted-foreground">
            rkInfinity Chat
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/60">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Room
              </p>
              <p className="mt-1 break-all font-mono text-xs text-foreground">
                {ROOM_NAME}
              </p>
            </div>
          </div>

          <div
            ref={meetContainerRef}
            aria-label="Infinit Chat video meeting"
            className="h-[70vh] min-h-[520px] w-full"
          >
            <iframe
              title="Infinit Chat Jitsi room"
              src={jitsiUrl}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="h-full min-h-[520px] w-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
