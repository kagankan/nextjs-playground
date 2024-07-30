"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import { set } from "zod";

type Unit = [string, string] | string | null;
type BinaryTree = [BinaryTree, BinaryTree] | Unit;

const kana50on: BinaryTree = [
  [
    [
      [
        ["あ", "い"],
        [["う", "え"], "お"],
      ],
      [
        ["か", "き"],
        [["く", "け"], "こ"],
      ],
    ],
    [
      [
        [
          ["さ", "し"],
          [["す", "せ"], "そ"],
        ],
        [
          ["た", "ち"],
          [["つ", "て"], "と"],
        ],
      ],
      [
        ["な", "に"],
        [["ぬ", "ね"], "の"],
      ],
    ],
  ],
  [
    [
      [
        ["は", "ひ"],
        [["ふ", "へ"], "ほ"],
      ],
      [
        ["ま", "み"],
        [["む", "め"], "も"],
      ],
    ],
    [
      [
        [
          ["や", null],
          [["ゆ", null], "よ"],
        ],
        [
          ["ら", "り"],
          [["る", "れ"], "ろ"],
        ],
      ],
      [
        ["わ", "を"],
        ["ん", "ー"],
      ],
    ],
  ],
];

const variants: Record<string, BinaryTree> = {
  // 必要性少なそう
  // あ: ["あ", "ぁ"],
  // い: ["い", "ぃ"],
  // う: ["う", "ぅ"],
  // え: ["え", "ぇ"],
  // お: ["お", "ぉ"],
  か: ["か", "が"],
  き: ["き", "ぎ"],
  く: ["く", "ぐ"],
  け: ["け", "げ"],
  こ: ["こ", "ご"],
  さ: ["さ", "ざ"],
  し: ["し", "じ"],
  す: ["す", "ず"],
  せ: ["せ", "ぜ"],
  そ: ["そ", "ぞ"],
  た: ["た", "だ"],
  ち: ["ち", "ぢ"],
  つ: ["つ", ["づ", "っ"]],
  て: ["て", "で"],
  と: ["と", "ど"],
  は: ["は", ["ば", "ぱ"]],
  ひ: ["ひ", ["び", "ぴ"]],
  ふ: ["ふ", ["ぶ", "ぷ"]],
  へ: ["へ", ["べ", "ぺ"]],
  ほ: ["ほ", ["ぼ", "ぽ"]],
  // や: ["や", "ゃ"],
  // ゆ: ["ゆ", "ゅ"],
  // よ: ["よ", "ょ"],
};

// const actions: BinaryTree = [
//   ["もどる", "文字を消す"],
//   ["はじめから", "おわり"],
// ];

export const BinaryKana = ({}: // onKanaChange,
{
  // onKanaChange?: (kana: string) => void;
}) => {
  const [history, setHistory] = useState<string[]>([]);
  const [current, setCurrent] = useState<BinaryTree>(kana50on);
  console.log("render");
  return (
    <div className="grid grid-rows-[auto,1fr,auto] grow gap-4">
      <p className="text-[4vw] border rounded min-h-4 bg-white p-2 text-center">
        {history.length > 0 ? history.join("") : "_"}
      </p>

      <div className="grid w-full  grid-rows-2 [writing-mode:vertical-rl]">
        {current instanceof Array ? (
          current.map((rightOrLeft, i) => (
            <div
              key={i}
              className={`grid  p-[2vw] gap-[1vw] ${
                current.flat(9).length >= 5 ? "grid-cols-5" : "grid-cols-3"
              } ${i === 0 ? "bg-red-300" : "bg-blue-300"}`}
              onClick={() => {
                console.log("click", rightOrLeft);
                if (rightOrLeft === null) {
                  throw new Error("never reach here");
                }

                // 次の選択肢のどちらかがnullの場合、それを除いた方を選択する
                const next =
                  rightOrLeft[0] == null
                    ? rightOrLeft[1]
                    : rightOrLeft[1] == null
                    ? rightOrLeft[0]
                    : rightOrLeft;
                console.log("next", next);
                if (typeof next === "string") {
                  const arrayEqual = <T,>(a: T[], b: T[]) =>
                    a.length === b.length && a.every((v, i) => v === b[i]);
                  if (
                    next in variants &&
                    !arrayEqual(
                      current,
                      // @ts-expect-error
                      variants[next as keyof typeof variants]
                    )
                  ) {
                    setCurrent(variants[next as keyof typeof variants]);
                  } else {
                    setHistory([...history, next]);
                    setCurrent(kana50on);
                  }
                } else {
                  if (!document.startViewTransition) {
                    setCurrent(next);
                  } else {
                    document.startViewTransition(() => {
                      flushSync(() => {
                        setCurrent(next);
                      });
                    });
                  }
                }
              }}
            >
              {(rightOrLeft instanceof Array ? rightOrLeft : [rightOrLeft])
                .flat(9)
                .map((kana, i) =>
                  kana == null ? (
                    <div key={i} />
                  ) : (
                    <div
                      key={i}
                      className={`place-self-center text-[5vw] rounded bg-slate-100 border`}
                      style={{
                        viewTransitionName: `char-${(kana as string).charCodeAt(
                          0
                        )}`,
                      }}
                    >
                      {kana}
                    </div>
                  )
                )}
            </div>
          ))
        ) : (
          <div>Never reach here</div>
        )}
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={() => {
            setCurrent(kana50on);
            setHistory([]);
          }}
          className="p-2 rounded border border-slate-700"
        >
          文字をすべて消す
        </button>
        <button
          onClick={() => {
            setCurrent(kana50on);
          }}
          className="p-2 rounded border border-slate-700"
        >
          文字を選びなおす
        </button>
      </div>
    </div>
  );
};
