"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type AvatarTone = "clinical" | "student" | "supervisor" | "neutral";

const toneStyles: Record<AvatarTone, string> = {
  clinical: "from-primary/25 via-primary/10 to-cyan-500/10 text-primary ring-primary/15",
  student: "from-indigo-500/20 via-blue-500/10 to-violet-500/10 text-indigo-700 dark:text-indigo-300 ring-indigo-500/15",
  supervisor: "from-violet-500/20 via-purple-500/10 to-indigo-500/10 text-violet-700 dark:text-violet-300 ring-violet-500/15",
  neutral: "from-slate-500/15 to-slate-400/5 text-foreground ring-border/40",
};

interface ClinicalAvatarProps {
  name: string;
  tone?: AvatarTone;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function ClinicalAvatar({
  name,
  tone = "clinical",
  size = "md",
  className,
}: ClinicalAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className={cn(sizeMap[size], "ring-2", className)}>
      <AvatarFallback
        className={cn(
          "bg-gradient-to-br font-semibold",
          toneStyles[tone]
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
