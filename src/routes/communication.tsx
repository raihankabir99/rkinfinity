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
    let api: {
      addListener: (event: string, listener: () => void) => void;
      dispose: () => void;
    } | null = null;
    let cancelled = false;

    const leavePage = () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        navigate({ to: "/" });
      }
    };

    const createMeeting = () => {
      if (cancelled || !meetContainerRef.current || !window.JitsiMeetExternalAPI) {
        return;
      }

      meetContainerRef.current.innerHTML = "";
      api = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName: ROOM_NAME,
        parentNode: meetContainerRef.current,
        width: "100%",
        height: "100%",
        userInfo: {
          displayName: "Infinit Chat",
        },
        configOverwrite: {
          prejoinConfig: { enabled: true },
          disableInviteFunctions: false,
          disableThirdPartyRequests: true,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableAP: true,
          hideConferenceSubject: true,
          tileView: {
            numberOfVisibleTiles: 6,
          },
          customToolbarButtons: [
            {
              id: "infinit-invite",
              text: "Invite",
              icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 3h6v6'/%3E%3Cpath d='M10 14 21 3'/%3E%3Cpath d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/%3E%3C/svg%3E",
            },
          ],
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "chat",
            "desktop",
            "participants-pane",
            "raisehand",
            "infinit-invite",
            "tileview",
            "fullscreen",
            "settings",
            "hangup",
          ],
          TILE_VIEW_MAX_COLUMNS: 4,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          MOBILE_APP_PROMO: false,
          VIDEO_LAYOUT_FIT: "contain",
        },
      });

      api.addListener("videoConferenceLeft", leavePage);
      api.addListener("toolbarButtonClicked", (event: { key: string }) => {
        if (event.key === "infinit-invite") {
          const url = window.location.origin + "/communication";
          if (navigator.share) {
            navigator.share({ title: "Infinit Chat", text: "Join my Infinit Chat meeting", url }).catch(() => {});
          } else {
            navigator.clipboard?.writeText(url);
          }
        }
      });
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
    <main className="h-[100dvh] w-full overflow-hidden bg-black">
      <div className="flex h-14 shrink-0 items-center border-b border-white/10 bg-black/95 px-5">
        <span className="text-sm font-semibold tracking-wide text-white">
          Infinit Chat
        </span>
      </div>
      <div
        ref={meetContainerRef}
        aria-label="Infinit Chat video meeting"
        className="h-[calc(100dvh-3.5rem)] w-full"
      />
    </main>
  );
}