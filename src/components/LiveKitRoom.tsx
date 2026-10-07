import {
  LocalTrackPublication,
  Participant,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Copy,
  LogOut,
  Mic,
  MicOff,
  MessageCircle,
  MonitorUp,
  Send,
} from "lucide-react";

type ChatMessage = { id: string; sender: string; text: string; own: boolean };

function VideoTile({ participant }: { participant: Participant }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const publication = participant.getTrackPublication(Track.Source.Camera) as
    | LocalTrackPublication
    | undefined;

  useEffect(() => {
    const video = videoRef.current;
    const track = publication?.track;
    if (!video || !track || track.kind !== Track.Kind.Video) return;
    track.attach(video);
    return () => track.detach(video);
  }, [publication?.track]);

  const name = participant.name || participant.identity;
  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
      {publication?.track?.kind === Track.Kind.Video ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className="h-full min-h-[220px] w-full object-cover"
        />
      ) : (
        <div className="flex min-h-[220px] items-center justify-center text-4xl font-semibold text-white/60">
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
        {name}{participant.isLocal ? " (You)" : ""}
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
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [screen, setScreen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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
  }, []);

  useEffect(() => () => { void roomRef.current?.disconnect(); }, []);

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
      const data = (await response.json()) as { token?: string; url?: string; error?: string };
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

  if (!joined) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-black px-5 py-10 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-7 shadow-2xl">
          <div className="mb-7">
            <div className="mb-2 text-xs uppercase tracking-[0.25em] text-primary">LiveKit</div>
            <h1 className="text-3xl font-semibold">Infinit Chat</h1>
            <p className="mt-2 text-sm text-white/55">
              {adminOnly ? "Private administrator communication room." : "Realtime communication room."}
            </p>
          </div>
          <label className="block text-sm text-white/70">
            Your name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") void join(); }}
              maxLength={80}
              autoComplete="name"
              placeholder="Enter your name"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-primary/50"
            />
          </label>
          {error ? <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
          <button
            type="button"
            disabled={connecting}
            onClick={() => void join()}
            className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-black disabled:opacity-50"
          >
            {connecting ? "Connecting…" : "Join Infinit Chat"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-black text-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-black/95 px-4">
        <div>
          <div className="text-sm font-semibold">Infinit Chat</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            LiveKit • {participants.length} participant{participants.length === 1 ? "" : "s"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void navigator.clipboard?.writeText(window.location.origin + "/communication")}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:text-white"
        >
          <Copy size={14} /> Copy invite
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="min-w-0 flex-1 overflow-auto p-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {participants.map((participant) => (
              <VideoTile key={participant.identity} participant={participant} />
            ))}
          </div>
        </section>

        {chatOpen ? (
          <aside className="flex w-[min(360px,90vw)] shrink-0 flex-col border-l border-white/10 bg-zinc-950">
            <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">Chat</div>
            <div className="min-h-0 flex-1 space-y-2 overflow-auto p-4">
              {messages.map((message) => (
                <div key={message.id} className={message.own ? "text-right" : "text-left"}>
                  <div className="mb-1 text-[10px] text-white/35">{message.sender}</div>
                  <div className="inline-block max-w-[90%] rounded-xl bg-white/10 px-3 py-2 text-sm">{message.text}</div>
                </div>
              ))}
              {messages.length === 0 ? <p className="text-xs text-white/40">No messages yet.</p> : null}
            </div>
            <div className="flex gap-2 border-t border-white/10 p-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") void sendChat(); }}
                placeholder="Message"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black px-3 py-2 text-sm outline-none"
              />
              <button type="button" onClick={() => void sendChat()} className="rounded-lg bg-primary p-2 text-black" aria-label="Send message">
                <Send size={16} />
              </button>
            </div>
          </aside>
        ) : null}
      </div>

      <footer className="flex shrink-0 items-center justify-center gap-2 border-t border-white/10 bg-black/95 px-3 py-3">
        <button type="button" onClick={() => void toggleMic()} className="rounded-full border border-white/10 p-3 hover:bg-white/10" aria-label="Toggle microphone">
          {mic ? <Mic size={18} /> : <MicOff size={18} />}
        </button>
        <button type="button" onClick={() => void toggleCamera()} className="rounded-full border border-white/10 p-3 hover:bg-white/10" aria-label="Toggle camera">
          {camera ? <Camera size={18} /> : <CameraOff size={18} />}
        </button>
        <button type="button" onClick={() => void toggleScreen()} className={`rounded-full border p-3 hover:bg-white/10 ${screen ? "border-primary text-primary" : "border-white/10"}`} aria-label="Toggle screen share">
          <MonitorUp size={18} />
        </button>
        <button type="button" onClick={() => setChatOpen((open) => !open)} className={`rounded-full border p-3 hover:bg-white/10 ${chatOpen ? "border-primary text-primary" : "border-white/10"}`} aria-label="Toggle chat">
          <MessageCircle size={18} />
        </button>
        <button type="button" onClick={() => void leave()} className="ml-1 rounded-full bg-red-500/90 p-3 text-white hover:bg-red-500" aria-label="Leave meeting">
          <LogOut size={18} />
        </button>
      </footer>
      {error ? <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-red-400/20 bg-red-950/90 px-4 py-3 text-sm text-red-100 shadow-xl">{error}</div> : null}
    </main>
  );
}
