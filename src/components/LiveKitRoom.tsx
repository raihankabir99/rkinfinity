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
  CalendarClock,
  Check,
  ChevronDown,
  Copy,
  Grid2X2,
  Hand,
  LogOut,
  Maximize,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
  MoreHorizontal,
  PanelRight,
  Paperclip,
  PictureInPicture,
  RefreshCw,
  Settings,
  Users,
  Volume2,
  Wifi,
  X,
} from "lucide-react";

type ChatMessage = { id: string; sender: string; senderId: string; text: string; own: boolean; recipientId?: string; recipientName?: string; createdAt?: string; attachmentPath?: string; attachmentName?: string; attachmentMime?: string; attachmentSize?: number };
type DeviceOption = { deviceId: string; label: string };
type AttendanceRecord = { identity: string; name: string; joinedAt: number; leftAt?: number };
type AdmissionRequest = { id: string; name: string; createdAt: string };
type ScheduledMeeting = { id: string; title: string; starts_at: string; ends_at: string };
type MeetingInvite = { title: string; startsAt: string; endsAt: string };

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
      {publication?.track?.kind === Track.Kind.Video && typeof document !== "undefined" && "pictureInPictureEnabled" in document ? (
        <button
          type="button"
          title="Open video in picture-in-picture"
          aria-label={"Open " + name + "'s video in picture-in-picture"}
          onClick={async () => {
            const video = videoRef.current;
            if (!video || !document.pictureInPictureEnabled || typeof video.requestPictureInPicture !== "function") return;
            try {
              if (document.pictureInPictureElement === video) await document.exitPictureInPicture();
              else await video.requestPictureInPicture();
            } catch (pipError) {
              console.error("Picture-in-picture could not be started:", pipError);
            }
          }}
          className="absolute right-3 top-3 z-10 rounded-lg border border-white/15 bg-black/65 p-2 text-white/80 backdrop-blur transition hover:bg-black/90 hover:text-white"
        >
          <PictureInPicture size={16} />
        </button>
      ) : null}
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
  const attendanceTokenRef = useRef("");
  const stageRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState(() => new URLSearchParams(window.location.search).get("room") || "");
  const [meetingInvite] = useState<MeetingInvite | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const title = params.get("meeting"); const startsAt = params.get("startsAt"); const endsAt = params.get("endsAt");
    if (!title || !startsAt || !endsAt || !Number.isFinite(Date.parse(startsAt)) || !Number.isFinite(Date.parse(endsAt))) return null;
    return { title: title.slice(0, 120), startsAt, endsAt };
  });
  const [isModerator, setIsModerator] = useState(false);
  const [moderatorToken, setModeratorToken] = useState("");
  const [roomLocked, setRoomLocked] = useState(false);
  const [joined, setJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantJoinedAt, setParticipantJoinedAt] = useState<Map<string, number>>(() => new Map());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [pendingAdmissions, setPendingAdmissions] = useState<AdmissionRequest[]>([]);
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>([]);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleStartsAt, setScheduleStartsAt] = useState("");
  const [scheduleEndsAt, setScheduleEndsAt] = useState("");
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [raisedHands, setRaisedHands] = useState<Set<string>>(() => new Set());
  const [handRaised, setHandRaised] = useState(false);
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [screen, setScreen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const chatOpenRef = useRef(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [soundNotifications, setSoundNotifications] = useState(() => {
    try { return window.localStorage.getItem("rk-chat-sound-notifications") !== "false"; } catch { return true; }
  });
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [chatMode, setChatMode] = useState<"group" | "private">("group");
  const [privateRecipient, setPrivateRecipient] = useState("");
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

  useEffect(() => { chatOpenRef.current = chatOpen; if (chatOpen) setUnreadMessages(0); }, [chatOpen]);
  useEffect(() => { try { window.localStorage.setItem("rk-chat-sound-notifications", String(soundNotifications)); } catch { /* Storage can be unavailable in private browsing. */ } }, [soundNotifications]);

  const refreshAttendanceHistory = useCallback(async () => {
    if (!isModerator || !moderatorToken) return;
    setAttendanceLoading(true);
    try {
      const response = await fetch("/api/livekit/attendance", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${moderatorToken}` },
        body: JSON.stringify({ action: "history" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load attendance history.");
      setAttendanceRecords(Array.isArray(result.records) ? result.records as AttendanceRecord[] : []);
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : "Unable to load attendance history.");
    } finally {
      setAttendanceLoading(false);
    }
  }, [isModerator, moderatorToken]);

  const refreshPendingAdmissions = useCallback(async () => {
    if (!isModerator || !moderatorToken) return;
    try {
      const response = await fetch("/api/livekit/admission", { method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer " + moderatorToken }, body: JSON.stringify({ action: "pending" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load waiting room requests.");
      setPendingAdmissions(Array.isArray(result.requests) ? result.requests : []);
    } catch (admissionError) { console.error("Waiting room refresh failed:", admissionError); }
  }, [isModerator, moderatorToken]);

  useEffect(() => {
    if (!joined || !isModerator || !moderatorToken) return;
    void refreshPendingAdmissions();
    const timer = window.setInterval(() => { void refreshPendingAdmissions(); }, 3000);
    return () => window.clearInterval(timer);
  }, [joined, isModerator, moderatorToken, refreshPendingAdmissions]);

  const decideAdmission = async (requestId: string, action: "approve" | "reject") => {
    if (!moderatorToken) return;
    try {
      const response = await fetch("/api/livekit/admission", { method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer " + moderatorToken }, body: JSON.stringify({ action, requestId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update admission request.");
      setPendingAdmissions((current) => current.filter((request) => request.id !== requestId));
      setStatusMessage(action === "approve" ? "Participant admitted." : "Admission request declined.");
    } catch (admissionError) { setError(admissionError instanceof Error ? admissionError.message : "Unable to update admission request."); }
  };

  const refreshScheduledMeetings = useCallback(async () => {
    if (!isModerator || !moderatorToken) return;
    try {
      const response = await fetch("/api/livekit/schedule", { method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer " + moderatorToken }, body: JSON.stringify({ action: "list" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load scheduled meetings.");
      setScheduledMeetings(Array.isArray(result.meetings) ? result.meetings : []);
    } catch (scheduleError) { console.error("Scheduled meetings refresh failed:", scheduleError); }
  }, [isModerator, moderatorToken]);

  useEffect(() => { if (joined && isModerator && moderatorToken) void refreshScheduledMeetings(); }, [joined, isModerator, moderatorToken, refreshScheduledMeetings]);

  const createScheduledMeeting = async () => {
    if (!moderatorToken) return;
    setScheduleBusy(true); setError("");
    try {
      const response = await fetch("/api/livekit/schedule", { method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer " + moderatorToken }, body: JSON.stringify({ action: "create", title: scheduleTitle, startsAt: scheduleStartsAt ? new Date(scheduleStartsAt).toISOString() : "", endsAt: scheduleEndsAt ? new Date(scheduleEndsAt).toISOString() : "" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to schedule meeting.");
      setScheduleTitle(""); setScheduleStartsAt(""); setScheduleEndsAt("");
      await refreshScheduledMeetings(); setStatusMessage("Meeting scheduled.");
    } catch (scheduleError) { setError(scheduleError instanceof Error ? scheduleError.message : "Unable to schedule meeting."); }
    finally { setScheduleBusy(false); }
  };

  const cancelScheduledMeeting = async (id: string) => {
    if (!moderatorToken || !window.confirm("Cancel this scheduled meeting?")) return;
    try {
      const response = await fetch("/api/livekit/schedule", { method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer " + moderatorToken }, body: JSON.stringify({ action: "cancel", id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to cancel meeting.");
      setScheduledMeetings((current) => current.filter((meeting) => meeting.id !== id)); setStatusMessage("Scheduled meeting cancelled.");
    } catch (scheduleError) { setError(scheduleError instanceof Error ? scheduleError.message : "Unable to cancel meeting."); }
  };

  const exportAttendanceCsv = useCallback(async () => {
    if (!isModerator || !moderatorToken) return;
    try {
      const response = await fetch("/api/livekit/attendance", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${moderatorToken}` },
        body: JSON.stringify({ action: "history" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load attendance history.");
      const records = Array.isArray(result.records) ? result.records as AttendanceRecord[] : [];
      setAttendanceRecords(records);
      if (records.length === 0) {
        setStatusMessage("No attendance records have been saved for this room yet.");
        return;
      }
      const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
      const rows = [
        ["Name", "Participant ID", "Joined At", "Left At", "Duration Minutes"],
        ...records.map((record) => {
          const end = record.leftAt || Date.now();
          const duration = Math.max(0, Math.round((end - record.joinedAt) / 60000));
          return [record.name, record.identity, new Date(record.joinedAt).toISOString(),
            record.leftAt ? new Date(record.leftAt).toISOString() : "Still in room", String(duration)];
        }),
      ];
      const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `infinit-attendance-${roomCode || "class"}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatusMessage("Saved attendance history exported.");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Unable to export attendance.");
    }
  }, [isModerator, moderatorToken, roomCode]);

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
    if (room && attendanceTokenRef.current) {
      try {
        await fetch("/api/livekit/attendance", {
          method: "POST",
          headers: { "content-type": "application/json", Authorization: `Bearer ${attendanceTokenRef.current}` },
          body: JSON.stringify({ action: "leave" }),
          keepalive: true,
        });
      } catch (attendanceError) {
        console.error("Attendance leave persistence failed:", attendanceError);
      }
    }
    attendanceTokenRef.current = "";
    roomRef.current = null;
    if (room) await room.disconnect();
    setJoined(false);
    setParticipants([]);
    setParticipantJoinedAt(new Map());
    setHandRaised(false);
    setRaisedHands(new Set());
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

  const join = async (preset?: { token: string; url: string; room: string; role?: string; moderatorToken?: string }) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name.");
      return;
    }

    setConnecting(true);
    setError("");

    try {
      let data: { token?: string; url?: string; room?: string; role?: string; moderatorToken?: string; error?: string; waiting?: boolean; requestToken?: string; status?: string } = preset || {};
      if (!preset) {
        const requestedRoom = roomCode.trim() || roomName;
        const response = await fetch("/api/livekit/admission", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "request", room: requestedRoom, name: trimmed }),
        });
        data = await response.json() as typeof data;
        if (!response.ok) throw new Error(data.error || "Unable to request room admission.");
        if (data.waiting && data.requestToken) {
          setStatusMessage("Waiting for the host to admit you…");
          let admitted = false;
          for (let attempt = 0; attempt < 120; attempt += 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 3000));
            const statusResponse = await fetch("/api/livekit/admission", {
              method: "POST",
              headers: { "content-type": "application/json", Authorization: "Bearer " + data.requestToken },
              body: JSON.stringify({ action: "status" }),
            });
            const statusData = await statusResponse.json() as typeof data;
            if (!statusResponse.ok) throw new Error(statusData.error || "Unable to check admission status.");
            if (statusData.status === "rejected") throw new Error("The host did not admit this request.");
            if (statusData.token && statusData.url && statusData.room) { data = statusData; admitted = true; break; }
            setStatusMessage("Waiting for host approval… (" + Math.floor((attempt + 1) * 3 / 60) + " min)");
          }
          if (!admitted) throw new Error("Waiting room timed out. Please ask the host to admit you and try again.");
        }
      }
      if (!data.token || !data.url || !data.room) throw new Error(data.error || "Unable to create LiveKit access token.");
      setStatusMessage("");
      setRoomCode(data.room);
      setIsModerator(data.role === "moderator");
      if (data.moderatorToken) setModeratorToken(data.moderatorToken);

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;
      room
        .on(RoomEvent.ParticipantConnected, (participant) => {
          const joinedAt = Date.now();
          setParticipantJoinedAt((current) => {
            const next = new Map(current);
            next.set(participant.identity, joinedAt);
            return next;
          });
          setAttendanceRecords((current) => [
            ...current,
            { identity: participant.identity, name: participant.name || participant.identity, joinedAt },
          ]);
          refresh();
        })
        .on(RoomEvent.ParticipantDisconnected, (participant) => {
          const leftAt = Date.now();
          setAttendanceRecords((current) => {
            const next = [...current];
            for (let index = next.length - 1; index >= 0; index -= 1) {
              if (next[index].identity === participant.identity && !next[index].leftAt) {
                next[index] = { ...next[index], leftAt };
                break;
              }
            }
            return next;
          });
          setParticipantJoinedAt((current) => {
            const next = new Map(current);
            next.delete(participant.identity);
            return next;
          });
          setRaisedHands((current) => {
            const next = new Set(current);
            next.delete(participant.identity);
            return next;
          });
          refresh();
        })
        .on(RoomEvent.LocalTrackPublished, refresh)
        .on(RoomEvent.LocalTrackUnpublished, refresh)
        .on(RoomEvent.TrackSubscribed, refresh)
        .on(RoomEvent.TrackUnsubscribed, refresh)
        .on(RoomEvent.DataReceived, (payload, participant, _kind, topic) => {
          if (topic !== "infinit-chat" || !participant) return;
          try {
            const decoded = JSON.parse(new TextDecoder().decode(payload)) as {
              type?: string; id?: string; text?: string; recipientId?: string; recipientName?: string; attachmentPath?: string; attachmentName?: string; attachmentMime?: string; attachmentSize?: number;
            };
            if (decoded.type === "raise-hand" && typeof decoded.raised === "boolean") {
              setRaisedHands((current) => {
                const next = new Set(current);
                if (decoded.raised) next.add(participant.identity);
                else next.delete(participant.identity);
                return next;
              });
              return;
            }
            if (decoded.type === "hand-cleared" && participant.isLocal) {
              setHandRaised(false);
              setRaisedHands((current) => {
                const next = new Set(current);
                next.delete(room.localParticipant.identity);
                return next;
              });
              setError("");
              setStatusMessage("The teacher has acknowledged your raised hand.");
              return;
            }
            if (decoded.type !== "chat-message" || typeof decoded.text !== "string" || typeof decoded.id !== "string") return;
            const localId = room.localParticipant.identity;
            if (decoded.recipientId && decoded.recipientId !== localId) return;
            setMessages((current) => [...current, {
              id: decoded.id!,
              sender: participant.name || participant.identity,
              senderId: participant.identity,
              text: decoded.text!,
              own: false,
              recipientId: decoded.recipientId,
              recipientName: decoded.recipientName,
              attachmentPath: decoded.attachmentPath,
              attachmentName: decoded.attachmentName,
              attachmentMime: decoded.attachmentMime,
              attachmentSize: decoded.attachmentSize,
            }]);
            if (!chatOpenRef.current) setUnreadMessages((current) => Math.min(current + 1, 99));
            if (!chatOpenRef.current && soundNotifications && typeof window !== "undefined") {
              try {
                const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
                if (AudioContextCtor) {
                  const audioContext = new AudioContextCtor();
                  if (audioContext.state === "running") {
                    const oscillator = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    oscillator.frequency.value = 740;
                    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.04, audioContext.currentTime + 0.015);
                    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.12);
                    oscillator.connect(gain); gain.connect(audioContext.destination);
                    oscillator.start(); oscillator.stop(audioContext.currentTime + 0.13);
                    oscillator.onended = () => { void audioContext.close(); };
                  } else { void audioContext.close(); }
                }
              } catch { /* Sound is optional; never interrupt message delivery. */ }
            }
          } catch {
            // Ignore malformed or unrelated data packets.
          }
        })
        .on(RoomEvent.Disconnected, () => {
          const leftAt = Date.now();
          const localIdentity = room.localParticipant.identity;
          setAttendanceRecords((current) => {
            const next = [...current];
            for (let index = next.length - 1; index >= 0; index -= 1) {
              if (next[index].identity === localIdentity && !next[index].leftAt) {
                next[index] = { ...next[index], leftAt };
                break;
              }
            }
            return next;
          });
          setJoined(false);
          setParticipants([]);
          setParticipantJoinedAt(new Map());
          setHandRaised(false);
          setRaisedHands(new Set());
        });

      attendanceTokenRef.current = data.token;
      await room.connect(data.url, data.token);
      try {
        const historyResponse = await fetch("/api/livekit/chat", {
          method: "POST",
          headers: { "content-type": "application/json", Authorization: "Bearer " + data.token },
          body: JSON.stringify({ action: "history", limit: 30 }),
        });
        const history = await historyResponse.json();
        if (!historyResponse.ok) throw new Error(history.error || "Unable to load room chat history.");
        const historyMessages = (Array.isArray(history.messages) ? history.messages : []).map((message: { id: string; sender: string; senderId: string; text: string; recipientId?: string; createdAt?: string }) => ({
          ...message, own: message.senderId === room.localParticipant.identity,
          recipientName: message.recipientId ? participants.find((participant) => participant.identity === message.recipientId)?.name : undefined,
        } satisfies ChatMessage));
        setMessages(historyMessages);
        setHasMoreMessages(Boolean(history.hasMore));
      } catch (historyError) {
        console.error("Room chat history could not be loaded:", historyError);
        setStatusMessage("Connected; previous chat history could not be loaded.");
      }
      const localJoinedAt = Date.now();
      setAttendanceRecords((current) => [
        ...current,
        { identity: room.localParticipant.identity, name: room.localParticipant.name || trimmed, joinedAt: localJoinedAt },
      ]);
      void fetch("/api/livekit/attendance", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${data.token}` },
        body: JSON.stringify({ action: "join" }),
      }).then(async (response) => {
        if (!response.ok) throw new Error("Attendance join could not be saved.");
      }).catch((attendanceError) => {
        console.error("Attendance join persistence failed:", attendanceError);
        setStatusMessage("Connected, but attendance could not be saved. Ask the host to check server configuration.");
      });
      if (data.role === "moderator" && data.moderatorToken) {
        void fetch("/api/livekit/attendance", {
          method: "POST",
          headers: { "content-type": "application/json", Authorization: `Bearer ${data.moderatorToken}` },
          body: JSON.stringify({ action: "history" }),
        }).then(async (response) => {
          const result = await response.json();
          if (response.ok && Array.isArray(result.records)) setAttendanceRecords(result.records as AttendanceRecord[]);
        }).catch((historyError) => console.error("Attendance history load failed:", historyError));
      }
      setParticipantJoinedAt((current) => {
        const next = new Map(current);
        next.set(room.localParticipant.identity, Date.now());
        for (const participant of room.remoteParticipants.values()) {
          if (!next.has(participant.identity)) next.set(participant.identity, Date.now());
        }
        return next;
      });
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
      setJoined(true);
      setMic(true);
      setCamera(true);
      refresh();
    } catch (joinError) {
      // If connection succeeded but device setup failed, close the room and mark
      // attendance as left so we do not leave a ghost participant/session.
      const failedRoom = roomRef.current;
      const attendanceToken = attendanceTokenRef.current;
      if (failedRoom && attendanceToken) {
        try {
          await fetch("/api/livekit/attendance", {
            method: "POST",
            headers: { "content-type": "application/json", Authorization: `Bearer ${attendanceToken}` },
            body: JSON.stringify({ action: "leave" }),
            keepalive: true,
          });
        } catch (attendanceError) {
          console.error("Attendance cleanup after failed join did not persist:", attendanceError);
        }
      }
      attendanceTokenRef.current = "";
      roomRef.current = null;
      if (failedRoom) {
        try { await failedRoom.disconnect(); }
        catch (disconnectError) { console.error("LiveKit cleanup after failed join failed:", disconnectError); }
      }
      setJoined(false);
      setParticipants([]);
      setError(joinError instanceof Error ? joinError.message : "Unable to join the room.");
    } finally {
      setConnecting(false);
    }
  };

  const createRoom = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Please enter your name first."); return; }
    setConnecting(true); setError("");
    try {
      const response = await fetch("/api/livekit/room/create", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: trimmed }) });
      const data = await response.json() as { token?: string; url?: string; room?: string; role?: string; moderatorToken?: string; error?: string };
      if (!response.ok || !data.token || !data.url || !data.room || !data.moderatorToken) throw new Error(data.error || "Unable to create room.");
      setRoomCode(data.room); setModeratorToken(data.moderatorToken); setIsModerator(true);
      setConnecting(false);
      await join({ token: data.token, url: data.url, room: data.room, role: data.role, moderatorToken: data.moderatorToken });
    } catch (createError) { setError(createError instanceof Error ? createError.message : "Unable to create room."); setConnecting(false); }
  };

  const moderate = async (action: "mute" | "remove" | "lock" | "unlock" | "end", participantIdentity?: string) => {
    if (!moderatorToken) {
      setError("Moderator authorization is missing. Rejoin as the room creator.");
      return;
    }
    if (action === "end" && !window.confirm("End this meeting for everyone? Participants will be disconnected.")) return;
    if (action === "remove" && !window.confirm("Remove this participant from the room?")) return;
    try {
      const response = await fetch("/api/livekit/room/moderate", { method: "POST", headers: { "content-type": "application/json", Authorization: `Bearer ${moderatorToken}` }, body: JSON.stringify({ action, participantIdentity }) });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Moderator action failed.");
      if (action === "lock") setRoomLocked(true);
      if (action === "unlock") setRoomLocked(false);
      if (action === "remove") refresh();
      if (action === "end") await leave();
    } catch (moderationError) { setError(moderationError instanceof Error ? moderationError.message : "Moderator action failed."); }
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

  const clearRaisedHand = async (participant: Participant) => {
    const room = roomRef.current;
    if (!room || !isModerator || participant.isLocal || !raisedHands.has(participant.identity)) return;
    try {
      const payload = new TextEncoder().encode(JSON.stringify({ type: "hand-cleared" }));
      await room.localParticipant.publishData(payload, {
        reliable: true,
        topic: "infinit-chat",
        destinationIdentities: [participant.identity],
      });
      setRaisedHands((current) => {
        const next = new Set(current);
        next.delete(participant.identity);
        return next;
      });
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : "Unable to acknowledge this raised hand.");
    }
  };

  const toggleRaiseHand = async () => {
    const room = roomRef.current;
    if (!room) return;
    const nextRaised = !handRaised;
    try {
      const payload = new TextEncoder().encode(JSON.stringify({ type: "raise-hand", raised: nextRaised }));
      await room.localParticipant.publishData(payload, { reliable: true, topic: "infinit-chat" });
      setHandRaised(nextRaised);
      setRaisedHands((current) => {
        const next = new Set(current);
        if (nextRaised) next.add(room.localParticipant.identity);
        else next.delete(room.localParticipant.identity);
        return next;
      });
    } catch (handError) {
      setError(handError instanceof Error ? handError.message : "Unable to update raised hand.");
    }
  };

  const sendChat = async () => {
    const room = roomRef.current;
    const text = input.trim();
    if (!room || !text) return;
    if (chatMode === "private" && !privateRecipient) {
      setError("Choose a participant for your private message.");
      return;
    }
    const target = chatMode === "private"
      ? participants.find((participant) => participant.identity === privateRecipient)
      : undefined;
    if (chatMode === "private" && (!target || target.isLocal)) {
      setError("That participant is no longer in this room. Choose another participant.");
      return;
    }
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      sender: room.localParticipant.name || room.localParticipant.identity,
      senderId: room.localParticipant.identity,
      text,
      own: true,
      recipientId: target?.identity,
      recipientName: target ? (target.name || target.identity) : undefined,
    };
    try {
      const persistResponse = await fetch("/api/livekit/chat", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: "Bearer " + attendanceTokenRef.current },
        body: JSON.stringify({ action: "send", clientMessageId: message.id, content: text, recipientIdentity: message.recipientId || null, attachmentPath: message.attachmentPath || null, attachmentName: message.attachmentName || null, attachmentMime: message.attachmentMime || null, attachmentSize: message.attachmentSize || null }),
      });
      const persisted = await persistResponse.json();
      if (!persistResponse.ok) throw new Error(persisted.error || "Unable to save the message.");
      message.createdAt = persisted.message?.createdAt;
      const payload = new TextEncoder().encode(JSON.stringify({
        type: "chat-message", id: message.id, text,
        recipientId: message.recipientId, recipientName: message.recipientName,
      }));
      await room.localParticipant.publishData(payload, {
        reliable: true,
        topic: "infinit-chat",
        ...(target ? { destinationIdentities: [target.identity] } : {}),
      });
      setMessages((current) => [...current, message]);
      setInput("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send the message.");
    }
  };

  const sendAttachment = async (file: File) => {
    const room = roomRef.current;
    if (!room || !attendanceTokenRef.current) return;
    if (file.size > 15 * 1024 * 1024) { setError("Files must be smaller than 15 MB."); return; }
    if (chatMode === "private" && !privateRecipient) { setError("Choose a participant for your private attachment."); return; }
    const target = chatMode === "private" ? participants.find((participant) => participant.identity === privateRecipient) : undefined;
    if (chatMode === "private" && (!target || target.isLocal)) { setError("That participant is no longer in this room."); return; }
    try {
      const form = new FormData(); form.append("file", file);
      const uploadResponse = await fetch("/api/livekit/attachment", { method: "POST", headers: { Authorization: "Bearer " + attendanceTokenRef.current }, body: form });
      const upload = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(upload.error || "Attachment upload failed.");
      const message: ChatMessage = { id: crypto.randomUUID(), sender: room.localParticipant.name || room.localParticipant.identity, senderId: room.localParticipant.identity, text: upload.name, own: true, recipientId: target?.identity, recipientName: target ? (target.name || target.identity) : undefined, attachmentPath: upload.path, attachmentName: upload.name, attachmentMime: upload.mime, attachmentSize: upload.size };
      const saveResponse = await fetch("/api/livekit/chat", { method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer " + attendanceTokenRef.current }, body: JSON.stringify({ action: "send", clientMessageId: message.id, content: upload.name, recipientIdentity: message.recipientId || null, attachmentPath: upload.path, attachmentName: upload.name, attachmentMime: upload.mime, attachmentSize: upload.size }) });
      const saved = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(saved.error || "Unable to save attachment message.");
      message.createdAt = saved.message?.createdAt;
      const payload = new TextEncoder().encode(JSON.stringify({ type: "chat-message", id: message.id, text: message.text, recipientId: message.recipientId, recipientName: message.recipientName, attachmentPath: message.attachmentPath, attachmentName: message.attachmentName, attachmentMime: message.attachmentMime, attachmentSize: message.attachmentSize }));
      await room.localParticipant.publishData(payload, { reliable: true, topic: "infinit-chat", ...(target ? { destinationIdentities: [target.identity] } : {}) });
      setMessages((current) => [...current, message]); setStatusMessage("Attachment sent.");
    } catch (attachmentError) { setError(attachmentError instanceof Error ? attachmentError.message : "Unable to send attachment."); }
  };

  const openAttachment = async (path: string) => {
    try {
      const response = await fetch("/api/livekit/attachment", { method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer " + attendanceTokenRef.current }, body: JSON.stringify({ action: "download", path }) });
      const result = await response.json();
      if (!response.ok || typeof result.url !== "string") throw new Error(result.error || "Unable to open attachment.");
      const link = document.createElement("a"); link.href = result.url; link.target = "_blank"; link.rel = "noopener noreferrer"; link.click();
    } catch (attachmentError) { setError(attachmentError instanceof Error ? attachmentError.message : "Unable to open attachment."); }
  };

  const downloadMeetingCalendar = (meeting: ScheduledMeeting) => {
    const toIcsDate = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const escapeIcs = (value: string) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
    const inviteUrl = new URL("/communication", window.location.origin);
    inviteUrl.searchParams.set("room", roomCode || roomName);
    inviteUrl.searchParams.set("meeting", meeting.title);
    inviteUrl.searchParams.set("startsAt", meeting.starts_at);
    inviteUrl.searchParams.set("endsAt", meeting.ends_at);
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//rkInfinity//Meeting Invite//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + escapeIcs(meeting.id) + "@rkinfinity",
      "DTSTAMP:" + toIcsDate(new Date().toISOString()),
      "DTSTART:" + toIcsDate(meeting.starts_at),
      "DTEND:" + toIcsDate(meeting.ends_at),
      "SUMMARY:" + escapeIcs(meeting.title),
      "DESCRIPTION:" + escapeIcs("Join meeting: " + inviteUrl.toString()),
      "URL:" + inviteUrl.toString(),
      "END:VEVENT",
      "END:VCALENDAR",
      "",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = meeting.title.trim().replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "").slice(0, 60) + ".ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copyInvite = async (meeting?: ScheduledMeeting) => {
    try {
      const inviteUrl = new URL("/communication", window.location.origin);
      inviteUrl.searchParams.set("room", roomCode || roomName);
      if (meeting) {
        inviteUrl.searchParams.set("meeting", meeting.title);
        inviteUrl.searchParams.set("startsAt", meeting.starts_at);
        inviteUrl.searchParams.set("endsAt", meeting.ends_at);
      }
      await navigator.clipboard?.writeText(inviteUrl.toString());
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
                {adminOnly ? "Private administrator communication room." : "Create a room or join using an invite code."}
              </p>
            </div>
            <div className="hidden rounded-2xl border border-white/10 bg-black/20 p-3 sm:block">
              <MessageCircle className="text-primary" size={25} />
            </div>
          </div>
          {meetingInvite ? <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/[0.07] px-4 py-3"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">Meeting invitation</div><div className="mt-1 font-semibold text-white">{meetingInvite.title}</div><div className="mt-1 text-xs text-white/55">Starts: {new Date(meetingInvite.startsAt).toLocaleString()} · Ends: {new Date(meetingInvite.endsAt).toLocaleString()}</div><div className="mt-2 text-[10px] leading-4 text-white/40">Times are shown in your device time zone. The room must be active and available when you join.</div></div> : null}
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
          <label className="mt-4 block text-sm font-medium text-white/75">Room code / invite ID<input value={roomCode} onChange={(event) => setRoomCode(event.target.value)} maxLength={120} placeholder="Paste room code to join" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-white outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10" /></label>
          {error ? <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
          {!adminOnly ? <button type="button" disabled={connecting} onClick={() => void createRoom()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-semibold text-black shadow-[0_12px_35px_rgba(212,175,55,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">{connecting ? <RefreshCw size={17} className="animate-spin" /> : <Users size={17} />}Create Room (you become Moderator)</button> : null}
          <button type="button" disabled={connecting} onClick={() => void join()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 font-semibold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50">{connecting ? <RefreshCw size={17} className="animate-spin" /> : <MessageCircle size={17} />}Join Room</button>
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
            <div className="truncate text-sm font-semibold tracking-tight sm:text-base">{roomCode || roomName}{isModerator ? <span className="ml-2 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-primary">Moderator</span> : null}</div>
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
          <button type="button" onClick={() => setParticipantsOpen((value) => !value)} className={`relative rounded-xl border p-2.5 transition hover:bg-white/[0.08] ${participantsOpen ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 text-white/65 hover:text-white"}`} aria-label="Participants" title="Participants"><Users size={17} /><span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-black">{participants.length}</span></button>
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
            <button type="button" onClick={() => { setChatOpen((value) => !value); setUnreadMessages(0); setMoreOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/75 hover:bg-white/[0.07] hover:text-white"><MessageCircle size={15} /> {chatOpen ? "Close chat" : "Open chat"}{!chatOpen && unreadMessages > 0 ? <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-black">{unreadMessages > 9 ? "9+" : unreadMessages}</span> : null}</button>
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

        {participantsOpen ? (
          <aside className="absolute inset-y-0 left-0 z-20 flex w-[min(320px,92vw)] flex-col border-r border-white/10 bg-[#090a0f]/98 shadow-2xl backdrop-blur-xl sm:relative sm:w-[300px]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
              <div><div className="text-sm font-semibold">Attendance · Live</div><div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">{participants.length} present · {raisedHands.size} hand{raisedHands.size === 1 ? "" : "s"} raised</div></div>
              <div className="flex items-center gap-1">{isModerator ? <button type="button" onClick={exportAttendanceCsv} disabled={attendanceRecords.length === 0} className="rounded-lg border border-primary/25 px-2 py-1.5 text-[10px] text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40" title="Export attendance for this live session">Export CSV</button> : null}<button type="button" onClick={() => setParticipantsOpen(false)} className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white" aria-label="Close participants"><X size={16} /></button></div>
            </div>
            <div className="flex-1 space-y-2 overflow-auto p-3">
              {isModerator ? (
                <section className="mb-3 rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
                  <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-primary">Waiting room</span><span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{pendingAdmissions.length} pending</span></div>
                  {pendingAdmissions.length ? pendingAdmissions.map((request) => (
                    <div key={request.id} className="mb-2 rounded-lg border border-white/10 bg-black/20 p-2.5 last:mb-0">
                      <div className="truncate text-xs text-white/85">{request.name}</div>
                      <div className="mt-1 text-[10px] text-white/35">{new Date(request.createdAt).toLocaleTimeString()}</div>
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={() => void decideAdmission(request.id, "approve")} className="flex-1 rounded-md bg-primary px-2 py-1.5 text-[10px] font-semibold text-black">Admit</button>
                        <button type="button" onClick={() => void decideAdmission(request.id, "reject")} className="flex-1 rounded-md border border-white/10 px-2 py-1.5 text-[10px] text-white/60 hover:bg-white/5">Decline</button>
                      </div>
                    </div>
                  )) : <div className="text-[10px] leading-4 text-white/35">No one is waiting to join.</div>}
                </section>
              ) : null}
              {isModerator ? (
                <section className="mb-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white/80"><CalendarClock size={15} className="text-primary" /> Schedule a meeting</div>
                  <input value={scheduleTitle} onChange={(event) => setScheduleTitle(event.target.value)} maxLength={120} placeholder="Meeting title" className="mb-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none focus:border-primary/40" />
                  <label className="mb-1 block text-[10px] text-white/40">Starts</label>
                  <input type="datetime-local" value={scheduleStartsAt} onChange={(event) => setScheduleStartsAt(event.target.value)} className="mb-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none focus:border-primary/40" />
                  <label className="mb-1 block text-[10px] text-white/40">Ends</label>
                  <input type="datetime-local" value={scheduleEndsAt} onChange={(event) => setScheduleEndsAt(event.target.value)} className="mb-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none focus:border-primary/40" />
                  <button type="button" disabled={scheduleBusy || !scheduleTitle.trim() || !scheduleStartsAt || !scheduleEndsAt} onClick={() => void createScheduledMeeting()} className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40">{scheduleBusy ? "Scheduling…" : "Schedule meeting"}</button>
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">Upcoming meetings</div>
                    {scheduledMeetings.length ? scheduledMeetings.map((meeting) => (
                      <div key={meeting.id} className="mb-2 rounded-lg border border-white/10 bg-black/20 p-2.5 last:mb-0">
                        <div className="text-xs font-medium text-white/85">{meeting.title}</div>
                        <div className="mt-1 text-[10px] leading-4 text-white/40">{new Date(meeting.starts_at).toLocaleString()} – {new Date(meeting.ends_at).toLocaleTimeString()}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <button type="button" onClick={() => void copyInvite(meeting)} className="inline-flex items-center gap-1 text-[10px] text-primary/90 hover:text-primary"><Copy size={11} /> {copied ? "Copied invite link" : "Copy invite link"}</button>
                          <button type="button" onClick={() => downloadMeetingCalendar(meeting)} className="inline-flex items-center gap-1 text-[10px] text-white/60 hover:text-white"><CalendarClock size={11} /> Add to calendar</button>
                          <button type="button" onClick={() => void cancelScheduledMeeting(meeting.id)} className="text-[10px] text-red-300/80 hover:text-red-200">Cancel meeting</button>
                        </div>
                      </div>
                    )) : <div className="text-[10px] text-white/35">No scheduled meetings yet.</div>}
                  </div>
                </section>
              ) : null}
              {[...participants].sort((a, b) => Number(raisedHands.has(b.identity)) - Number(raisedHands.has(a.identity))).map((participant) => (
                <div key={participant.identity} className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${raisedHands.has(participant.identity) ? "border-primary/35 bg-primary/[0.07]" : "border-white/10 bg-white/[0.025]"}`}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">{(participant.name || participant.identity).slice(0, 1).toUpperCase()}</div>
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{participant.name || participant.identity}{participant.isLocal ? " (You)" : ""}{raisedHands.has(participant.identity) ? " ✋" : ""}</div><div className="mt-0.5 text-[10px] text-white/40">{participant.isLocal ? (isModerator ? "Room owner · Moderator" : "You · local participant") : "Participant"}{participantJoinedAt.has(participant.identity) ? ` · Joined ${new Date(participantJoinedAt.get(participant.identity)!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</div>{isModerator && !participant.isLocal ? <div className="mt-2 flex flex-wrap gap-1">{raisedHands.has(participant.identity) ? <button type="button" onClick={() => void clearRaisedHand(participant)} className="rounded-md border border-primary/30 px-2 py-1 text-[10px] text-primary hover:bg-primary/10">Acknowledge hand</button> : null}<button type="button" onClick={() => void moderate("mute", participant.identity)} className="rounded-md border border-white/10 px-2 py-1 text-[10px] hover:bg-white/[0.08]">Mute</button><button type="button" onClick={() => void moderate("remove", participant.identity)} className="rounded-md border border-red-400/20 px-2 py-1 text-[10px] text-red-200 hover:bg-red-500/10">Remove</button></div> : null}</div>
                  <div className="flex items-center gap-1.5 text-white/45" title={participant.isMicrophoneEnabled ? "Microphone enabled" : "Microphone disabled"}>{participant.isMicrophoneEnabled ? <Mic size={14} /> : <MicOff size={14} />}{participant.isCameraEnabled ? <Camera size={14} /> : <CameraOff size={14} />}</div>
                </div>
              ))}
              {participants.length === 0 ? <div className="p-4 text-center text-xs text-white/40">No participants found.</div> : null}
              {isModerator ? (
                <section className="mt-4 border-t border-white/10 pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold">Saved attendance</div>
                      <div className="mt-0.5 text-[10px] text-white/35">{attendanceRecords.length} session record{attendanceRecords.length === 1 ? "" : "s"}</div>
                    </div>
                    <button type="button" onClick={() => void refreshAttendanceHistory()} disabled={!moderatorToken || attendanceLoading} className="rounded-md border border-white/10 px-2 py-1.5 text-[10px] text-white/65 hover:bg-white/[0.06] disabled:opacity-40">
                      {attendanceLoading ? "Loading…" : "Refresh"}
                    </button>
                  </div>
                  {attendanceRecords.length ? (
                    <div className="space-y-2">
                      {[...attendanceRecords].sort((a, b) => b.joinedAt - a.joinedAt).slice(0, 20).map((record, index) => {
                        const end = record.leftAt || Date.now();
                        const minutes = Math.max(0, Math.floor((end - record.joinedAt) / 60000));
                        return <div key={`${record.identity}-${record.joinedAt}-${index}`} className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2">
                          <div className="truncate text-xs font-medium">{record.name}</div>
                          <div className="mt-1 text-[10px] text-white/40">{new Date(record.joinedAt).toLocaleString()} · {record.leftAt ? `${minutes} min` : "In room"}</div>
                        </div>;
                      })}
                    </div>
                  ) : <div className="rounded-lg border border-dashed border-white/10 p-3 text-center text-[10px] text-white/35">No saved attendance yet.</div>}
                </section>
              ) : null}
            </div>
            <div className="border-t border-white/10 p-3 space-y-2">{isModerator ? <><div className="text-[10px] uppercase tracking-wider text-primary">Room moderation</div><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => void moderate(roomLocked ? "unlock" : "lock")} className="rounded-lg border border-white/10 px-2 py-2 text-[11px] hover:bg-white/[0.06]">{roomLocked ? "Unlock room" : "Lock room"}</button><button type="button" onClick={() => void moderate("end")} className="rounded-lg border border-red-400/25 px-2 py-2 text-[11px] text-red-200 hover:bg-red-500/10">End meeting</button></div></> : <div className="text-[11px] leading-5 text-white/40">Only the room creator can moderate this room.</div>}</div>
          </aside>
        ) : null}

        {chatOpen ? (
          <aside className="absolute inset-y-0 right-0 z-20 flex w-[min(380px,94vw)] flex-col border-l border-white/10 bg-[#090a0f]/98 shadow-2xl backdrop-blur-xl sm:relative sm:w-[360px]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
              <div>
                <div className="text-sm font-semibold">Chat</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">Group & private messages</div>
              </div>
              <button type="button" onClick={() => setChatOpen(false)} className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white" aria-label="Close chat"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b border-white/10 p-3">
              <button type="button" onClick={() => setChatMode("group")} className={`rounded-xl px-3 py-2 text-xs font-medium ${chatMode === "group" ? "bg-primary text-black" : "border border-white/10 text-white/65 hover:bg-white/[0.06]"}`}>Group chat</button>
              <button type="button" onClick={() => setChatMode("private")} className={`rounded-xl px-3 py-2 text-xs font-medium ${chatMode === "private" ? "bg-primary text-black" : "border border-white/10 text-white/65 hover:bg-white/[0.06]"}`}>Private chat</button>
              {chatMode === "private" ? <label className="col-span-2 text-xs text-white/55">Send privately to<select value={privateRecipient} onChange={(event) => setPrivateRecipient(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none"><option value="">Choose participant…</option>{participants.filter((participant) => !participant.isLocal).map((participant) => <option key={participant.identity} value={participant.identity}>{participant.name || participant.identity}</option>)}</select></label> : null}
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
              {hasMoreMessages ? (
                <button type="button" disabled={loadingOlderMessages} onClick={async () => {
                  const first = messages.find((message) => message.createdAt);
                  if (!first?.createdAt || !attendanceTokenRef.current) return;
                  setLoadingOlderMessages(true);
                  try {
                    const response = await fetch("/api/livekit/chat", { method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer " + attendanceTokenRef.current }, body: JSON.stringify({ action: "history", limit: 30, before: first.createdAt }) });
                    const page = await response.json();
                    if (!response.ok) throw new Error(page.error || "Unable to load older messages.");
                    const older = (Array.isArray(page.messages) ? page.messages : []).map((message: { id: string; sender: string; senderId: string; text: string; recipientId?: string; createdAt?: string }) => ({ ...message, own: message.senderId === roomRef.current?.localParticipant.identity } satisfies ChatMessage));
                    setMessages((current) => [...older.filter((message) => !current.some((existing) => existing.id === message.id)), ...current]);
                    setHasMoreMessages(Boolean(page.hasMore));
                  } catch (olderError) { setError(olderError instanceof Error ? olderError.message : "Unable to load older messages."); }
                  finally { setLoadingOlderMessages(false); }
                }} className="mx-auto block rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/55 hover:bg-white/5 disabled:opacity-50">
                  {loadingOlderMessages ? "Loading…" : "Load older messages"}
                </button>
              ) : null}
              {messages.filter((message) => {
                if (chatMode === "group") return !message.recipientId;
                const localIdentity = roomRef.current?.localParticipant.identity;
                if (!privateRecipient || !localIdentity) return false;
                const isIncomingConversationMessage = message.senderId === privateRecipient && message.recipientId === localIdentity;
                const isOutgoingConversationMessage = message.senderId === localIdentity && message.recipientId === privateRecipient;
                return isIncomingConversationMessage || isOutgoingConversationMessage;
              }).map((message) => (
                <div key={message.id} className={message.own ? "text-right" : "text-left"}>
                  <div className="mb-1 text-[10px] text-white/35">{message.own ? "You" : message.sender}{message.recipientId ? ` · private${message.own ? ` to ${message.recipientName || "participant"}` : ""}` : ""}</div>
                  <div className={`inline-block max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm ${message.own ? "bg-primary text-black" : "border border-white/10 bg-white/[0.06]"}`}>{message.attachmentPath ? <button type="button" onClick={() => void openAttachment(message.attachmentPath!)} className="flex max-w-full items-center gap-2 text-left underline underline-offset-2"><Paperclip size={14} className="shrink-0" /><span className="truncate">{message.attachmentName || message.text}</span>{message.attachmentSize ? <span className="shrink-0 text-[10px] opacity-60">{(message.attachmentSize / 1048576).toFixed(1)} MB</span> : null}</button> : message.text}</div>
                </div>
              ))}
              {messages.filter((message) => {
                if (chatMode === "group") return !message.recipientId;
                const localIdentity = roomRef.current?.localParticipant.identity;
                if (!privateRecipient || !localIdentity) return false;
                return (message.senderId === privateRecipient && message.recipientId === localIdentity) ||
                  (message.senderId === localIdentity && message.recipientId === privateRecipient);
              }).length === 0 ? <div className="flex h-full items-center justify-center text-center text-xs leading-5 text-white/35">{chatMode === "private" ? "Choose a participant and send a private message." : "No group messages yet. Start the conversation."}</div> : null}
            </div>
            <div className="flex gap-2 border-t border-white/10 p-3">
              <label className="flex cursor-pointer items-center justify-center rounded-xl border border-white/10 px-2.5 text-white/60 hover:bg-white/5" title="Attach a file"><Paperclip size={16} /><input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/mp4,audio/webm,audio/ogg,application/pdf,text/plain" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void sendAttachment(file); event.currentTarget.value = ""; }} /></label>
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
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <div className="mb-2 text-xs font-semibold text-white/75">Notification preferences</div>
                <label className="flex cursor-pointer items-center justify-between gap-3 text-xs text-white/60">
                  <span>Sound for incoming chat messages</span>
                  <input type="checkbox" checked={soundNotifications} onChange={(event) => setSoundNotifications(event.target.checked)} className="h-4 w-4 accent-yellow-500" />
                </label>
                <p className="mt-2 text-[10px] leading-4 text-white/35">Stored on this device. Sound may require a prior browser interaction and is skipped when audio playback is unavailable.</p>
              </div>
              <button type="button" onClick={() => void loadDevices()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-white/65 hover:bg-white/[0.06] hover:text-white"><RefreshCw size={14} /> Refresh devices</button>
            </div>
          </aside>
        ) : null}
      </div>

      <footer className="relative z-30 flex shrink-0 items-center justify-center border-t border-white/10 bg-[#07080d]/95 px-3 py-3.5 backdrop-blur-xl sm:px-5">
        <div className="flex items-center gap-1.5 rounded-[22px] border border-white/10 bg-white/[0.035] p-1.5 shadow-[0_12px_45px_rgba(0,0,0,0.35)] sm:gap-2 sm:p-2">
          <button type="button" onClick={() => void toggleMic()} className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all hover:-translate-y-0.5 hover:bg-white/[0.08] ${mic ? "border-white/10 bg-white/[0.04]" : "border-red-400/30 bg-red-500/15 text-red-200"}`} aria-label={mic ? "Mute microphone" : "Unmute microphone"} title={mic ? "Mute microphone" : "Unmute microphone"}>{mic ? <Mic size={19} /> : <MicOff size={19} />}<span className="pointer-events-none absolute -top-9 rounded-lg border border-white/10 bg-[#0b0c12] px-2 py-1 text-[10px] opacity-0 shadow-xl transition group-hover:opacity-100">{mic ? "Mute" : "Unmute"}</span></button>
          <button type="button" onClick={() => void toggleCamera()} className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all hover:-translate-y-0.5 hover:bg-white/[0.08] ${camera ? "border-white/10 bg-white/[0.04]" : "border-red-400/30 bg-red-500/15 text-red-200"}`} aria-label={camera ? "Turn camera off" : "Turn camera on"} title={camera ? "Turn camera off" : "Turn camera on"}>{camera ? <Camera size={19} /> : <CameraOff size={19} />}<span className="pointer-events-none absolute -top-9 rounded-lg border border-white/10 bg-[#0b0c12] px-2 py-1 text-[10px] opacity-0 shadow-xl transition group-hover:opacity-100">{camera ? "Camera" : "Camera off"}</span></button>
          <button type="button" onClick={() => void toggleScreen()} className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all hover:-translate-y-0.5 hover:bg-primary/10 ${screen ? "border-primary/45 bg-primary/10 text-primary shadow-[0_0_22px_rgba(212,175,55,0.12)]" : "border-white/10 bg-white/[0.04]"}`} aria-label={screen ? "Stop screen sharing" : "Share screen"} title={screen ? "Stop screen sharing" : "Share screen"}><MonitorUp size={19} /><span className="pointer-events-none absolute -top-9 rounded-lg border border-white/10 bg-[#0b0c12] px-2 py-1 text-[10px] opacity-0 shadow-xl transition group-hover:opacity-100">{screen ? "Stop share" : "Share screen"}</span></button>
          <button type="button" onClick={() => void toggleRaiseHand()} className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all hover:-translate-y-0.5 hover:bg-primary/10 ${handRaised ? "border-primary/45 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.04]"}`} aria-label={handRaised ? "Lower hand" : "Raise hand"} title={handRaised ? "Lower hand" : "Raise hand"}><Hand size={19} /><span className="pointer-events-none absolute -top-9 rounded-lg border border-white/10 bg-[#0b0c12] px-2 py-1 text-[10px] opacity-0 shadow-xl transition group-hover:opacity-100">{handRaised ? "Lower hand" : "Raise hand"}</span></button>
          <button type="button" onClick={() => setChatOpen((open) => !open)} className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all hover:-translate-y-0.5 hover:bg-primary/10 ${chatOpen ? "border-primary/45 bg-primary/10 text-primary shadow-[0_0_22px_rgba(212,175,55,0.12)]" : "border-white/10 bg-white/[0.04]"}`} aria-label="Toggle chat" title="Chat"><MessageCircle size={19} /><span className="pointer-events-none absolute -top-9 rounded-lg border border-white/10 bg-[#0b0c12] px-2 py-1 text-[10px] opacity-0 shadow-xl transition group-hover:opacity-100">Chat</span></button>
          <button type="button" onClick={() => setSettingsOpen((open) => !open)} className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all hover:-translate-y-0.5 hover:bg-primary/10 ${settingsOpen ? "border-primary/45 bg-primary/10 text-primary shadow-[0_0_22px_rgba(212,175,55,0.12)]" : "border-white/10 bg-white/[0.04]"}`} aria-label="Settings" title="Settings"><Settings size={19} /><span className="pointer-events-none absolute -top-9 rounded-lg border border-white/10 bg-[#0b0c12] px-2 py-1 text-[10px] opacity-0 shadow-xl transition group-hover:opacity-100">Settings</span></button>
          <div className="mx-1 h-7 w-px bg-white/10" />
          <button type="button" onClick={() => void leave()} className="group relative flex h-11 min-w-11 items-center justify-center rounded-2xl border border-red-400/25 bg-red-500/90 px-3 text-white shadow-[0_8px_28px_rgba(239,68,68,0.2)] transition-all hover:-translate-y-0.5 hover:bg-red-500 sm:min-w-[88px] sm:gap-2" aria-label="Leave meeting" title="Leave meeting"><LogOut size={18} /><span className="hidden text-xs font-semibold sm:inline">Leave</span><span className="pointer-events-none absolute -top-9 rounded-lg border border-white/10 bg-[#0b0c12] px-2 py-1 text-[10px] opacity-0 shadow-xl transition group-hover:opacity-100 sm:hidden">Leave</span></button>
        </div>
      </footer>
      {error ? <div className="fixed bottom-20 left-1/2 z-[60] max-w-[calc(100vw-24px)] -translate-x-1/2 rounded-xl border border-red-400/20 bg-red-950/95 px-4 py-3 text-sm text-red-100 shadow-xl">{error}</div> : statusMessage ? <div role="status" aria-live="polite" className="fixed bottom-20 left-1/2 z-[60] max-w-[calc(100vw-24px)] -translate-x-1/2 rounded-xl border border-emerald-400/25 bg-emerald-950/95 px-4 py-3 text-sm text-emerald-100 shadow-xl">{statusMessage}</div> : null}
    </main>
  );
}
