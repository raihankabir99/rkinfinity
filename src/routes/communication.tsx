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
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "chat",
            "desktop",
            "participants-pane",
            "raisehand",
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
      <div
        ref={meetContainerRef}
        aria-label="Infinit Chat video meeting"
        className="h-full w-full"
      />
    </main>
  );
}