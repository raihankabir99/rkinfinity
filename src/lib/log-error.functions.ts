import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { logError } from "@/server/log-error.server";

const ErrSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  path: z.string().trim().max(500).optional(),
  level: z.enum(["error", "warn", "info"]).optional(),
  stack: z.string().max(8000).optional(),
});

export const logErrorFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ErrSchema.parse(input))
  .handler(async ({ data }) => logError(data));
