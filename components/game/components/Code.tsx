"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CodeTypingContainer } from "../containers/CodeTypingContainer";
import { useIsCompleted } from "../hooks/useIsCompleted";
import { ResultsContainer } from "../containers/ResultsContainer";
import { useEndGame } from "../hooks/useEndGame";
import { useIsPlaying } from "../hooks/useIsPlaying";
import { toHumanReadableTime } from "../state/toHumanReadableTime";
import { useCodeStore } from "../state/code-store";
import useTotalSeconds from "../hooks/useTotalSeconds";

import {
  Preloaded,
  useConvexAuth,
  useMutation,
  usePreloadedQuery,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function CodeTyping(props: {
  preloaded: Preloaded<typeof api.code.get>;
}) {
  const data = usePreloadedQuery(props.preloaded);
  const initialize = useCodeStore((state) => state.initialize);
  const createGame = useMutation(api.games.createGame);

  const isCompleted = useIsCompleted();
  const isPlaying = useIsPlaying();
  const totalSeconds = useCodeStoreTotalSeconds();

  useEndGame();

  const { isAuthenticated } = useConvexAuth();
  const reset = useMutation(api.games.reset);

  useEffect(() => {
    initialize(data.code);

    const fetchGame = async () => {
      const localStorageKey = isAuthenticated ? "authGameId" : "unauthGameId";
      let gameId = localStorage.getItem(localStorageKey) as Id<"games">;

      if (!gameId) {
        // Create a new game if no gameId is found
        const newGameId = await createGame();
        console.log("game", newGameId);

        // Save the new game ID to localStorage
        localStorage.setItem(localStorageKey, newGameId);
      } else {
        await reset({ gameId });
      }
    };

    fetchGame();
  }, [isAuthenticated, reset, createGame, data.code]);

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
  const startTime = useCodeStore((state) => state.startTime);
  const endTime = useCodeStore((state) => state.endTime);
  const totalSeconds = useTotalSeconds(
    startTime?.getTime(),
    endTime?.getTime()
  );
  return totalSeconds;
}
