"use client";

import {
  FormEvent,
  startTransition,
  useEffect,
  useOptimistic,
  useState,
} from "react";
import { Visual } from "./Visual";
import { chatAction } from "../api/actions";
import { useFormState } from "react-dom";
import { answerSchema, questionSchema } from "../api/schema";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { z } from "zod";

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
  const [clearFormKey, setClearFormKey] = useState(0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setClearFormKey((prev) => prev + 1);
    const formData = new FormData(event.currentTarget);
    // https://www.sunapro.com/form-multiple-submit-button/
    formData.set(
      // @ts-expect-error
      event.nativeEvent.submitter.name,
      // @ts-expect-error
      event.nativeEvent.submitter.value
    );
    const message = formData.get("message") as string;
    const type = formData.get("type") as "question" | "answer";
    startTransition(() => {
      addOptimisticMessage({
        type: type,
        message: message,
      });
    });
  };

  const formSchema = z.discriminatedUnion("type", [
    answerSchema,
    questionSchema,
  ]);
  const [form, fields] = useForm({
    // lastResult,
    // shouldValidate: "onBlur",
    // shouldRevalidate: "onInput",
    id: `${clearFormKey}`,
    constraint: getZodConstraint(formSchema),
    onValidate: ({ formData }) => {
      const result = parseWithZod(formData, { schema: formSchema });
      console.log(result);
      return result;
    },
    onSubmit: handleSubmit,
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
              >
                <input type="hidden" name="quizIndex" value={state.quizIndex} />

                <div className="flex">
                  <label
                    className="grow flex items-center sr-only"
                    htmlFor={fields.message.id}
                  >
                    送信する内容
                  </label>
                  <input
                    className="border-2 grow border-gray-300 bg-white h-10 px-5 rounded-lg"
                    {...getInputProps(fields.message, { type: "text" })}
                  />

                  <button
                    type="submit"
                    name="type"
                    value="question"
                    className="font-bold bg-slate-500 text-white px-4 py-2 rounded-lg ml-2"
                  >
                    質問する
                  </button>
                  <button
                    type="submit"
                    name="type"
                    value="answer"
                    className=" font-bold  bg-white text-slate-500 border-2 border-slate-500 px-4 py-2 rounded-lg ml-2"
                  >
                    解答する
                  </button>
                </div>
                <p id={fields.message.errorId} className="text-red-500">
                  {fields.message.errors}
                </p>
              </form>
            </section>
          </>
        )}
      </section>
    </section>
  );
};
