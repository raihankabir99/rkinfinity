import { MessageCircle } from "lucide-react";

export function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/966540742748"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-[60] grid h-14 w-14 place-items-center rounded-full text-black wa-pulse-glow"
      style={{ background: "var(--gradient-gold)" }}
    >
      <MessageCircle size={26} strokeWidth={2.5} />
    </a>
  );
}
