import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { submitLead } from "@/server/lead.server";

const LeadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1).max(4000),
  source: z.string().trim().max(80).optional(),
});

export const submitLeadFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LeadSchema.parse(input))
  .handler(async ({ data }) => submitLead(data));
