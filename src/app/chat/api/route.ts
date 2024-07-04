type MessageForGpt = {
  role: "user" | "system" | "assistant";
  content: string;
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

export async function POST(request: Request) {
  const requestBody = await request.json();
  console.log(requestBody);
  const { message } = requestBody;
  const prompts = JSON.stringify({
    messages: [
      {
        role: "assistant",
        content: `
              ## 必須条件
              - 文字数は100文字以内で返してください。
              - 回答できない内容の場合は、「その質問には回答できません。適切な質問をお送りください。」と返答してください。
            `,
      },
      {
        role: "user",
        content: `${message}`,
      },
    ] as const satisfies MessageForGpt[],
    model: "gpt-3.5-turbo",
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
