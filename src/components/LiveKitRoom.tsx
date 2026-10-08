import {
  LocalTrackPublication,
  Participant,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Check,
  ChevronDown,
  Copy,
  Grid2X2,
  LogOut,
  Maximize,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
  MoreHorizontal,
  PanelRight,
  RefreshCw,
  Settings,
  Users,
  Volume2,
  Wifi,
  X,
} from "lucide-react";

type ChatMessage = { id: string; sender: string; text: string; own: boolean };
type DeviceOption = { deviceId: string; label: string };

function VideoTile({ participant }: { participant: Participant }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenPublication = participant.getTrackPublication(Track.Source.ScreenShare);
  const cameraPublication = participant.getTrackPublication(Track.Source.Camera);
  const publication =
    (screenPublication?.track ? screenPublication : cameraPublication) as
      | LocalTrackPublication
      | undefined;
  const isScreen = publication?.source === Track.Source.ScreenShare;

  useEffect(() => {
    const video = videoRef.current;
    const track = publication?.track;
    if (!video || !track || track.kind !== Track.Kind.Video) return;
    track.attach(video);
    return () => track.detach(video);
  }, [publication?.track]);

  const name = participant.name || participant.identity;
  return (
    <div className="group relative min-h-[220px] overflow-hidden rounded-2xl border border-white/10 bg-[#07080d] shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      {publication?.track?.kind === Track.Kind.Video ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className="h-full min-h-[220px] w-full object-cover"
        />
      ) : (
        <div className="flex min-h-[220px] items-center justify-center bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12),transparent_42%)] text-5xl font-semibold text-white/70">
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 to-transparent" />
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/65 px-3 py-1.5 text-xs text-white backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {name}{participant.isLocal ? " (You)" : ""}
        {isScreen ? <span className="text-white/45">• screen</span> : null}
      </div>
    </div>
  );
}

export function LiveKitRoom({
  roomName = "Infinit Chat",
  adminOnly = false,
}: {
  roomName?: string;
  adminOnly?: boolean;
}) {
  const roomRef = useRef<Room | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [screen, setScreen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [layout, setLayout] = useState<"grid" | "focus">("grid");
  const [copied, setCopied] = useState(false);
  const [devices, setDevices] = useState<{
    microphones: DeviceOption[];
    cameras: DeviceOption[];
    speakers: DeviceOption[];
  }>({ microphones: [], cameras: [], speakers: [] });
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  const refresh = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    setParticipants([
      room.localParticipant,
      ...Array.from(room.remoteParticipants.values()),
    ]);
  }, []);

  const leave = useCallback(async () => {
    const room = roomRef.current;
    roomRef.current = null;
    if (room) await room.disconnect();
    setJoined(false);
    setParticipants([]);
    setChatOpen(false);
    setSettingsOpen(false);
    setMoreOpen(false);
  }, []);

  const loadDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const microphones = list
        .filter((device) => device.kind === "audioinput")
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${index + 1}`,
        }));
      const cameras = list
        .filter((device) => device.kind === "videoinput")
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`,
        }));
      const speakers = list
        .filter((device) => device.kind === "audiooutput")
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Speaker ${index + 1}`,
        }));
      setDevices({ microphones, cameras, speakers });
      if (!selectedMic && microphones[0]) setSelectedMic(microphones[0].deviceId);
      if (!selectedCamera && cameras[0]) setSelectedCamera(cameras[0].deviceId);
      if (!selectedSpeaker && speakers[0]) setSelectedSpeaker(speakers[0].deviceId);
    } catch {
      // Device labels may remain unavailable until browser permission is granted.
    }
  }, [selectedCamera, selectedMic, selectedSpeaker]);

  useEffect(() => () => { void roomRef.current?.disconnect(); }, []);

  useEffect(() => {
    if (!joined) return;
    void loadDevices();
  }, [joined, loadDevices]);

  const join = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name.");
      return;
    }

    setConnecting(true);
    setError("");

    try {
      const response = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ room: roomName, name: trimmed }),
      });
      const contentType = response.headers.get("content-type") || "";
      const raw = await response.text();
      let data: { token?: string; url?: string; error?: string } = {};
      if (raw) {
        if (contentType.includes("application/json")) {
          data = JSON.parse(raw) as { token?: string; url?: string; error?: string };
        } else {
          throw new Error(`LiveKit token endpoint returned an unexpected response (HTTP ${response.status}).`);
        }
      }
      if (!response.ok || !data.token || !data.url) {
        throw new Error(data.error || "Unable to create LiveKit access token.");
      }

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;
      room
        .on(RoomEvent.ParticipantConnected, refresh)
        .on(RoomEvent.ParticipantDisconnected, refresh)
        .on(RoomEvent.LocalTrackPublished, refresh)
        .on(RoomEvent.LocalTrackUnpublished, refresh)
        .on(RoomEvent.TrackSubscribed, refresh)
        .on(RoomEvent.TrackUnsubscribed, refresh)
        .on(RoomEvent.ChatMessage, (message, participant) => {
          setMessages((current) => [
            ...current,
            {
              id: message.id,
              sender: participant?.name || participant?.identity || "Participant",
              text: message.message,
              own: participant?.identity === room.localParticipant.identity,
            },
          ]);
        })
        .on(RoomEvent.Disconnected, () => {
          setJoined(false);
          setParticipants([]);
        });

      await room.connect(data.url, data.token);
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
      setJoined(true);
      setMic(true);
      setCamera(true);
      refresh();
    } catch (joinError) {
      roomRef.current = null;
      setError(joinError instanceof Error ? joinError.message : "Unable to join the room.");
    } finally {
      setConnecting(false);
    }
  };

  const toggleMic = async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(next);
    setMic(next);
  };

  const toggleCamera = async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !room.localParticipant.isCameraEnabled;
    await room.localParticipant.setCameraEnabled(next);
    setCamera(next);
    refresh();
  };

  const toggleScreen = async () => {
    const room = roomRef.current;
    if (!room) return;
    try {
      const next = !room.localParticipant.isScreenShareEnabled;
      await room.localParticipant.setScreenShareEnabled(next);
      setScreen(next);
      refresh();
    } catch (screenError) {
      setError(screenError instanceof Error ? screenError.message : "Screen sharing failed.");
    }
  };

  const sendChat = async () => {
    const room = roomRef.current;
    const text = input.trim();
    if (!room || !text) return;
    await room.localParticipant.sendText(text, { topic: "infinit-chat" });
    setInput("");
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard?.writeText(window.location.origin + "/communication");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Unable to copy the invite link.");
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stageRef.current?.requestFullscreen();
    } catch {
      setError("Fullscreen is not available in this browser.");
    }
  };

  const switchDevice = async (kind: MediaDeviceKind, deviceId: string) => {
    const room = roomRef.current;
    if (!room || !deviceId) return;
    try {
      await room.switchActiveDevice(kind, deviceId);
      if (kind === "audioinput") setSelectedMic(deviceId);
      if (kind === "videoinput") setSelectedCamera(deviceId);
      if (kind === "audiooutput") setSelectedSpeaker(deviceId);
    } catch (deviceError) {
      setError(deviceError instanceof Error ? deviceError.message : "Unable to switch device.");
    }
  };

  const activeParticipant = participants.find((participant) => !participant.isLocal) || participants[0];
  const tileClass = useMemo(
    () =>
      layout === "focus" && participants.length > 1
        ? "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px]"
        : participants.length === 1
          ? "grid-cols-1"
          : participants.length === 2
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
    [layout, participants.length],
  );

  if (!joined) {
    return (
      <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#05060a] px-5 py-10 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(212,175,55,0.12),transparent_32%),radial-gradient(circle_at_10%_90%,rgba(255,255,255,0.05),transparent_30%)]" />
        <div className="relative w-full max-w-xl rounded-[28px] border border-white/10 bg-white/[0.045] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-9">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                LiveKit
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Infinit Chat</h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/50">
                {adminOnly
                  ? "Private administrator communication room."
                  : "Premium realtime chat, voice and video communication."}
              </p>
            </div>
            <div className="hidden rounded-2xl border border-white/10 bg-black/20 p-3 sm:block">
              <MessageCircle className="text-primary" size={25} />
            </div>
          </div>
          <label className="block text-sm font-medium text-white/75">
            Your name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") void join(); }}
              maxLength={80}
              autoComplete="name"
              placeholder="Enter your name"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-white outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
          </label>
          {error ? <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
          <button
            type="button"
            disabled={connecting}
            onClick={() => void join()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-semibold text-black shadow-[0_12px_35px_rgba(212,175,55,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {connecting ? <RefreshCw size={17} className="animate-spin" /> : <MessageCircle size={17} />}
            {connecting ? "Connecting…" : "Join Infinit Chat"}
          </button>
          <div className="mt-5 flex items-center justify-center gap-5 text-[11px] text-white/35">
            <span className="inline-flex items-center gap-1.5"><Mic size={13} /> Voice</span>
            <span className="inline-flex items-center gap-1.5"><Camera size={13} /> Video</span>
            <span className="inline-flex items-center gap-1.5"><MonitorUp size={13} /> Screen share</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main ref={stageRef} className="flex h-[100dvh] flex-col overflow-hidden bg-[#05060a] text-white">
      <header className="relative z-30 flex min-h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#07080d]/95 px-3 backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 sm:flex">
            <MessageCircle size={18} className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight sm:text-base">{roomName}</div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/40">
              <span className="inline-flex items-center gap-1"><Wifi size={11} className="text-emerald-400" /> Live</span>
              <span>•</span>
              <span>{participants.length} participant{participants.length === 1 ? "" : "s"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => void copyInvite()} className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70 transition hover:bg-white/[0.08] hover:text-white sm:inline-flex">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? "Copied" : "Invite"}
          </button>
          <button type="button" onClick={() => setLayout((value) => value === "grid" ? "focus" : "grid")} className="rounded-xl border border-white/10 p-2.5 text-white/65 transition hover:bg-white/[0.08] hover:text-white" aria-label="Change layout" title="Change layout">
            {layout === "grid" ? <Grid2X2 size={17} /> : <PanelRight size={17} />}
          </button>
          <button type="button" onClick={() => void toggleFullscreen()} className="hidden rounded-xl border border-white/10 p-2.5 text-white/65 transition hover:bg-white/[0.08] hover:text-white sm:block" aria-label="Fullscreen" title="Fullscreen">
            <Maximize size={17} />
          </button>
          <button type="button" onClick={() => setSettingsOpen((value) => !value)} className={`rounded-xl border p-2.5 transition hover:bg-white/[0.08] ${settingsOpen ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 text-white/65 hover:text-white"}`} aria-label="Settings" title="Settings">
            <Settings size={17} />
          </button>
          <button type="button" onClick={() => setMoreOpen((value) => !value)} className={`rounded-xl border p-2.5 transition hover:bg-white/[0.08] ${moreOpen ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 text-white/65 hover:text-white"}`} aria-label="More options" title="More options">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {moreOpen ? (
          <div className="absolute right-3 top-[calc(100%+8px)] w-56 rounded-2xl border border-white/10 bg-[#0b0c12]/95 p-2 shadow-2xl backdrop-blur-xl">
            <button type="button" onClick={() => { void copyInvite(); setMoreOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/75 hover:bg-white/[0.07] hover:text-white"><Copy size={15} /> Copy invite link</button>
            <button type="button" onClick={() => { setChatOpen((value) => !value); setMoreOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/75 hover:bg-white/[0.07] hover:text-white"><MessageCircle size={15} /> {chatOpen ? "Close chat" : "Open chat"}</button>
            <button type="button" onClick={() => { void toggleFullscreen(); setMoreOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/75 hover:bg-white/[0.07] hover:text-white"><Maximize size={15} /> Fullscreen</button>
          </div>
        ) : null}
      </header>

      <div className="relative flex min-h-0 flex-1">
        <section className="min-w-0 flex-1 overflow-auto p-2.5 sm:p-4">
          <div className={`grid h-full auto-rows-fr gap-3 ${tileClass}`}>
            {layout === "focus" && participants.length > 1 ? (
              <>
                {activeParticipant ? <VideoTile participant={activeParticipant} /> : null}
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {participants.filter((participant) => participant.identity !== activeParticipant?.identity).map((participant) => (
                    <VideoTile key={participant.identity} participant={participant} />
                  ))}
                </div>
              </>
            ) : (
              participants.map((participant) => <VideoTile key={participant.identity} participant={participant} />)
            )}
          </div>
        </section>

        {chatOpen ? (
          <aside className="absolute inset-y-0 right-0 z-20 flex w-[min(380px,94vw)] flex-col border-l border-white/10 bg-[#090a0f]/98 shadow-2xl backdrop-blur-xl sm:relative sm:w-[360px]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
              <div>
                <div className="text-sm font-semibold">Chat</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">Room messages</div>
              </div>
              <button type="button" onClick={() => setChatOpen(false)} className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white" aria-label="Close chat"><X size={16} /></button>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
              {messages.map((message) => (
                <div key={message.id} className={message.own ? "text-right" : "text-left"}>
                  <div className="mb-1 text-[10px] text-white/35">{message.sender}</div>
                  <div className={`inline-block max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm ${message.own ? "bg-primary text-black" : "border border-white/10 bg-white/[0.06]"}`}>{message.text}</div>
                </div>
              ))}
              {messages.length === 0 ? <div className="flex h-full items-center justify-center text-center text-xs leading-5 text-white/35">No messages yet.<br />Start the conversation.</div> : null}
            </div>
            <div className="flex gap-2 border-t border-white/10 p-3">
              <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void sendChat(); }} placeholder="Write a message…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary/40" />
              <button type="button" onClick={() => void sendChat()} className="rounded-xl bg-primary p-2.5 text-black transition hover:brightness-110" aria-label="Send message"><MessageCircle size={16} /></button>
            </div>
          </aside>
        ) : null}

        {settingsOpen ? (
          <aside className="absolute right-3 top-3 z-30 w-[min(360px,calc(100vw-24px))] rounded-2xl border border-white/10 bg-[#0b0c12]/98 p-4 shadow-2xl backdrop-blur-2xl sm:right-4 sm:top-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Device settings</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">Infinit Chat</div>
              </div>
              <button type="button" onClick={() => setSettingsOpen(false)} className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white" aria-label="Close settings"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <label className="block text-xs text-white/55">Microphone<select value={selectedMic} onChange={(event) => void switchDevice("audioinput", event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none">{devices.microphones.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label}</option>)}</select></label>
              <label className="block text-xs text-white/55">Camera<select value={selectedCamera} onChange={(event) => void switchDevice("videoinput", event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none">{devices.cameras.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label}</option>)}</select></label>
              <label className="block text-xs text-white/55">Speaker<select value={selectedSpeaker} onChange={(event) => void switchDevice("audiooutput", event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none">{devices.speakers.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label}</option>)}</select></label>
              <button type="button" onClick={() => void loadDevices()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-white/65 hover:bg-white/[0.06] hover:text-white"><RefreshCw size={14} /> Refresh devices</button>
            </div>
          </aside>
        ) : null}
      </div>

      <footer className="relative z-30 flex shrink-0 items-center justify-between border-t border-white/10 bg-[#07080d]/95 px-3 py-3 backdrop-blur-xl sm:px-5">
        <div className="hidden items-center gap-2 text-xs text-white/35 sm:flex">
          <Users size={15} />
          <span>{participants.length} in room</span>
        </div>
        <div className="mx-auto flex items-center gap-2">
          <button type="button" onClick={() => void toggleMic()} className={`rounded-full border p-3 transition ${mic ? "border-white/10 bg-white/[0.05] hover:bg-white/10" : "border-red-400/30 bg-red-500/15 text-red-200"}`} aria-label={mic ? "Mute microphone" : "Unmute microphone"} title={mic ? "Mute microphone" : "Unmute microphone"}>{mic ? <Mic size={18} /> : <MicOff size={18} />}</button>
          <button type="button" onClick={() => void toggleCamera()} className={`rounded-full border p-3 transition ${camera ? "border-white/10 bg-white/[0.05] hover:bg-white/10" : "border-red-400/30 bg-red-500/15 text-red-200"}`} aria-label={camera ? "Turn camera off" : "Turn camera on"} title={camera ? "Turn camera off" : "Turn camera on"}>{camera ? <Camera size={18} /> : <CameraOff size={18} />}</button>
          <button type="button" onClick={() => void toggleScreen()} className={`rounded-full border p-3 transition ${screen ? "border-primary/50 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.05] hover:bg-white/10"}`} aria-label="Toggle screen share" title="Share screen"><MonitorUp size={18} /></button>
          <button type="button" onClick={() => setChatOpen((open) => !open)} className={`rounded-full border p-3 transition ${chatOpen ? "border-primary/50 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.05] hover:bg-white/10"}`} aria-label="Toggle chat" title="Chat"><MessageCircle size={18} /></button>
          <button type="button" onClick={() => setSettingsOpen((open) => !open)} className={`rounded-full border p-3 transition ${settingsOpen ? "border-primary/50 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.05] hover:bg-white/10"}`} aria-label="Settings" title="Settings"><Settings size={18} /></button>
          <button type="button" onClick={() => void leave()} className="ml-1 rounded-full bg-red-500/90 p-3 text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500" aria-label="Leave meeting" title="Leave"><LogOut size={18} /></button>
        </div>
        <div className="hidden items-center gap-2 text-white/30 sm:flex">
          <Volume2 size={14} />
          <span className="text-[10px] uppercase tracking-wider">Secure realtime</span>
        </div>
      </footer>
      {error ? <div className="fixed bottom-20 left-1/2 z-[60] max-w-[calc(100vw-24px)] -translate-x-1/2 rounded-xl border border-red-400/20 bg-red-950/95 px-4 py-3 text-sm text-red-100 shadow-xl">{error}</div> : null}
    </main>
  );
}
