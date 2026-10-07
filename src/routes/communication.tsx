import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";


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

  useEffect(() => {
    let api: { addListener: (event: string, listener: () => void) => void; dispose: () => void } | null = null;
    let cancelled = false;

    const leavePage = () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        navigate({ to: "/" });
      }
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
  }, [navigate]);

  return (
    <main className="min-h-[100dvh] w-full bg-black">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1600px] flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:rounded-2xl sm:border sm:border-white/10">
          <div className="flex h-10 shrink-0 items-center border-b border-white/10 bg-black/80 px-4">
            <span className="text-xs font-medium text-white/80">Infinit Chat</span>
          </div>
          <div
            ref={meetContainerRef}
            aria-label="Infinit Chat video meeting"
            className="min-h-0 flex-1 w-full"
          />
        </div>
      </div>
    </main>
  );
}
