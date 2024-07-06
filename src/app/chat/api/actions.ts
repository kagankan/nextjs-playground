"use server";

import { dataset } from "./dataset";
import { z } from "zod";

export const getDataset = async (id: number) => {
  return dataset[id];
};

type MessageForGpt = {
  role: "user" | "system" | "assistant";
  content:
    | string
    | readonly { type: string; text?: string; image_url?: { url: string } }[];
};

type OpenAiResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
};

type Choice = {
  message: Message;
  finish_reason: string;
  index: number;
};

type Message = {
  role: string;
  content: string;
};

type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

const requestSchema = z.object({
  type: z.union([
    z.literal("question"),
    z.literal("answer"),
    z.literal("change"),
  ]),
  message: z.string(),
  quizIndex: z.coerce.number(),
});

type Params = z.infer<typeof requestSchema>;

type State = {
  quizIndex: number;
  messages: {
    id: string;
    type: "question" | "a" | "b" | "answer" | "result";
    content: string;
  }[];
  errors?: Record<string, string[] | undefined>;
};

export async function chatAction(
  state: State,
  formData: FormData
): Promise<State> {
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
    const prompts = JSON.stringify({
      messages: [
        ...(requestType === "question"
          ? ([
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "この画像について、質問に答えてください。",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: requestTarget === "a" ? quizData.a : quizData.b,
                    },
                  },
                ],
              },

              {
                role: "assistant",
                content: `
              ## 必須条件
              - 文字数は100文字以内で返してください。
              - 回答できない内容の場合は、「その質問には回答できません。適切な質問をお送りください。」と返答してください。
            `,
              },
            ] as const)
          : ([
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `間違い探しの判定役になってください。模範解答は「${quizData.answer}」です。`,
                  },
                  { type: "image_url", image_url: { url: quizData.a } },
                  { type: "image_url", image_url: { url: quizData.b } },
                ],
              },
              {
                role: "assistant",
                content: `
              ## 必須条件
              - 解答が正しければ「正解」、間違っていれば「不正解」と返してください。
              - 質問には答えてはいけません。
            `,
              },
            ] as const)),
        {
          role: "user",
          content: `${requestMessage}`,
        },
      ] as const satisfies MessageForGpt[],
      model: "gpt-4o",
    });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: prompts,
    });

    if (!res.ok) {
      console.log(res);
      throw new Error("Failed to fetch data from OpenAI API");
    }

    const data: OpenAiResponse = await res.json();
    return data;
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
          content: response,
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
        content: responseA,
      },
      {
        id: crypto.randomUUID(),
        type: "b",
        content: responseB,
      },
    ],
  };
}
