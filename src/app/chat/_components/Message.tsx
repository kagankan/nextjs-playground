"use client";

import {
  FormEvent,
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { Visual } from "./Visual";
import { chatAction } from "../api/actions";
import { useFormState } from "react-dom";
import { questionSchema } from "../api/schema";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";

type Message = {
  id: string;
  type: "question" | "a" | "b" | "answer" | "result";
  content: string;
};

export const Message = ({
  dataset,
}: {
  dataset: {
    a: string;
    b: string;
    answer: string;
  }[];
}) => {
  const [state, dispatch] = useFormState(chatAction, {
    quizIndex: -1,
    messages: [],
  });

  const [scriptEnabled, setScriptEnabled] = useState(false);
  useEffect(() => {
    setScriptEnabled(true);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const message = formData.get("message") as string;
    const type = formData.get("type") as "question" | "answer";
    startTransition(() => {
      addOptimisticMessage({
        type: type,
        message: message,
      });
    });
  };

  const [form, fields] = useForm({
    // lastResult,
    // shouldValidate: "onBlur",
    // shouldRevalidate: "onInput",
    constraint: getZodConstraint(questionSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: questionSchema });
    },
    onSubmit: handleSubmit,
  });

  // 送信時にフォームをリセット
  // FIXME: 動作に基づく処理をuseEffectでやるのよくないのでどうにかしたい
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  });

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    state,
    (
      state,
      newMessage: {
        type: "question" | "answer";
        message: string;
      }
    ) => ({
      ...state,
      messages: [
        ...state.messages,
        ...(newMessage.type === "question"
          ? [
              {
                id: crypto.randomUUID(),
                type: "question",
                content: newMessage.message,
              } as const,
              {
                id: crypto.randomUUID(),
                type: "a",
                content: "（考え中）",
              } as const,
              {
                id: crypto.randomUUID(),
                type: "b",
                content: "（考え中）",
              } as const,
            ]
          : newMessage.type === "answer"
          ? [
              {
                id: crypto.randomUUID(),
                type: "answer",
                content: newMessage.message,
              } as const,
              {
                id: crypto.randomUUID(),
                type: "result",
                content: "（判定中）",
              } as const,
            ]
          : []),
      ],
    })
  );

  const images = dataset[state.quizIndex];

  return (
    <section>
      <div className="flex flex-col space-y-4">
        <h2>問題を選択</h2>
        <form action={dispatch} className="flex gap-2" id="questions-select">
          <input type="hidden" name="type" value="change" />
          <input type="hidden" name="message" value="" />
          {dataset.map((_, index) => (
            <button
              key={index}
              type="submit"
              name="quizIndex"
              value={index}
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              {index}
            </button>
          ))}
        </form>
      </div>
      <section className="grow grid grid-cols-1 grid-rows-[minmax(0,1fr)_auto]">
        {state.quizIndex >= 0 && (
          <>
            <section className="min-h-64 bg-white rounded-lg border-2">
              <div className="p-8">
                <Visual />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6  p-4 border-gray-300">
                {optimisticMessages.messages.map((message, index) =>
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

              <details>
                <summary className="bg-slate-500 text-white px-4 py-2 rounded-lg">
                  答えを表示
                </summary>
                <div className="p-4">
                  <Visual imageUrlA={images.a} imageUrlB={images.b} />
                </div>
              </details>
            </section>

            <section className="p-4 grid grid-cols-1 gap-4 sticky bottom-0 bg-white">
              {/* 質問・解答フォーム */}
              <form
                action={dispatch}
                {...getFormProps(form)}
                noValidate={scriptEnabled}
                className="flex"
              >
                <input type="hidden" name="quizIndex" value={state.quizIndex} />
                <label className="grow flex items-center">
                  <input type="radio" name="type" value="question" />
                  質問
                </label>
                <label className="grow flex items-center">
                  <input type="radio" name="type" value="answer" />
                  解答
                </label>

                <label className="grow flex items-center">
                  内容
                  <input
                    ref={inputRef}
                    className="border-2 grow border-gray-300 bg-white h-10 px-5 rounded-lg"
                    {...getInputProps(fields.message, { type: "text" })}
                  />
                </label>
                <p id={fields.message.errorId}>{fields.message.errors}</p>
                <button
                  type="submit"
                  className="bg-slate-500 text-white px-4 py-2 rounded-lg ml-2"
                >
                  送信
                </button>
              </form>
            </section>
          </>
        )}
      </section>
    </section>
  );
};
