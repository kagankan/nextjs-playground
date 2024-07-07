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
      // https://www.promptingguide.ai/jp/introduction/settings
      model: "gpt-4o",
      temperature: 0.0,
      max_tokens: 100,
      // https://www.promptingguide.ai/jp/introduction/basics
      messages:
        requestType === "question"
          ? [
              {
                role: "system",
                content: `
              これから与えられる画像についての質問に答えてください。

              ## 必須条件
              - 100文字以内で簡潔に説明します。
              - 画像に関係ない質問など、回答できない内容の場合には「回答できません」と返してください。
              - 画像から読み取れる情報のみを正確に説明します。
            `,
              },
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: requestTarget === "a" ? quizData.a : quizData.b,
                    },
                  },
                  {
                    type: "text",
                    text: `${requestMessage}`,
                  },
                ],
              },
            ]
          : [
              {
                role: "system",
                content: `
                これから与えられる2枚の画像は、ほとんど同じではあるが一部のみ違う間違い探しの画像です。
                解答に対して、間違い探しの判定役になってください。
                ## 必須条件
                - 2枚の画像と模範解答が与えられたあと、ユーザーの解答が送信されます。その解答に対して、正解かどうかを判定します。
                - 判定は以降の4つの選択肢のいずれかで行います。
                  - 解答が正しければ「正解です！」を返す。
                    - 必ずしも模範解答と一致していなくても、画像から読み取れる違いを指摘していれば正解とします。
                  - 間違っていれば「違います。」を返す。
                  - 間違いではないが、本当にわかっているか怪しい場合は「曖昧です。もっと詳しく説明してください。」を返す。
                  - 質問など、間違いの指摘ではない場合は「間違いを指摘してください。」と返す。
                - 質問には答えない。
                - 特に、画像の内容については触れない。

                ## 判定の例（模範解答が「片方の本にだけ、表紙に「English」の文字が書かれている」の場合）
                A: 本の表紙
                判定: 曖昧です
                A: 文字の有無
                判定: 曖昧です
                A: 本の表紙に文字がある
                判定: 正解
                A: 本の表紙に「English」と書かれている
                判定: 正解
                A: 本の色
                判定: 違います
                A: 本
                判定: 曖昧です
                A: 人
                判定: 違います
                `,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `模範解答は「${quizData.answer}」です。`,
                  },
                  {
                    type: "image_url",
                    image_url: { url: quizData.a },
                  },
                  {
                    type: "image_url",
                    image_url: { url: quizData.b },
                  },
                ],
              },
              {
                role: "user",
                content: `A: ${requestMessage}`,
              },
            ],
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
