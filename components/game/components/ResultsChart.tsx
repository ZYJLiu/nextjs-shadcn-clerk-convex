import React, { RefObject, useEffect, useMemo, useRef } from "react";
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { useGameContext } from "@/components/providers/game-provider";
import { Doc } from "@/convex/_generated/dataModel";

Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

const renderChart = (
  ref: RefObject<HTMLCanvasElement>,
  wpmChartData: number[]
) => {
  const ctx = ref.current?.getContext("2d");
  if (!ctx) return;
  const labels = [];
  const data = [];
  let seconds = 1;
  for (const wpm of wpmChartData) {
    labels.push(seconds);
    data.push(wpm);
    seconds++;
  }
  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "WPM each second",
          data,
          backgroundColor: "#7e22ce",
          borderColor: "#7e22ce",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        tooltip: {
          enabled: true,
          callbacks: {
            title: (items) => {
              const item = items[0];
              const label = "Second " + item.label;
              return label;
            },
          },
        },
      },
    },
  });
};

export default function ResultsChart() {
  const { game } = useGameContext();
  const chartRef = useRef<HTMLCanvasElement>(null);

  // Memoize the WPM data
  const chartWPMData = useMemo(() => {
    if (game) {
      return getChartWPM(game);
    }
    return [];
  }, [game]);

  useEffect(() => {
    const chart = renderChart(chartRef, chartWPMData);
    return () => {
      chart?.destroy();
    };
  }, [chartWPMData]);

  return (
    <div className="flex rounded-xl flex-col bg-dark-lake grow m-2 max-w-screen">
      <div className="flex flex-row">
        <h1 className="text-sm p-4 font-semibold">Words Per Minute</h1>
      </div>
      <div className="bg-dark-lake p-2 rounded-xl max-w-full h-full">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}

function getChartWPM(game: Doc<"games">) {
  if (!game || !game.startTime) {
    return [];
  }

  const startTime = game.startTime;
  const wpm = [];
  let count = 0;
  let seconds = 1;
  const validKeyStrokes = getValidKeyStrokes(game.keystroke);

  for (let i = 0; i < validKeyStrokes.length; i++) {
    const keyStroke = validKeyStrokes[i];
    const breaktime = startTime + seconds * 1000;
    const isLastKeyStroke = i === validKeyStrokes.length - 1;
    const diffMS = keyStroke.timestamp - breaktime;
    const diffSeconds = diffMS / 1000;

    if (keyStroke.timestamp > breaktime || isLastKeyStroke) {
      const cpm = Math.floor((60 * count) / (seconds + diffSeconds));
      wpm.push(cpmToWPM(cpm));
      seconds++;
    }
    count++;
  }

  return wpm;
}

function getValidKeyStrokes(keyStrokes: Doc<"games">["keystroke"]) {
  return Object.values(
    Object.fromEntries(
      keyStrokes!
        .filter((stroke) => stroke.correct)
        .map((keyStroke) => [keyStroke.index, keyStroke])
    )
  );
}

function cpmToWPM(cpm: number) {
  // Assume avg 5 characters per word
  return cpm / 5;
}
