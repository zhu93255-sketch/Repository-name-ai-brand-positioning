import { z } from "zod";

export const brandRequestSchema = z.object({
  brandDescription: z
    .string()
    .trim()
    .min(20, "Brand description should be at least 20 characters."),
});

export const feedbackVoteSchema = z.object({
  inputText: z.string().trim().min(1),
  voteType: z.enum(["helpful", "unhelpful"]),
});

export const brandStrategySchema = z.object({
  oneSentencePitch: z.string().min(15).max(30),
  brandPositioning: z.string().min(1),
  coreSellingPoints: z.array(z.string().min(1)).min(3).max(5),
  userPersona: z.object({
    summary: z.string().min(1),
    traits: z.array(z.string().min(1)).min(3).max(5),
    painPoints: z.array(z.string().min(1)).min(3).max(5),
  }),
  differentiationAdvantages: z
    .array(z.string().min(1))
    .min(3)
    .max(5),
  xiaohongshuContentDirections: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        exampleTopics: z.array(z.string().min(1)).min(2).max(3),
      }),
    )
    .min(3)
    .max(5),
});

export type BrandRequest = z.infer<typeof brandRequestSchema>;
export type BrandStrategy = z.infer<typeof brandStrategySchema>;
export type FeedbackVote = z.infer<typeof feedbackVoteSchema>;
