"use client";

import { useState } from "react";
import { Visual } from "./Visual";

type Message = {
  id: string;
  type: "question" | "a" | "b" | "answer" | "result";
  content: string;
};

export const Message = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [formType, setFormType] = useState<"question" | "answer">("question");
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;
    const id = crypto.randomUUID();
    const idA = crypto.randomUUID();
    const idB = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id, type: "question", content: message },
      { id: idA, type: "a", content: "（考え中）" },
      { id: idB, type: "b", content: "（考え中）" },
    ]);

    void (async () => {
      const res = await fetch("/chat/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "question",
          target: "a",
          message: message,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch data from OpenAI API");
      }
      const response = await res.json();
      console.log(response.message.content);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === idA
            ? { ...message, content: response.message.content }
            : message
        )
      );
    })();

    void (async () => {
      const res = await fetch("/chat/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "question",
          target: "b",
          message: message,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch data from OpenAI API");
      }
      const response = await res.json();
      console.log(response.message.content);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === idB
            ? { ...message, content: response.message.content }
            : message
        )
      );
    })();
  };

  const handleAnswer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const answer = formData.get("answer") as string;

    const id = crypto.randomUUID();
    const idResult = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: id, type: "answer", content: answer },
      { id: idResult, type: "result", content: "（判定中）" },
    ]);
    // setAnswers((prev) => [...prev, answer]);

    void (async () => {
      const res = await fetch("/chat/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "answer",
          message: answer,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch data from OpenAI API");
      }
      const response = await res.json();
      console.log(response.message.content);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === idResult
            ? { ...message, content: response.message.content }
            : message
        )
      );
    })();
  };

  return (
    <section className="grow grid grid-cols-1 grid-rows-[minmax(0,1fr)_auto]">
      <section className="min-h-64 bg-white rounded-lg border-2">
        <div className="p-8">
          <Visual />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6  p-4 border-gray-300">
          {messages.map((message, index) =>
            message.type === "question" ? (
              <p
                key={index}
                className="px-4 py-2 rounded-3xl justify-self-end col-span-2 bg-slate-100"
              >
                Q. {message.content}
              </p>
            ) : message.type === "answer" ? (
              <p
                key={index}
                className="px-4 py-2 rounded-3xl justify-self-end  col-span-2 bg-slate-100"
              >
                A. {message.content}
              </p>
            ) : message.type === "result" ? (
              <p
                key={index}
                className="px-4 py-2 rounded-3xl justify-self-start col-span-2 bg-slate-100"
              >
                {message.content}
              </p>
            ) : (
              <p
                key={index}
                className={`px-4 py-2 rounded-3xl self-start ${
                  message.type === "a" ? "bg-red-100" : "bg-blue-100"
                }`}
              >
                {message.content}
              </p>
            )
          )}
        </div>
      </section>

      <div className="p-4 grid grid-cols-1 gap-4 sticky bottom-0 bg-white">
        {/* タブUIでformTypeを選択する */}
        <div role="tablist" className="flex">
          <button
            role="tab"
            aria-selected={formType === "question"}
            onClick={() => setFormType("question")}
            className={`px-4 py-2 rounded-lg ${
              formType === "question"
                ? "bg-slate-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            質問する
          </button>
          <button
            role="tab"
            aria-selected={formType === "answer"}
            onClick={() => setFormType("answer")}
            className={`px-4 py-2 rounded-lg ml-2 ${
              formType === "answer"
                ? "bg-slate-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            答える
          </button>
        </div>

        {/* 質問フォーム */}
        <div role="tabpanel" hidden={formType !== "question"}>
          <form
            onSubmit={handleSubmit}
            className="flex"
            hidden={formType !== "question"}
          >
            <label className="grow flex items-center">
              質問内容
              <input
                type="text"
                name="message"
                className="border-2 grow border-gray-300 bg-white h-10 px-5 rounded-lg"
              />
            </label>
            <button
              type="submit"
              className="bg-slate-500 text-white px-4 py-2 rounded-lg ml-2"
            >
              質問する
            </button>
          </form>
        </div>
        {/* 解答フォーム */}
        <div role="tabpanel" hidden={formType !== "answer"}>
          <form
            onSubmit={handleAnswer}
            className="flex"
            hidden={formType !== "answer"}
          >
            <label className="grow flex items-center">
              解答内容
              <input
                type="text"
                name="answer"
                className="border-2 grow border-gray-300 bg-white h-10 px-5 rounded-lg"
              />
              <button
                type="submit"
                className="bg-slate-500 text-white px-4 py-2 rounded-lg ml-2"
              >
                答える
              </button>
            </label>
          </form>
        </div>
      </div>
    </section>
  );
};
