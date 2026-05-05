import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runChat } from "@/server/chat.server";

const MsgSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1).max(8000),
});
const ChatSchema = z.object({
  messages: z.array(MsgSchema).min(1).max(50),
});

export const chatFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatSchema.parse(input))
  .handler(async ({ data }) => runChat(data.messages));
