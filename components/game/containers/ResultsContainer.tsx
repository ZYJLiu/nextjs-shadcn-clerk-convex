import { toHumanReadableTime } from "../state/toHumanReadableTime";
import ResultsChart from "../components/ResultsChart";

import { useEffect } from "react";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useGame } from "../hooks/useGame";
import { useNewCode } from "../hooks/useNewCode";

export function ResultsText({
  info,
  title,
  value,
}: {
  info: string;
  title: string;
  value: React.ReactNode;
}) {
  return (
    <div
      title={info}
      className="h-full flex flex-col justify-end px-2 w-full sm:min-w-[150px] bg-dark-lake rounded p-2 py-4"
    >
      <p className="flex justify-start color-inherit font-bold text-off-white text-xs">
        {title}
      </p>
      <div className="flex items-center gap-2 text-faded-gray justify-between">
        <p className="font-bold text-2xl">{value}</p>
      </div>
    </div>
  );
}
export function ResultsContainer() {
  const { gameId } = useGame();

  const result = useQuery(api.games.calculateGameResults, { gameId });
  const reset = useMutation(api.games.reset);
  const code = useMutation(api.games.code);

  const newCode = useNewCode();

  async function resetGame() {
    reset({ gameId });
    // initialize(newCode.code);
    code({ gameId, code: newCode! });
  }

  // Simplified useEffect for keydown event
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        resetGame();
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetGame]); // Dependency on resetGame function

  if (!result) return null;

  // Destructure the result for cleaner access
  const { wpm, timeMS, mistakes, accuracy } = result;
  const time = toHumanReadableTime(Math.floor(timeMS / 1000));
  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex flex-row gap-4 justify-between mb-2">
        <div className="flex flex-col gap-1 mx-2 w-full">
          <h3 className="px-2 flex color-inherit font-bold text-faded-gray text-sm items-center gap-2">
            result
          </h3>
          <div className="w-full grid grid-cols-2 sm:flex sm:flex-row gap-2">
            <ResultsText
              info="words per minute typed in race"
              title="words per minute"
              value={wpm.toString()}
            />
            <ResultsText
              info="% correctly typed characters in race"
              title="accuracy"
              value={`${accuracy}%`}
            />
            <ResultsText
              info="time it took to complete race"
              title="time"
              value={time}
            />
            <ResultsText
              info="number of mistakes made during race"
              title="mistakes"
              value={mistakes.toString()}
            />
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col sm:flex-row">
        <ResultsChart />
      </div>
      <div className="flex justify-center items-center text-faded-gray gap-1">
        <button
          onClick={resetGame}
          title="Refresh the challenge"
          className="flex text-sm font-light text-black items-center justify-center gap-2 rounded-3xl bg-gray-300 hover:bg-gray-400 hover:cursor-pointer px-3 py-0.5 my-1"
          style={{ fontFamily: "Fira Code" }}
        >
          <div className="hidden sm:flex">refresh</div>
        </button>
      </div>
    </div>
  );
}
