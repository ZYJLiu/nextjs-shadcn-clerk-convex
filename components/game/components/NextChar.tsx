import { AnimatePresence, motion } from "framer-motion";
import { useNodeRect } from "../hooks/useNodeRect";

import {
  useBlinkingCursorAnimation,
  OFF_WHITE_COLOR as GRAY_COLOR,
  SmoothCaret,
} from "./SmoothCaret";
import { useGame } from "../hooks/useGame";

interface NextCharProps {
  focused: boolean;
}

export function NextChar({ focused }: NextCharProps) {
  const { game } = useGame();
  const index = game?.index ?? 0;

  const useSmoothCaret = true;
  const [{ top, left }, nextCharRef] = useNodeRect<HTMLSpanElement>(
    index.toString()
  );

  const getNextChar = () => game?.currentChar ?? "";
  const nextChar = getNextChar().replace(/\n/g, "↵\n");
  const runBlinkingCursorAnimation = !useSmoothCaret;
  const controls = useBlinkingCursorAnimation(
    GRAY_COLOR,
    runBlinkingCursorAnimation
  );

  return (
    <>
      {focused && useSmoothCaret && typeof window !== "undefined" && (
        <SmoothCaret top={top} left={left} />
      )}
      <AnimatePresence>
        <motion.span
          ref={nextCharRef}
          animate={controls}
          className="rounded-sm pb-1 pt-2"
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        >
          {nextChar}
        </motion.span>
      </AnimatePresence>
    </>
  );
}
