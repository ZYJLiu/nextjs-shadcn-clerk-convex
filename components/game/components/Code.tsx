"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CodeTypingContainer } from "../containers/CodeTypingContainer";
import { useIsCompleted } from "../hooks/useIsCompleted";
import { ResultsContainer } from "../containers/ResultsContainer";
import { useEndGame } from "../hooks/useEndGame";
import { useIsPlaying } from "../hooks/useIsPlaying";
import { toHumanReadableTime } from "../state/toHumanReadableTime";

import useTotalSeconds from "../hooks/useTotalSeconds";
import { useEffect } from "react";

import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useGame } from "../hooks/useGame";

export default function CodeTyping(props: {
  preloaded: Preloaded<typeof api.code.get>;
}) {
  const data = usePreloadedQuery(props.preloaded);
  const createGame = useMutation(api.games.createGame);
  const code = useMutation(api.games.code);
  const reset = useMutation(api.games.reset);

  const { gameId } = useGame();

  const isCompleted = useIsCompleted();
  const isPlaying = useIsPlaying();
  const totalSeconds = useCodeStoreTotalSeconds();

  useEndGame();

  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) {
        // Create a new game if no gameId is found
        const newGameId = await createGame();
        console.log("game", newGameId);
      } else {
        await reset({ gameId });
      }
      await code({ gameId, code: data! });
    };

    fetchGame();
  }, [reset, createGame, data]);

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
            <CodeTypingContainer filePath="test" language="typescript" />
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
          {isPlaying && <Timer seconds={totalSeconds} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Timer({ seconds }: { seconds: number }) {
  return (
    <div className="text-3xl ml-2 font-bold text-purple-300">
      {toHumanReadableTime(seconds)}
    </div>
  );
}

function useCodeStoreTotalSeconds() {
  const { game } = useGame();
  const totalSeconds = useTotalSeconds(game?.startTime, game?.endTime);
  return totalSeconds;
}
