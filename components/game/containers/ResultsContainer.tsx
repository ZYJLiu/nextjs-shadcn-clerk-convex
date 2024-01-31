import { toHumanReadableTime } from "../state/toHumanReadableTime";
import ResultsChart from "../components/ResultsChart";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useGameContext } from "@/components/providers/game-provider";

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
  const { gameId, game } = useGameContext();

  const result = useQuery(
    api.games.calculateGameResults,
    gameId !== undefined ? { gameId } : "skip"
  );

  if (!result || !game?.endTime) return null;

  const { wpm, timeMS, mistakes, accuracy } = result;
  const time = toHumanReadableTime(Math.floor(timeMS / 1000));

  const resultItems = [
    {
      info: "words per minute typed in race",
      title: "words per minute",
      value: wpm.toString(),
    },
    {
      info: "% correctly typed characters in race",
      title: "accuracy",
      value: `${accuracy}%`,
    },
    { info: "time it took to complete race", title: "time", value: time },
    {
      info: "number of mistakes made during race",
      title: "mistakes",
      value: mistakes.toString(),
    },
  ];

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex flex-row gap-4 justify-between mb-2">
        <div className="flex flex-col gap-1 mx-2 w-full">
          <h3 className="px-2 flex color-inherit font-bold text-faded-gray text-sm items-center gap-2">
            result
          </h3>
          <div className="w-full grid grid-cols-2 sm:flex sm:flex-row gap-2">
            {resultItems.map((item, index) => (
              <ResultsText
                key={index}
                info={item.info}
                title={item.title}
                value={item.value}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col sm:flex-row">
        <ResultsChart />
      </div>
    </div>
  );
}
