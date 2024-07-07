import { z } from "zod";

export const questionSchema = z.object({
  type: z.literal("question"),
  message: z.string().min(1, { message: "ひっすですよ" }),
  quizIndex: z.coerce.number().int(),
});

export const answerSchema = z.object({
  type: z.literal("answer"),
  message: z.string().min(1),
  quizIndex: z.coerce.number().int(),
});

export const requestSchema = z.union([
  questionSchema,
  answerSchema,
  z.object({
    type: z.literal("change"),
    quizIndex: z.coerce.number().int(),
  }),
]);

type Params = z.infer<typeof requestSchema>;
