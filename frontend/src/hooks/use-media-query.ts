"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = window.setTimeout(() => setMatches(mq.matches), 0);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => {
      window.clearTimeout(sync);
      mq.removeEventListener("change", onChange);
    };
  }, [query]);

  return matches;
}
