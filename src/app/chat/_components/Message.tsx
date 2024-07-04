"use client";

import { useState } from "react";

export const Message = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;
    setMessages((prev) => [...prev, message]);

    (async () => {
      const res = await fetch("/chat/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message }),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch data from OpenAI API");
      }
      const response = await res.json();
      console.log(response.message.content);

      setMessages((prev) => [...prev, response.message.content]);
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
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </section>
  );
};
