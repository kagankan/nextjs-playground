"use server";

import OpenAI from "openai";
import { dataset } from "./dataset";
import { requestSchema } from "./schema";

type State = {
  quizIndex: number;
  messages: {
    id: string;
    type: "question" | "a" | "b" | "answer" | "result";
    content: string;
  }[];
  errors?: Record<string, string[] | undefined>;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatAction(
  state: State,
  formData: FormData
): Promise<State> {
  console.log(formData);
  const validatedData = requestSchema.safeParse({
    type: formData.get("type"),
    message: formData.get("message"),
    quizIndex: formData.get("quizIndex"),
  });
  console.log(validatedData);
  if (!validatedData.success) {
    return {
      quizIndex: state.quizIndex,
      messages: state.messages,
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  if (validatedData.data.type === "change") {
    return {
      quizIndex: validatedData.data.quizIndex,
      messages: [],
    };
  }

  const quizData = dataset[validatedData.data.quizIndex];

  const requestGpt = async (
    requestType: "question" | "answer",
    requestMessage: string,
    requestTarget?: "a" | "b"
  ) => {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        ...(requestType === "question"
          ? [
              {
                role: "user" as const,
                content: [
                  {
                    type: "text" as const,
                    text: "この画像について、質問に答えてください。",
                  },
                  {
                    type: "image_url" as const,
                    image_url: {
                      url: requestTarget === "a" ? quizData.a : quizData.b,
                    },
                  },
                ],
              },

              {
                role: "assistant" as const,
                content: `
                ## 必須条件
                - 文字数は100文字以内で返してください。
                - 回答できない内容の場合は、「その質問には回答できません。適切な質問をお送りください。」と返答してください。
              `,
              },
            ]
          : [
              {
                role: "user" as const,
                content: [
                  {
                    type: "text" as const,
                    text: `間違い探しの判定役になってください。模範解答は「${quizData.answer}」です。`,
                  },
                  {
                    type: "image_url" as const,
                    image_url: { url: quizData.a },
                  },
                  {
                    type: "image_url" as const,
                    image_url: { url: quizData.b },
                  },
                ],
              },
              {
                role: "assistant" as const,
                content: `
                ## 必須条件
                - 解答が正しければ「正解」、間違っていれば「不正解」と返してください。
                - 質問には答えてはいけません。
              `,
              },
            ]),
        {
          role: "user",
          content: `${requestMessage}`,
        },
      ],
      model: "gpt-4o",
      temperature: 0.0,
    });

    return chatCompletion;
  };

  const { message, type } = validatedData.data;

  if (type === "answer") {
    const data = await requestGpt("answer", message);
    const response = data.choices[0].message.content;

    return {
      quizIndex: state.quizIndex,
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          type: "answer",
          content: message,
        },
        {
          id: crypto.randomUUID(),
          type: "result",
          content: response == null ? "エラー" : response,
        },
      ],
    };
  }

  const dataA = await requestGpt("question", message, "a");
  const responseA = dataA.choices[0].message.content;

  const dataB = await requestGpt("question", message, "b");
  const responseB = dataB.choices[0].message.content;
  return {
    quizIndex: state.quizIndex,
    messages: [
      ...state.messages,
      {
        id: crypto.randomUUID(),
        type: "question",
        content: message,
      },
      {
        id: crypto.randomUUID(),
        type: "a",
        content: responseA == null ? "エラー" : responseA,
      },
      {
        id: crypto.randomUUID(),
        type: "b",
        content: responseB == null ? "エラー" : responseB,
      },
    ],
  };
}
