import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/branding";

export const LOGO_PATH = BRAND.logo;

interface InstitutionalLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  subtitle?: string;
  href?: string;
  className?: string;
  collapsed?: boolean;
}

const sizeMap = {
  sm: { img: 32, text: "text-sm" },
  md: { img: 40, text: "text-base" },
  lg: { img: 56, text: "text-lg" },
  xl: { img: 80, text: "text-xl" },
};

export function InstitutionalLogo({
  size = "md",
  showText = true,
  subtitle = "Simulador Psicosocial",
  href,
  className,
  collapsed = false,
}: InstitutionalLogoProps) {
  const { img, text } = sizeMap[size];

  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg",
          size === "xl" && "rounded-xl"
        )}
        style={{ width: img, height: img }}
      >
        <Image
          src={LOGO_PATH}
          alt={`${subtitle} — Logo institucional`}
          fill
          className="object-contain"
          priority={size === "lg" || size === "xl"}
        />
      </div>
      {showText && !collapsed && (
        <div className="min-w-0">
          <p className={cn("font-display font-semibold leading-tight tracking-tight", text)}>
            {subtitle}
          </p>
          {size !== "sm" && (
            <p className="text-[11px] text-muted-foreground leading-tight">
              Plataforma académica
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
