import { ReactNode, useEffect, useRef, useState } from "react";
import { sound } from "../_modules/sound";
import { useAtom } from "jotai";
import {
  attentionDurationAtom,
  enableAttentionAtom,
  enableClickAtom,
} from "../_modules/config";

const HOVER_THRESHOLD = 500;

/**
 * 一定時間ホバーすることでクリックイベントを発火するボタン
 * 視線操作で注視によりクリックするため。
 */
export const HoverClickButton = ({
  onHoverClick,
  onHoverStart,
  children,
  ...props
}: {
  onHoverClick: () => void;
  onHoverStart?: () => void;
  children: ReactNode;
} & JSX.IntrinsicElements["button"]) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const comeBackTimerRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const [attentionDuration] = useAtom(attentionDurationAtom);

  const [enableAttention, setEnableAttention] = useAtom(enableAttentionAtom);
  const [enableClick, setEnableClick] = useAtom(enableClickAtom);

  const rectRef = useRef<SVGRectElement | null>(null);

  // 親の再描画によって変化する可能性があるのでイベントごとにチェックする
  const checkDisabled = () => buttonRef.current?.matches(":disabled");
  const handleHoverStart = () => {
    if (checkDisabled()) {
      return;
    }
    setIsHovered(true);
    onHoverStart?.();
    // hoverTimerRef.current = window.setTimeout(() => {
    //   onHoverClick();
    // }, HOVER_THRESHOLD);
    if (comeBackTimerRef.current) {
      clearTimeout(comeBackTimerRef.current);
    }
  };

  const handleHoverEnd = () => {
    // setIsHovered(false);
    // if (hoverTimerRef.current) {
    //   clearTimeout(hoverTimerRef.current);
    // }

    // 一瞬だけ外れて戻ってきたら継続するようにする
    comeBackTimerRef.current = window.setTimeout(() => {
      setIsHovered(false);
    }, 100);
  };

  useEffect(() => {
    if (isHovered) {
      timeoutRef.current = window.setTimeout(() => {
        setIsAnimating(true);
      }, HOVER_THRESHOLD);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsAnimating(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered]);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        onHoverClick();
        sound();
        setIsAnimating(false);
        setIsHovered(false);
      }, attentionDuration);
      return () => clearTimeout(timer);
    }
  }, [attentionDuration, isAnimating, onHoverClick]);

  // アニメーション
  // SVGのパスの長さを取得する必要があるためJSで実行
  useEffect(() => {
    if (!rectRef.current) {
      return;
    }
    const length = rectRef.current.getTotalLength();
    if (isAnimating) {
      rectRef.current.style.transition = `stroke-dasharray ${attentionDuration}ms linear`;
      rectRef.current.style.strokeDasharray = `${length} ${length}`;
    } else {
      rectRef.current.style.transition = "";
      rectRef.current.style.strokeDasharray = `0 ${length}`;
    }
  }, [attentionDuration, isAnimating]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onMouseEnter={enableAttention ? handleHoverStart : undefined}
      onMouseLeave={enableAttention ? handleHoverEnd : undefined}
      onClick={enableClick ? onHoverClick : undefined}
      {...props}
      style={{
        ...props.style,
        position: "relative",
      }}
    >
      {children}
      <svg
        fill="none"
        strokeWidth="20"
        className={`absolute top-0 left-0 w-full h-full pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          className=" stroke-orange-200"
        />
        <rect
          ref={rectRef}
          x="0"
          y="0"
          width="100%"
          height="100%"
          strokeDasharray="0 9999"
          className=" stroke-orange-500"
        />
      </svg>
    </button>
  );
};
