"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TypingNarrativeProps {
  text: string;
  className?: string;
  speed?: number;
  enabled?: boolean;
}

export function TypingNarrative({
  text,
  className,
  speed = 18,
  enabled = true,
}: TypingNarrativeProps) {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, enabled]);

  return (
    <motion.blockquote
      key={text.slice(0, 24)}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      &ldquo;{displayed}
      {enabled && displayed.length < text.length && (
        <span className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-primary/60 align-middle" />
      )}
      &rdquo;
    </motion.blockquote>
  );
}
