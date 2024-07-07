export const ChatLog = ({
  messages,
}: Readonly<{
  messages: readonly {
    type: "question" | "answer" | "a" | "b" | "result";
    content: string;
  }[];
}>) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-6   border-gray-300 text-sm sm:text-base">
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
            message.type === "a"
              ? "bg-red-100 col-start-1"
              : "bg-blue-100 col-start-2"
          }`}
        >
          {message.content}
        </p>
      )
    )}
  </div>
);
