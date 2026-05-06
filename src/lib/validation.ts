import { z } from "zod";

export const quizProgressSchema = z.object({
  categoryId: z.string().cuid(),
  score: z.number().min(0).max(100),
});

export const errorReportSchema = z.object({
  questionId: z.string().cuid(),
  reason: z.string().min(5).max(500),
});

export const subscriptionSchema = z.object({
  userId: z.string().cuid(),
  months: z.number().min(1).max(12),
  careers: z.array(z.string()),
});
