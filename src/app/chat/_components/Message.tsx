"use client";

import { useState } from "react";

export const Message = () => {
  const [messagesA, setMessagesA] = useState<string[]>([]);
  const [messagesB, setMessagesB] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;
    setMessagesA((prev) => [...prev, message]);
    setMessagesB((prev) => [...prev, message]);

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

      setMessagesA((prev) => [...prev, response.message.content]);
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

      setMessagesB((prev) => [...prev, response.message.content]);
    })();
  };

  const handleAnswer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const answer = formData.get("answer") as string;
    setAnswers((prev) => [...prev, answer]);

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

      setAnswers((prev) => [...prev, response.message.content]);
    })();
  };

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type a message"
          name="message"
          className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
        />
        <button type="submit">Send</button>
      </form>
      <div className="flex flex-col space-y-4 h-96 overflow-y-scroll bg-gray-100 p-4 border-2 border-gray-300 rounded-lg">
        <ul>
          {messagesA.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
        <ul>
          {messagesB.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </div>
      <form onSubmit={handleAnswer}>
        <label>
          答える
          <input type="text" name="answer" />
          <button type="submit">Send</button>
        </label>
      </form>
      <ul>
        {answers.map((answer, index) => (
          <li key={index}>{answer}</li>
        ))}
      </ul>
    </section>
  );
};
