import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

export function CommentForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("Comment posted — thanks for sharing!");
      setForm({ name: "", email: "", message: "" });
      setLoading(false);
    }, 600);
  };

  const fieldClass =
    "w-full rounded-lg bg-black/80 border border-[color:var(--gold)]/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[color:var(--gold-bright)] focus:shadow-[0_0_0_3px_oklch(0.78_0.14_85/0.15)] transition";

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-black border border-[color:var(--gold)]/50 text-[color:var(--gold-bright)]">
          <MessageSquare size={18} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Post a Comment</h2>
          <p className="text-sm text-muted-foreground">Join the conversation.</p>
        </div>
      </div>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl bg-black/40 border border-[color:var(--gold)]/20 p-6"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            maxLength={100}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={fieldClass}
            required
          />
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            maxLength={255}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={fieldClass}
            required
          />
        </div>
        <textarea
          placeholder="Your message…"
          value={form.message}
          maxLength={1000}
          rows={5}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={fieldClass}
          required
        />
        <button type="submit" disabled={loading} className="btn-gold disabled:opacity-60">
          {loading ? "Posting…" : "Post Comment"} <Send size={16} />
        </button>
      </form>
    </section>
  );
}
