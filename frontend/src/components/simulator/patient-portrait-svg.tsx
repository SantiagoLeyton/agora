"use client";

import type { PatientExpression } from "@/lib/patient-expression";
import type { PatientPortraitVariant } from "@/lib/patient-portraits";

interface PatientPortraitSvgProps {
  variant: PatientPortraitVariant;
  expression: PatientExpression;
}

/** Paleta por paciente: tonos de piel y cabello realistas, sin estilo anime. */
const variants: Record<
  PatientPortraitVariant,
  {
    skin: string;
    skinShadow: string;
    hair: string;
    shirt: string;
    young: boolean;
    beard?: boolean;
  }
> = {
  maria: {
    skin: "#c4a088",
    skinShadow: "#9a7b66",
    hair: "#3d2c24",
    shirt: "#5c6b7a",
    young: true,
  },
  carlos: {
    skin: "#b8957a",
    skinShadow: "#8f735f",
    hair: "#2a2520",
    shirt: "#4a5568",
    young: false,
    beard: true,
  },
  laura: {
    skin: "#d4a574",
    skinShadow: "#a67f58",
    hair: "#1f1a18",
    shirt: "#6b5b6e",
    young: true,
  },
  diego: {
    skin: "#c9a882",
    skinShadow: "#a08062",
    hair: "#252018",
    shirt: "#4d6a5c",
    young: true,
  },
};

function expressionFeatures(expression: PatientExpression) {
  switch (expression) {
    case "sad":
      return {
        browY: 4,
        browCurve: 6,
        eyeOpen: 0.82,
        mouth: "M 118 198 Q 150 188 182 198",
        blush: 0,
        tear: true,
      };
    case "relieved":
      return {
        browY: -2,
        browCurve: -2,
        eyeOpen: 0.95,
        mouth: "M 122 194 Q 150 208 178 194",
        blush: 0.12,
        tear: false,
      };
    case "anxious":
      return {
        browY: -6,
        browCurve: 8,
        eyeOpen: 1.05,
        mouth: "M 128 200 Q 150 192 172 200",
        blush: 0.35,
        tear: false,
      };
    case "tense":
      return {
        browY: -8,
        browCurve: 12,
        eyeOpen: 0.9,
        mouth: "M 120 202 L 150 196 L 180 202",
        blush: 0.2,
        tear: false,
      };
    case "alert":
      return {
        browY: -10,
        browCurve: 4,
        eyeOpen: 1.15,
        mouth: "M 130 200 Q 150 196 170 200",
        blush: 0.08,
        tear: false,
      };
    default:
      return {
        browY: 0,
        browCurve: 2,
        eyeOpen: 1,
        mouth: "M 125 198 Q 150 202 175 198",
        blush: 0.05,
        tear: false,
      };
  }
}

export function PatientPortraitSvg({
  variant,
  expression,
}: PatientPortraitSvgProps) {
  const v = variants[variant];
  const f = expressionFeatures(expression);
  const faceRy = v.young ? 88 : 92;

  return (
    <svg
      viewBox="0 0 300 340"
      className="h-full w-full"
      role="img"
      aria-hidden
    >
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="hsl(var(--primary) / 0.12)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={v.skin} />
          <stop offset="100%" stopColor={v.skinShadow} />
        </linearGradient>
        <clipPath id="faceClip">
          <ellipse cx="150" cy="155" rx="72" ry={faceRy} />
        </clipPath>
      </defs>

      <rect width="300" height="340" fill="url(#bgGlow)" />

      {/* Hombros / ropa de consulta */}
      <path
        d="M 40 340 Q 80 260 150 248 Q 220 260 260 340 Z"
        fill={v.shirt}
        opacity={0.95}
      />
      <path
        d="M 95 248 L 150 268 L 205 248"
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="1"
      />

      {/* Cuello */}
      <rect x="128" y="228" width="44" height="36" rx="8" fill={v.skinShadow} />

      {/* Cabello posterior */}
      <ellipse cx="150" cy="118" rx="82" ry="70" fill={v.hair} />

      {/* Rostro */}
      <ellipse cx="150" cy="155" rx="72" ry={faceRy} fill="url(#skinGrad)" />

      {/* Orejas */}
      <ellipse cx="78" cy="158" rx="10" ry="16" fill={v.skinShadow} />
      <ellipse cx="222" cy="158" rx="10" ry="16" fill={v.skinShadow} />

      <g clipPath="url(#faceClip)">
        {/* Rubor (ansiedad / emoción) */}
        {f.blush > 0 && (
          <>
            <ellipse
              cx="108"
              cy="175"
              rx="18"
              ry="12"
              fill="#c45c5c"
              opacity={f.blush}
            />
            <ellipse
              cx="192"
              cy="175"
              rx="18"
              ry="12"
              fill="#c45c5c"
              opacity={f.blush}
            />
          </>
        )}

        {/* Cejas */}
        <path
          d={`M 98 ${118 + f.browY} Q 118 ${112 + f.browY - f.browCurve} 138 ${118 + f.browY}`}
          fill="none"
          stroke={v.hair}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d={`M 162 ${118 + f.browY} Q 182 ${112 + f.browY - f.browCurve} 202 ${118 + f.browY}`}
          fill="none"
          stroke={v.hair}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Ojos — proporción realista */}
        <g transform={`scale(1 ${f.eyeOpen})`} style={{ transformOrigin: "118px 148px" }}>
          <ellipse cx="118" cy="148" rx="11" ry="8" fill="#f8f6f2" />
          <circle cx="118" cy="148" r="5" fill="#3d3428" />
          <circle cx="120" cy="146" r="1.5" fill="#fff" opacity={0.7} />
        </g>
        <g transform={`scale(1 ${f.eyeOpen})`} style={{ transformOrigin: "182px 148px" }}>
          <ellipse cx="182" cy="148" rx="11" ry="8" fill="#f8f6f2" />
          <circle cx="182" cy="148" r="5" fill="#3d3428" />
          <circle cx="184" cy="146" r="1.5" fill="#fff" opacity={0.7} />
        </g>

        {/* Nariz */}
        <path
          d="M 150 152 L 146 172 Q 150 176 154 172 Z"
          fill={v.skinShadow}
          opacity={0.45}
        />

        {/* Boca */}
        <path
          d={f.mouth}
          fill="none"
          stroke="#6b5348"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {f.tear && (
          <path
            d="M 192 158 Q 194 168 192 178"
            stroke="#7eb8d4"
            strokeWidth="2"
            fill="none"
            opacity={0.7}
          />
        )}
      </g>

      {/* Cabello frontal */}
      <path
        d={
          variant === "carlos"
            ? "M 72 130 Q 150 55 228 130 Q 210 95 150 78 Q 90 95 72 130"
            : variant === "diego"
              ? "M 78 125 Q 150 62 222 125 Q 200 88 150 72 Q 100 88 78 125"
              : "M 75 128 Q 150 48 225 128 Q 205 82 150 68 Q 95 82 75 128"
        }
        fill={v.hair}
      />

      {v.beard && (
        <path
          d="M 100 195 Q 150 225 200 195 Q 185 215 150 220 Q 115 215 100 195"
          fill={v.hair}
          opacity={0.35}
        />
      )}
    </svg>
  );
}
