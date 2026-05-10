import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runWeeklyReport } from "@/server/weekly-report.server";

const WeeklyReportSchema = z.object({
  secret: z.string().max(500).nullable().optional(),
});

export const weeklyReportFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => WeeklyReportSchema.parse(input))
  .handler(async ({ data }) => runWeeklyReport(data.secret));
