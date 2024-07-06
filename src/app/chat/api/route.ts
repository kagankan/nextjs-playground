import fs from "node:fs";

const imagePathA =
  process.cwd() + "/src/app/chat/api/_images/mark_manpu12_hirameki_a.png";
const imageBufferA = fs.readFileSync(imagePathA);
const imageBase64A = imageBufferA.toString("base64");
const imageUrlA = `data:image/png;base64,${imageBase64A}`;
const imagePathB =
  process.cwd() + "/src/app/chat/api/_images/mark_manpu12_hirameki_b.png";
const imageBufferB = fs.readFileSync(imagePathB);
const imageBase64B = imageBufferB.toString("base64");
const imageUrlB = `data:image/png;base64,${imageBase64B}`;

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

type Params =
  | {
      type: "question";
      message: string;
      target: "a" | "b";
    }
  | {
      type: "answer";
      message: string;
    };

export async function POST(request: Request) {
  const requestBody: Params = await request.json();
  console.log(requestBody);
  console.log(request.url);

  const prompts = JSON.stringify({
    messages: [
      ...(requestBody.type === "question"
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
                    url: requestBody.target === "a" ? imageUrlA : imageUrlB,
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
                  text: "間違い探しの判定役になってください。模範解答は「上部の線の大きさが違う」です。",
                },
                { type: "image_url", image_url: { url: imageUrlA } },
                { type: "image_url", image_url: { url: imageUrlB } },
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
        content: `${requestBody.message}`,
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
  console.log(data);
  const choiceIndex = 0;
  return new Response(
    JSON.stringify({
      message: data.choices[choiceIndex]?.message,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
