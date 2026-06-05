"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const blobConfigs = [
  { className: "left-[8%] top-[12%] h-[420px] w-[420px] bg-blue-400/[0.07] dark:bg-cyan-500/[0.06]", duration: 22 },
  { className: "right-[5%] top-[28%] h-[380px] w-[380px] bg-indigo-400/[0.06] dark:bg-indigo-500/[0.05]", duration: 26 },
  { className: "left-[35%] bottom-[8%] h-[340px] w-[340px] bg-violet-400/[0.05] dark:bg-violet-500/[0.04]", duration: 24 },
  { className: "right-[25%] top-[55%] h-[260px] w-[260px] bg-cyan-300/[0.04] dark:bg-cyan-400/[0.03]", duration: 20 },
];

export function FloatingBlobs({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {blobConfigs.map((blob, i) => (
        <motion.div
          key={i}
          className={cn("absolute rounded-full blur-[100px]", blob.className)}
          animate={{
            x: [0, 24, -16, 0],
            y: [0, -20, 14, 0],
            scale: [1, 1.06, 0.96, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
