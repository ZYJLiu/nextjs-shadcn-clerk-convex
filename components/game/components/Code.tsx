"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CodeTypingContainer } from "../containers/CodeTypingContainer";
import { useIsCompleted } from "../hooks/useIsCompleted";
import { ResultsContainer } from "../containers/ResultsContainer";
import { useEndGame } from "../hooks/useEndGame";
import { useIsPlaying } from "../hooks/useIsPlaying";
import { toHumanReadableTime } from "../state/toHumanReadableTime";
import useTotalSeconds from "../hooks/useTotalSeconds";
import { useGameContext } from "@/components/providers/game-provider";
import Refresh from "./Refresh";
import { useEffect, useState } from "react";

export default function CodeTyping() {
  const isCompleted = useIsCompleted();
  const isPlaying = useIsPlaying();
  const totalSeconds = useCodeStoreTotalSeconds();

  useEndGame();

  // Delay the rendering of the code typing container
  // todo: fix flicker due to switching between unauth and auth games
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 500); // Set delay time

    return () => clearTimeout(timer); // Clean up the timer
  }, []);

  if (!shouldRender) {
    return null; // Or return a loading spinner, placeholder, etc.
  }

  return (
    <div className="justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          {isCompleted && <ResultsContainer />}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:min-w-[980px]"
        >
          {!isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
              className="w-full lg:min-w-[980px]"
            >
              <CodeTypingContainer filePath="test" language="typescript" />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center w-full"
        >
          <div className="flex justify-between items-center w-full">
            {isPlaying ? <Timer seconds={totalSeconds} /> : <div></div>}
            <Refresh isCompleted={isCompleted} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Timer({ seconds }: { seconds: number }) {
  return (
    <div className="text-2xl ml-2 font-bold text-purple-300">
      {toHumanReadableTime(seconds)}
    </div>
  );
}

function useCodeStoreTotalSeconds() {
  const { game } = useGameContext();
  const totalSeconds = useTotalSeconds(game?.startTime, game?.endTime);
  return totalSeconds;
}
