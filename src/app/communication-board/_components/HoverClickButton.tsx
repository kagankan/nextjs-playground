import { ReactNode, useEffect, useRef, useState } from "react";

const HOVER_THRESHOLD = 500;
const ANIMATION_DURATION = 1000;

/**
 * 一定時間ホバーすることでクリックイベントを発火するボタン
 * 視線操作で注視によりクリックするため。
 */
export const HoverClickButton = ({
  onHoverClick,
  children,
  disableDefaultClick = false,
  ...props
}: {
  onHoverClick: () => void;
  children: ReactNode;
  disableDefaultClick?: boolean;
} & JSX.IntrinsicElements["button"]) => {
  const [isHovered, setIsHovered] = useState(false);
  // const hoverTimerRef = useRef<number | null>(null);

  const handleHoverStart = () => {
    console.log("hover start");
    setIsHovered(true);
    // hoverTimerRef.current = window.setTimeout(() => {
    //   onHoverClick();
    // }, HOVER_THRESHOLD);
  };

  const handleHoverEnd = () => {
    console.log("hover end");
    setIsHovered(false);
    // if (hoverTimerRef.current) {
    //   clearTimeout(hoverTimerRef.current);
    // }
  };

  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const rectRef = useRef<SVGRectElement | null>(null);

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
        setIsAnimating(false);
        setIsHovered(false);
      }, ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, onHoverClick]);

  // アニメーション
  // SVGのパスの長さを取得する必要があるためJSで実行
  useEffect(() => {
    if (!rectRef.current) {
      return;
    }
    const length = rectRef.current.getTotalLength();
    if (isAnimating) {
      rectRef.current.style.transition = `stroke-dasharray ${ANIMATION_DURATION}ms linear`;
      rectRef.current.style.strokeDasharray = `${length} ${length}`;
    } else {
      rectRef.current.style.transition = "";
      rectRef.current.style.strokeDasharray = `0 ${length}`;
    }
  }, [isAnimating]);

  return (
    <button
      type="button"
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onClick={disableDefaultClick ? undefined : onHoverClick}
      {...props}
      style={{
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
