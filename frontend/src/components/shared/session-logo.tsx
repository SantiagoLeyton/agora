import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/branding";

interface SessionLogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/** Logo institucional para pantallas de autenticación (logosesion) */
export function SessionLogo({
  className,
  width = 220,
  height = 96,
  priority = true,
}: SessionLogoProps) {
  return (
    <div
      className={cn("relative mx-auto shrink-0", className)}
      style={{ width, height, minHeight: height }}
    >
      <Image
        src={BRAND.logoSession}
        alt={`${BRAND.institutionName} — ${BRAND.platformName}`}
        fill
        className="object-contain object-center"
        priority={priority}
        sizes={`${width}px`}
      />
    </div>
  );
}
