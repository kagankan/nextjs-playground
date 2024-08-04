"use client";

import "../_styles/style.css";
import { FC, ReactElement, useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { speak } from "../_modules/speech";
import { getVariant } from "../_modules/kana";
import { phrases } from "../_modules/phrases";
import { HoverClickButton } from "./HoverClickButton";
import { useAtom } from "jotai";
import {
  attentionDurationAtom,
  enableAttentionAtom,
  enableClickAtom,
} from "../_modules/config";

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

export const TableKana = ({}: // onKanaChange,
{
  // onKanaChange?: (kana: string) => void;
}) => {
  const [typedText, setTypedText] = useState<string>("");
  const [paused, setPaused] = useState<boolean>(false);

  // 一度入力したら一定秒数ボタンを無効にする→HoverClickButtonのenterが必要なのでいらなそう
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const [attentionDuration, setAttentionDuration] = useAtom(
    attentionDurationAtom
  );
  const [enableAttention, setEnableAttention] = useAtom(enableAttentionAtom);
  const [enableClick, setEnableClick] = useAtom(enableClickAtom);

  const handleTimer = useCallback(() => {
    if (timer) {
      clearTimeout(timer);
    }
    setIsDisabled(true);
    const newTimer = setTimeout(() => {
      setIsDisabled(false);
    }, 0);
    setTimer(newTimer);
  }, [timer]);

  const actions = {
    全消し: () => {
      speak("全消ししました");
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
      <div className=" sticky top-0 z-10 left-0">
        <fieldset
          className="grid grid-cols-[auto_1fr_auto] min-h-[10vh]"
          disabled={isDisabled}
        >
          <HoverClickButton
            onHoverClick={() => {
              speak("１文字消しました");
              setTypedText((prev) => prev.slice(0, -1));
              handleTimer();
            }}
            onHoverStart={() => {
              speak("消す", { rate: 2, pitch: 0.1 });
            }}
            className="px-6 min-w-[15vw] rounded bg-slate-100 text-[3vw]"
            disabled={paused}
          >
            ◀️ 消す
          </HoverClickButton>

          <HoverClickButton
            onHoverClick={() => {
              speak(typedText, {
                volume: 1.5,
                forcePlay: true,
              });
              handleTimer();
            }}
            className="text-[4vw] border rounded min-h-4 bg-white py-2 px-4 text-start"
            disabled={paused}
          >
            {typedText.length > 0 ? typedText : "_"}
          </HoverClickButton>

          <HoverClickButton
            onHoverClick={() => {
              paused ? speak("再開しました") : speak("一時停止しました");
              setPaused((prev) => !prev);
              handleTimer();
            }}
            onHoverStart={() => {
              speak(paused ? "再開" : "一時停止", { rate: 2, pitch: 0.1 });
            }}
            className="px-6 min-w-[15vw] rounded  bg-slate-100 text-[3vw] z-10"
          >
            {paused ? "▶️ 再開" : "⏸️ 一時停止"}
          </HoverClickButton>
        </fieldset>
      </div>
      <fieldset
        className={`grid w-full ${
          // selectedColumn == null ? "grid-cols-4 gap-2" : ""
          ""
        }`}
        disabled={isDisabled || paused}
      >
        {/* TODO: */}
        {/* {selectedColumn === 10 ? (
          <div className="grid grid-cols-4 border auto-rows-fr gap-2">
            {phrases.map((phrase, i) => (
              <HoverClickButton
                key={i}
                className="grid place-items-center border bg-slate-100 rounded text-[4vw] font-bold leading-none h-full"
                onHoverClick={() => {
                  speak(phrase);
                  setTypedText((prev) => prev + phrase);
                  setSelectedColumn(null);
                  handleTimer();
                }}
              >
                {phrase}
              </HoverClickButton>
            ))}
          </div>
        ) : selectedColumn == null ? ( */}
        <div className="grid w-full  [writing-mode:vertical-rl] grid-cols-5">
          {kana50on.map((column, columnIndex) =>
            column.map((kana, i) =>
              kana == null ? (
                <span key={i} />
              ) : (
                <HoverClickButton
                  key={i}
                  className={`
            ${"text-[6vw] font-bold"}
            grid place-items-center
            min-w-[25vmin] min-h-[25vmin]
            leading-none h-full px-[1vw] rounded bg-slate-100 border`}
                  style={{
                    viewTransitionName: `char-${(kana as string).charCodeAt(
                      0
                    )}`,
                  }}
                  onHoverClick={() => {
                    if (kana in actions) {
                      actions[kana as keyof typeof actions]();
                    } else {
                      let newTypedText;
                      if (kana === "゛" || kana === "゜" || kana === "小") {
                        const lastChar = typedText.slice(-1);
                        const variant = getVariant(lastChar, kana);
                        newTypedText = typedText.slice(0, -1) + variant;
                      } else {
                        newTypedText = typedText + kana;
                      }
                      speak(newTypedText);
                      setTypedText(newTypedText);
                    }

                    // setSelectedColumn(null);
                    handleTimer();
                  }}
                  onHoverStart={() => {
                    speak(
                      kana === "ー"
                        ? "のばしぼう"
                        : kana === "小"
                        ? "こもじ"
                        : kana,
                      {
                        rate: 2,
                        pitch: 0.1,
                      }
                    );
                  }}
                >
                  {kana}
                </HoverClickButton>
              )
            )
          )}
        </div>
      </fieldset>

      {paused && (
        <div className="absolute inset-0 grid place-items-center bg-black bg-opacity-50">
          <p className="text-4xl text-white bg-black p-4">一時停止中</p>
        </div>
      )}

      <dialog
        open
        id="settings"
        className="z-20"
        // className=" backdrop:bg-black backdrop:bg-opacity-50"
      >
        <div className="border p-8 grid gap-4 text-xl w-[80vw] max-w-xl">
          <h2 className="text-2xl">設定</h2>
          <div>
            <label>
              注視の長さ
              <input
                type="range"
                className="w-full"
                value={attentionDuration}
                onChange={(e) => {
                  setAttentionDuration(Number(e.target.value));
                }}
                min={0}
                max={3000}
                step={100}
              />
            </label>
            <output>{attentionDuration}ミリ秒</output>
          </div>
          <label>
            <input
              type="checkbox"
              checked={enableClick}
              onChange={(e) => setEnableClick(e.target.checked)}
            />
            クリックを有効化
          </label>
          <label>
            <input
              type="checkbox"
              checked={enableAttention}
              onChange={(e) => setEnableAttention(e.target.checked)}
            />
            注視を有効化
          </label>
          <button
            type="button"
            onClick={() => {
              document.querySelector<HTMLDialogElement>("#settings")?.close();
            }}
          >
            閉じる
          </button>
        </div>
      </dialog>
    </div>
  );
};
