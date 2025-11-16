import { useCallback, useEffect, useRef } from "react";
import JSConfetti from "js-confetti";

const BLOSSOM_EMOJIS = ["🌸", "❄️"];
const DEFAULT_COLUMNS = 3;
const DEFAULT_WAVES = 3;
const COLUMN_DELAY_MS = 60;
const WAVE_DELAY_MS = 250;

export const useCherryBlossomConfetti = () => {
  const confettiRef = useRef<JSConfetti | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const jsConfetti = new JSConfetti();
    confettiRef.current = jsConfetti;

    return () => {
      jsConfetti.clearCanvas();
      confettiRef.current = null;
    };
  }, []);

  const fire = useCallback(() => {
    if (!confettiRef.current || typeof window === "undefined") {
      return;
    }

    const viewportWidth = window.innerWidth || 0;
    const viewportHeight = window.innerHeight || 0;
    const columnWidth = viewportWidth / (DEFAULT_COLUMNS + 1);
    const dispatchY = Math.max(-120, viewportHeight * -0.1);

    Array.from({ length: DEFAULT_WAVES }).forEach((_, waveIndex) => {
      Array.from({ length: DEFAULT_COLUMNS }).forEach((_, columnIndex) => {
        const triggerDelay =
          waveIndex * WAVE_DELAY_MS + columnIndex * COLUMN_DELAY_MS;

        window.setTimeout(() => {
          confettiRef.current?.addConfettiAtPosition({
            emojis: BLOSSOM_EMOJIS,
            emojiSize: 80,
            confettiNumber: 20,
            confettiRadius: 8,
            confettiDispatchPosition: {
              x: columnWidth * (columnIndex + 1),
              y: dispatchY,
            },
          });
        }, triggerDelay);
      });
    });
  }, []);

  return { fire };
};
