"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import { speak } from "../_modules/speech";

const kana50on: string[][] = [
  ["あ", "い", "う", "え", "お"],
  ["か", "き", "く", "け", "こ"],
  ["さ", "し", "す", "せ", "そ"],
  ["た", "ち", "つ", "て", "と"],
  ["な", "に", "ぬ", "ね", "の"],
  ["は", "ひ", "ふ", "へ", "ほ"],
  ["ま", "み", "む", "め", "も"],
  ["や", "ゆ", "よ", "゛", "゜"],
  ["ら", "り", "る", "れ", "ろ"],
  ["わ", "を", "ん", "ー", "小"],
];

const variants: Record<string, Record<string, string>> = {
  // 必要性少なそう
  // あ: ["あ", "ぁ"],
  // い: ["い", "ぃ"],
  // う: ["う", "ぅ"],
  // え: ["え", "ぇ"],
  // お: ["お", "ぉ"],
  か: { "゛": "が" },
  き: { "゛": "ぎ" },
  く: { "゛": "ぐ" },
  け: { "゛": "げ" },
  こ: { "゛": "ご" },
  さ: { "゛": "ざ" },
  し: { "゛": "じ" },
  す: { "゛": "ず" },
  せ: { "゛": "ぜ" },
  そ: { "゛": "ぞ" },
  た: { "゛": "だ" },
  ち: { "゛": "ぢ" },
  つ: { "゛": "づ", 小: "っ" },
  て: { "゛": "で" },
  と: { "゛": "ど" },
  は: { "゛": "ば", "゜": "ぱ" },
  ひ: { "゛": "び", "゜": "ぴ" },
  ふ: { "゛": "ぶ", "゜": "ぷ" },
  へ: { "゛": "べ", "゜": "ぺ" },
  ほ: { "゛": "ぼ", "゜": "ぽ" },
  や: { 小: "ゃ" },
  ゆ: { 小: "ゅ" },
  よ: { 小: "ょ" },
};

const getVariant = (kana: string, decorator: "゛" | "゜" | "小"): string => {
  if (variants[kana] && variants[kana][decorator]) {
    return variants[kana][decorator];
  }
  return `${kana}${decorator}`;
};

export const Kana = ({}: // onKanaChange,
{
  // onKanaChange?: (kana: string) => void;
}) => {
  const [typedText, setTypedText] = useState<string>("");
  // const [current, setCurrent] = useState<BinaryTree>(kana50on);
  console.log("render");
  return (
    <div
      className="grid grid-rows-[auto,1fr,auto] grow gap-4"
      style={{
        fontFamily: "UD デジタル 教科書体 N-B, UD デジタル 教科書体 N-R",
      }}
    >
      <p className="text-[4vw] border rounded min-h-4 bg-white p-2 text-center">
        {typedText.length > 0 ? typedText : "_"}
      </p>
      <button
        onClick={() => {
          speak(typedText);
        }}
        className="p-2 rounded border border-slate-700"
      >
        ▶️ 再生
      </button>

      <div className="grid w-full  [writing-mode:vertical-rl]">
        {kana50on.map((column, i) => (
          <div key={i} className={`grid  gap-[1vw] grid-cols-5 `}>
            {column.map((kana, i) =>
              kana == null ? (
                <div key={i} />
              ) : (
                <div
                  key={i}
                  className={`place-self-center [writing-mode:horizontal-tb] leading-none pt-[0.5vw] px-[1vw] text-[5vw] rounded bg-slate-100 border`}
                  style={{
                    viewTransitionName: `char-${(kana as string).charCodeAt(
                      0
                    )}`,
                  }}
                  onClick={() => {
                    setTypedText((prev) => {
                      if (kana === "゛" || kana === "゜" || kana === "小") {
                        const lastChar = prev.slice(-1);
                        const variant = getVariant(lastChar, kana);
                        return prev.slice(0, -1) + variant;
                      }
                      return prev + kana;
                    });
                  }}
                >
                  {kana}
                </div>
              )
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={() => {
            setTypedText("");
          }}
          className="p-2 rounded border border-slate-700"
        >
          文字をすべて消す
        </button>
        <button
          onClick={() => {
            setTypedText((prev) => prev.slice(0, -1));
          }}
          className="p-2 rounded border border-slate-700"
        >
          1文字消す
        </button>
      </div>
    </div>
  );
};
