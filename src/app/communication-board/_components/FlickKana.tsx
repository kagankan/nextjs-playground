"use client";

import "../_styles/style.css";
import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { speak } from "../_modules/speech";
import { getVariant } from "../_modules/kana";
import { phrases } from "../_modules/phrases";

const kana50on = [
  ["あ", "い", "う", "え", "お"],
  ["か", "き", "く", "け", "こ"],
  ["さ", "し", "す", "せ", "そ"],
  ["た", "ち", "つ", "て", "と"],
  ["な", "に", "ぬ", "ね", "の"],
  ["は", "ひ", "ふ", "へ", "ほ"],
  ["ま", "み", "む", "め", "も"],
  ["や", "゛", "ゆ", "゜", "よ"],
  ["ら", "り", "る", "れ", "ろ"],
  ["わ", "を", "ん", "ー", "小"],
  ["定型文"],
  ["全消し"],
] as const satisfies (string | null)[][];

export const FlickKana = ({}: // onKanaChange,
{
  // onKanaChange?: (kana: string) => void;
}) => {
  const [typedText, setTypedText] = useState<string>("");
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  console.log(selectedColumn);

  // 一度入力したら一定秒数ボタンを無効にする
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTimer = useCallback(() => {
    if (timer) {
      clearTimeout(timer);
    }
    setIsDisabled(true);
    const newTimer = setTimeout(() => {
      setIsDisabled(false);
    }, 500);
    setTimer(newTimer);
  }, [timer]);

  const actions = {
    全消し: () => {
      setTypedText("");
      handleTimer();
    },
  } satisfies Partial<
    Record<NonNullable<(typeof kana50on)[number][number]>, () => void>
  >;

  return (
    <div
      className="grid grid-rows-[auto,1fr] grow gap-4 font-bold"
      style={{
        fontFamily: "UD Digital",
      }}
    >
      <fieldset
        className="grid grid-cols-[auto_1fr_auto] min-h-[10vh]"
        disabled={isDisabled}
      >
        {selectedColumn == null ? (
          <button
            onClick={() => {
              setTypedText((prev) => prev.slice(0, -1));
              handleTimer();
            }}
            className="px-6 min-w-[15vw] rounded bg-slate-100 text-[3vw]   border-8 border-white hover:border-orange-500"
          >
            ◀️ 消す
          </button>
        ) : (
          <button
            onClick={() => {
              setSelectedColumn(null);
              handleTimer();
            }}
            className="px-6 min-w-[15vw] rounded bg-slate-100 text-[3vw]   border-8 border-white hover:border-orange-500"
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
            handleTimer();
          }}
          className="px-6 min-w-[15vw] rounded  bg-slate-100 text-[3vw]   border-8 border-white hover:border-orange-500"
        >
          🎵 再生
        </button>
      </fieldset>

      <fieldset
        className={`grid w-full ${selectedColumn == null ? "grid-cols-4" : ""}`}
        disabled={isDisabled}
      >
        {selectedColumn === 10 ? (
          <div className="grid grid-cols-4 border auto-rows-fr">
            {phrases.map((phrase, i) => (
              <button
                key={i}
                className="grid place-items-center border-8 border-white hover:border-orange-500 bg-slate-100 rounded text-[4vw] font-bold leading-none h-full"
                onClick={() => {
                  speak(phrase);
                  setTypedText((prev) => prev + phrase);
                  handleTimer();
                }}
              >
                {phrase}
              </button>
            ))}
          </div>
        ) : (
          (selectedColumn == null ? kana50on : [kana50on[selectedColumn]]).map(
            (column, columnIndex) => (
              <button
                key={columnIndex}
                className={`grid grid-cols-3 grid-rows-3 ${
                  selectedColumn == null
                    ? "cursor-pointer  border-8 border-white hover:border-orange-500"
                    : ""
                }`}
                onClick={() => {
                  if (selectedColumn == null) {
                    document.startViewTransition(() => {
                      flushSync(() => {
                        setSelectedColumn(columnIndex);
                      });
                    });
                    handleTimer();
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
                    ${
                      columnIndex > 9
                        ? "row-span-3 col-span-3"
                        : i === 0
                        ? "row-start-2 col-start-2"
                        : ""
                    }
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
                    ${
                      selectedColumn == null
                        ? ""
                        : "cursor-pointer  border-8 border-white hover:border-orange-500"
                    }
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
                        if (kana in actions) {
                          actions[kana as keyof typeof actions]();
                        } else {
                          let newTypedText;
                          if (kana === "゛" || kana === "゜" || kana === "小") {
                            const lastChar = typedText.slice(-1);
                            const variant = getVariant(lastChar, kana);
                            speak(variant);
                            newTypedText = typedText.slice(0, -1) + variant;
                          } else {
                            speak(kana);
                            newTypedText = typedText + kana;
                          }
                          setTypedText(newTypedText);
                        }
                        setSelectedColumn(null);
                        handleTimer();
                      }}
                    >
                      {kana}
                    </div>
                  )
                )}
              </button>
            )
          )
        )}
      </fieldset>
    </div>
  );
};
