import { useEffect, useState } from "react";
import { useIsPlaying } from "./useIsPlaying";
import { useIsCompleted } from "./useIsCompleted";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useNewCode() {
  const [random, setRandom] = useState(Math.random());
  console.log("random", random);
  const newCode = useQuery(api.code.get, { random: random });
  console.log("newCode", newCode);

  const isCompleted = useIsCompleted();
  const isPlaying = useIsPlaying();
  useEffect(() => {
    if (isCompleted && isPlaying) {
      setRandom(Math.random());
      console.log("setRandom");
    }
  }, [isPlaying, isCompleted]);

  return newCode;
}
