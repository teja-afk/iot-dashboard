"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import {
  motion,
  motionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

const TRANSITION = {
  type: "spring",
  stiffness: 280,
  damping: 18,
  mass: 0.3,
} as const;

const DIGIT_GLYPHS = "0123456789";

type DigitMetrics = {
  inkHeight: number;
  inkOffset: number;
};

let measurementContext: CanvasRenderingContext2D | null = null;
let measurementContextResolved = false;

function getMeasurementContext() {
  if (!measurementContextResolved) {
    measurementContextResolved = true;
    measurementContext = document.createElement("canvas").getContext("2d");
  }
  return measurementContext;
}

function measureDigitMetrics(element: HTMLElement): DigitMetrics | null {
  const style = getComputedStyle(element);
  const fontStyle = style.fontStyle.startsWith("oblique") ? "oblique" : style.fontStyle;
  const font = `${fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

  const context = getMeasurementContext();
  if (!context) {
    return measureLineBoxHeight(element, font);
  }

  context.font = font;

  let ascent = 0;
  let descent = 0;
  let fontAscent = 0;
  for (const glyph of DIGIT_GLYPHS) {
    const metrics = context.measureText(glyph);
    ascent = Math.max(ascent, metrics.actualBoundingBoxAscent);
    descent = Math.max(descent, metrics.actualBoundingBoxDescent);
    fontAscent = metrics.fontBoundingBoxAscent;
  }
  if (ascent + descent === 0) return null;

  return { inkHeight: ascent + descent, inkOffset: fontAscent - ascent };
}

function measureLineBoxHeight(element: HTMLElement, font: string): DigitMetrics | null {
  const probe = document.createElement("span");
  probe.style.cssText =
    "position:absolute;visibility:hidden;white-space:pre;line-height:normal;";
  probe.style.font = font;
  probe.textContent = "0";
  element.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();

  if (!height) return null;
  return { inkHeight: height, inkOffset: 0 };
}

function useDigitMetrics(ref: RefObject<HTMLElement | null>) {
  const [metrics, setMetrics] = useState<DigitMetrics | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const next = measureDigitMetrics(element);
      setMetrics((current) =>
        current && next && current.inkHeight === next.inkHeight && current.inkOffset === next.inkOffset
          ? current
          : next,
      );
    };

    update();
    void document.fonts.ready.then(update);
    document.fonts.addEventListener("loadingdone", update);
    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => {
      document.fonts.removeEventListener("loadingdone", update);
      observer.disconnect();
    };
  }, [ref]);

  return metrics;
}

function Digit({
  value,
  place,
  metrics,
}: {
  value: number;
  place: number;
  metrics: DigitMetrics | null;
}) {
  const valueRoundedToPlace = Math.floor(value / place) % 10;
  const initial = motionValue(valueRoundedToPlace);
  const animatedValue = useSpring(initial, TRANSITION);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div
      className="relative inline-block w-[1ch] overflow-x-visible overflow-y-clip leading-none tabular-nums"
      style={metrics ? { height: metrics.inkHeight } : undefined}
    >
      <div className="invisible">0</div>
      {Array.from({ length: 10 }, (_, index) => (
        <DigitNumber key={index} mv={animatedValue} number={index} metrics={metrics} />
      ))}
    </div>
  );
}

function DigitNumber({
  mv,
  number,
  metrics,
}: {
  mv: MotionValue<number>;
  number: number;
  metrics: DigitMetrics | null;
}) {
  const uniqueId = useId();
  const y = useTransform(mv, (latest) => {
    if (!metrics) return 0;
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * metrics.inkHeight;

    if (offset > 5) {
      memo -= 10 * metrics.inkHeight;
    }

    return memo - metrics.inkOffset;
  });

  if (!metrics) {
    return (
      <span className="invisible absolute">
        {number}
      </span>
    );
  }

  return (
    <motion.span
      style={{ y, lineHeight: "normal" }}
      layoutId={`${uniqueId}-${number}`}
      className="absolute inset-0 flex items-start justify-center"
      transition={TRANSITION}
    >
      {number}
    </motion.span>
  );
}

export type SlidingNumberProps = {
  value: number;
  padStart?: boolean;
  decimalSeparator?: string;
};

export function SlidingNumber({
  value,
  padStart = false,
  decimalSeparator = ".",
}: SlidingNumberProps) {
  const absValue = Math.abs(value);
  const [integerPart, decimalPart] = absValue.toString().split(".");
  const integerValue = Number.parseInt(integerPart, 10);
  const paddedInteger = padStart && integerValue < 10 ? `0${integerPart}` : integerPart;
  const integerDigits = paddedInteger.split("");
  const integerPlaces = integerDigits.map((_, index) =>
    Math.pow(10, integerDigits.length - index - 1),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const metrics = useDigitMetrics(rootRef);

  return (
    <div ref={rootRef} className="flex items-center">
      {value < 0 && "-"}
      {integerDigits.map((_, index) => (
        <Digit
          key={`pos-${integerPlaces[index]}`}
          value={integerValue}
          place={integerPlaces[index]}
          metrics={metrics}
        />
      ))}
      {decimalPart && (
        <>
          <span>{decimalSeparator}</span>
          {decimalPart.split("").map((_, index) => (
            <Digit
              key={`decimal-${index}`}
              value={Number.parseInt(decimalPart, 10)}
              place={Math.pow(10, decimalPart.length - index - 1)}
              metrics={metrics}
            />
          ))}
        </>
      )}
    </div>
  );
}
