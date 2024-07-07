import { z } from "zod";

export const questionSchema = z.object({
  type: z.literal("question"),
  message: z
    .string({ required_error: "質問を入力してください。" })
    .min(1, { message: "質問を入力してください。" })
    .max(50, { message: "50文字以内でお願いします。" }),
  quizIndex: z.coerce.number().int(),
});

export const answerSchema = z.object({
  type: z.literal("answer"),
  message: z
    .string({ required_error: "回答を入力してください。" })
    .min(1, { message: "回答を入力してください。" })
    .max(50, { message: "50文字以内でお願いします。" }),
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
