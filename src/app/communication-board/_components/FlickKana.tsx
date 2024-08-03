"use client";

import "../_styles/style.css";
import { useState } from "react";
import { flushSync } from "react-dom";
import { speak } from "../_modules/speech";
import { getVariant } from "../_modules/kana";

const kana50on: (string | null)[][] = [
  ["あ", "い", "う", "え", "お"],
  ["か", "き", "く", "け", "こ"],
  ["さ", "し", "す", "せ", "そ"],
  ["た", "ち", "つ", "て", "と"],
  ["な", "に", "ぬ", "ね", "の"],
  ["は", "ひ", "ふ", "へ", "ほ"],
  ["ま", "み", "む", "め", "も"],
  ["や", null, "ゆ", null, "よ"],
  ["ら", "り", "る", "れ", "ろ"],
  ["わ", "を", "ん", "ー"],
  ["小", "゛", null, "゜"],
  // TODO:
  // ["定型文"],
  // ["最初から"],
];

export const FlickKana = ({}: // onKanaChange,
{
  // onKanaChange?: (kana: string) => void;
}) => {
  const [typedText, setTypedText] = useState<string>("");
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  console.log(selectedColumn);
  return (
    <div
      className="grid grid-rows-[auto,1fr] grow gap-4 font-bold"
      style={{
        fontFamily: "UD Digital",
      }}
    >
      <div className="grid grid-cols-[auto_1fr_auto] min-h-[10vh]">
        {selectedColumn == null ? (
          <button
            onClick={() => {
              setTypedText((prev) => prev.slice(0, -1));
            }}
            className="px-6 min-w-[15vw] rounded border bg-slate-100 text-[3vw]"
          >
            ◀️ 消す
          </button>
        ) : (
          <button
            onClick={() => {
              setSelectedColumn(null);
            }}
            className="px-6 min-w-[15vw] rounded border bg-slate-100 text-[3vw]"
          >
            🔙 戻る
          </button>
        )}
        <p className="text-[4vw] border rounded min-h-4 bg-white p-2 text-center">
          {typedText.length > 0 ? typedText : "_"}
        </p>
        <button
          onClick={() => {
            speak(typedText);
          }}
          className="px-6 min-w-[15vw] rounded border bg-slate-100 text-[3vw]"
        >
          🎵 再生
        </button>
      </div>

      <div
        className={`grid w-full ${selectedColumn == null ? "grid-cols-4" : ""}`}
      >
        {(selectedColumn == null ? kana50on : [kana50on[selectedColumn]]).map(
          (column, i) => (
            <button
              key={i}
              className={`grid grid-cols-3 grid-rows-3 border ${
                selectedColumn == null ? "cursor-pointer" : ""
              }`}
              onClick={() => {
                if (selectedColumn == null) {
                  document.startViewTransition(() => {
                    flushSync(() => {
                      setSelectedColumn(i);
                    });
                  });
                }
              }}
            >
              {column.map((kana, i) =>
                kana == null ? (
                  <div key={i} />
                ) : (
                  <div
                    key={i}
                    className={`
                    ${i === 0 ? "row-start-2 col-start-2" : ""}
                    ${i === 1 ? "row-start-2 col-start-1" : ""}
                    ${i === 2 ? "row-start-1 col-start-2" : ""}
                    ${i === 3 ? "row-start-2 col-start-3" : ""}
                    ${i === 4 ? "row-start-3 col-start-2" : ""}
                    ${
                      selectedColumn == null
                        ? i !== 0
                          ? "text-[4vw] font-normal"
                          : "text-[6vw] font-bold"
                        : "text-[10vw] font-bold"
                    }
                    ${selectedColumn == null ? "" : "cursor-pointer"}
                    grid place-items-center
                    leading-none h-full px-[1vw] rounded bg-slate-100 border`}
                    style={{
                      viewTransitionName: `char-${(kana as string).charCodeAt(
                        0
                      )}`,
                    }}
                    onClick={() => {
                      if (selectedColumn == null) {
                        return;
                      }
                      setTypedText((prev) => {
                        if (kana === "゛" || kana === "゜" || kana === "小") {
                          const lastChar = prev.slice(-1);
                          const variant = getVariant(lastChar, kana);
                          return prev.slice(0, -1) + variant;
                        }
                        return prev + kana;
                      });

                      setSelectedColumn(null);
                    }}
                  >
                    {kana}
                  </div>
                )
              )}
            </button>
          )
        )}
      </div>
    </div>
  );
};
