import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useGameContext } from "@/components/providers/game-provider";
import { motion } from "framer-motion";

export default function Refresh({ isCompleted }: { isCompleted: boolean }) {
  const { gameId } = useGameContext();
  const [random, setRandom] = useState(Math.random());
  const newCode = useQuery(api.code.get, { random: random });
  const reset = useMutation(api.games.reset);

  const handleRefresh = () => {
    if (gameId && newCode) {
      setRandom(Math.random());
      reset({ gameId: gameId, code: newCode });
    }
  };

  // Refresh when the user presses the Enter key
  useEffect(() => {
    // Define the event handler inside the effect
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleRefresh();
        event.preventDefault();
      }
    };

    // Set up the event listener only when isCompleted is true
    if (isCompleted) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isCompleted, handleRefresh]);

  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 500); // Set delay time

    return () => clearTimeout(timer); // Clean up the timer
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <button
        onClick={handleRefresh}
        title="Refresh the challenge"
        className="flex text-sm font-light text-black items-center justify-center gap-2 rounded-3xl bg-gray-300 hover:bg-gray-400 hover:cursor-pointer px-3 py-0.5 my-1"
        style={{ fontFamily: "Fira Code" }}
      >
        <div className="hidden sm:flex">refresh</div>
      </button>
    </motion.div>
  );
}
