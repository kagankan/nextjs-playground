"use client";

import {
  FormEvent,
  ReactNode,
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { Visual } from "./Visual";
import { chatAction } from "../api/actions";
import { useFormState } from "react-dom";
import { answerSchema, questionSchema } from "../api/schema";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { ChatLog } from "./ChatLog";
import { Example } from "./Example";

type Message = {
  id: string;
  type: "question" | "a" | "b" | "answer" | "result";
  content: string;
};

export const Message = ({
  dataset,
  defaultContent,
}: {
  dataset: {
    a: string;
    b: string;
    answer: string;
  }[];
  defaultContent: ReactNode;
}) => {
  const [state, dispatch] = useFormState(chatAction, {
    quizIndex: -1,
    messages: [],
    showAnswer: false,
  });

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

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.value = "";
    }
  }, [clearFormKey]);

  const formSchema = z.discriminatedUnion("type", [
    answerSchema,
    questionSchema,
  ]);
  const [form, fields] = useForm({
    // lastResult,
    // shouldValidate: "onBlur",
    // shouldRevalidate: "onInput",
    id: `${state.quizIndex}`,
    constraint: getZodConstraint(formSchema),
    onValidate: ({ formData }) => {
      const result = parseWithZod(formData, { schema: formSchema });
      console.log(result);
      return result;
    },
    onSubmit: handleSubmit,
    defaultNoValidate: false,
    defaultValue: {
      message: "どんな画像ですか？",
    },
  });
  const messageRef = useRef<HTMLInputElement>(null);

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

  const scrollBottomRef = useRef<HTMLDivElement>(null);
  const scrollBottom = () => {
    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollBottom();
  }, [optimisticMessages.messages]);

  const quizData = dataset[state.quizIndex];
  const showDefaultContent = state.quizIndex < 0;

  return (
    <section className="grow flex flex-col">
      <div className="grow w-full px-[5%] max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center gap-6 mb-8 rounded-2xl bg-white p-4">
          <h2>問題を選択</h2>
          <form action={dispatch} className="flex gap-2">
            <input type="hidden" name="type" value="change" />
            {dataset.map((_, index) => (
              <button
                key={index}
                type="submit"
                name="quizIndex"
                value={index}
                aria-current={state.quizIndex === index ? "true" : undefined}
                className="bg-blue-500 text-white py-2 px-4 rounded aria-[current=true]:bg-blue-800"
              >
                {index + 1}
              </button>
            ))}
          </form>
        </div>

        {showDefaultContent ? (
          <div className="my-8">{defaultContent}</div>
        ) : (
          <section className="my-8 grow grid grid-cols-1 grid-rows-[minmax(0,1fr)_auto]">
            <section className="min-h-64 bg-white rounded-2xl p-4">
              <div className="p-8">
                <Visual />
              </div>

              <ChatLog messages={optimisticMessages.messages} />

              {optimisticMessages.messages.length === 0 ? (
                <p className="text-gray-700 text-center py-8">
                  なにか質問してみましょう
                </p>
              ) : state.showAnswer ? (
                <div className="px-8 mt-8">
                  <Visual imageUrlA={quizData.a} imageUrlB={quizData.b} />
                  <p className="text-gray-700 text-center py-8">
                    想定解答： {quizData.answer}
                  </p>
                </div>
              ) : (
                <p className="text-gray-700 text-sm text-center mt-16 py-4">
                  あきらめて答えを見るときは、「降参」と入力して解答を送信します。
                </p>
              )}
              <div ref={scrollBottomRef} />
            </section>
          </section>
        )}
      </div>

      {!showDefaultContent && (
        <section className="p-4 grid grid-cols-1 gap-4 sticky bottom-0 bg-white">
          {/* 質問・解答フォーム */}
          <form
            action={dispatch}
            className="w-full max-w-4xl mx-auto"
            {...getFormProps(form)}
          >
            <input type="hidden" name="quizIndex" value={state.quizIndex} />

            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <label className="sr-only" htmlFor={fields.message.id}>
                送信する内容
              </label>
              <input
                className="border-2 grow-[9999] border-gray-300 bg-white h-10 px-5 rounded-lg"
                ref={messageRef}
                {...getInputProps(fields.message, { type: "text" })}
                maxLength={undefined} // 入力できないと不便なので制限しない
              />

              <div className="flex gap-2 grow justify-end">
                <button
                  type="submit"
                  name="type"
                  value="question"
                  className="font-bold bg-slate-500 text-white px-4 py-2 rounded-lg"
                >
                  質問する
                </button>
                <button
                  type="submit"
                  name="type"
                  value="answer"
                  className=" font-bold  bg-white text-slate-500 border-2 border-slate-500 px-4 py-2 rounded-lg"
                >
                  解答する
                </button>
              </div>
            </div>
            <p id={fields.message.errorId} className="text-red-500">
              {fields.message.errors}
            </p>
          </form>
        </section>
      )}
    </section>
  );
};
