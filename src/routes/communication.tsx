import { createFileRoute } from "@tanstack/react-router";
import { LiveKitRoom } from "@/components/LiveKitRoom";

export const Route = createFileRoute("/communication")({
  head: () => ({
    meta: [
      { title: "Infinit Chat — rkInfinity" },
      {
        name: "description",
        content: "Infinit Chat realtime communication room powered by LiveKit.",
      },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: Communication,
});

function Communication() {
  return <LiveKitRoom roomName="Infinit Chat" />;
}
