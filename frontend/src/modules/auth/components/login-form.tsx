"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { SessionLogo } from "@/components/shared/session-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SplashScreen } from "@/components/shared/splash-screen";
import { useAuthStore } from "@/store";
import { getRoleHomePath, DEMO_ACCOUNTS } from "@/lib/auth";
import { BRAND } from "@/lib/branding";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { cn } from "@/lib/utils";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export function LoginForm() {
  useAuthRedirect();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("docente@uni.edu");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const user = await login(email, password);
    if (user) {
      router.push(getRoleHomePath(user.role));
    } else {
      setError("Credenciales inválidas. Verifica tu correo institucional.");
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password");
    setError("");
  };

  if (loading) {
    return <SplashScreen message="Iniciando sesión..." />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Fondo visible y cinematográfico */}
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={BRAND.backgroundSession}
          alt=""
          fill
          priority
          className="object-cover scale-[1.02] blur-[2px] saturate-[1.05]"
          sizes="100vw"
        />
        {/* Velo claro: deja ver la escena */}
        <div className="absolute inset-0 bg-white/45 dark:bg-slate-950/50" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-white/25 to-[hsl(215,40%,96%)]/40 dark:from-slate-950/60 dark:via-slate-900/40 dark:to-slate-950/70" />
        <div className="absolute inset-0 bg-[hsl(215,55%,42%)]/[0.06] dark:bg-[hsl(215,55%,42%)]/[0.12]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(15,35,65,0.12)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.35)_100%)]" />
      </div>

      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <div className="rounded-lg border border-white/60 bg-white/70 p-0.5 shadow-sm backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/70">
          <ThemeToggle />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Card premium ligera */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className={cn(
              "rounded-2xl border border-white/80 dark:border-slate-700/60",
              "bg-white/75 shadow-[0_8px_40px_-12px_rgba(15,40,80,0.18),0_0_0_1px_rgba(255,255,255,0.9)_inset]",
              "dark:bg-slate-900/80 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.45)] dark:ring-1 dark:ring-slate-700/40",
              "backdrop-blur-xl backdrop-saturate-150",
              "px-7 py-8 sm:px-9 sm:py-9"
            )}
          >
            {/* Branding */}
            <motion.div variants={item} className="mb-7 flex flex-col items-center text-center">
              <SessionLogo width={248} height={108} className="mb-5" />
              <h1 className="font-display text-[1.35rem] font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
                {BRAND.platformName}
              </h1>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                Plataforma institucional de simulación académica
              </p>
            </motion.div>

            <motion.p
              variants={item}
              className="mb-6 text-center text-xs leading-relaxed text-slate-400 dark:text-slate-500"
            >
              Acceso con credenciales de {BRAND.institutionName}
            </motion.p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div variants={item} className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-[13px] font-medium text-slate-700 dark:text-slate-300"
                >
                  Correo institucional
                </label>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[hsl(215,55%,38%)]" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@universidad.edu"
                    required
                    autoComplete="email"
                    className={cn(
                      "flex h-10 w-full rounded-lg border border-slate-200/90 bg-white/60",
                      "pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400",
                      "shadow-sm transition-all duration-200",
                      "hover:border-slate-300 hover:bg-white/80",
                      "focus:border-[hsl(215,50%,45%)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(215,50%,45%)]/15",
                      "dark:border-slate-600/80 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500",
                      "dark:hover:border-slate-500 dark:hover:bg-slate-800/70",
                      "dark:focus:border-[hsl(215,50%,55%)] dark:focus:bg-slate-800 dark:focus:ring-[hsl(215,50%,55%)]/20"
                    )}
                  />
                </div>
              </motion.div>

              <motion.div variants={item} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[13px] font-medium text-slate-700 dark:text-slate-300"
                  >
                    Contraseña
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[12px] font-medium text-[hsl(215,50%,38%)] transition-colors hover:text-[hsl(215,55%,30%)]"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[hsl(215,55%,38%)]" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className={cn(
                      "flex h-10 w-full rounded-lg border border-slate-200/90 bg-white/60",
                      "pl-9 pr-3 text-sm text-slate-900",
                      "shadow-sm transition-all duration-200",
                      "hover:border-slate-300 hover:bg-white/80",
                      "focus:border-[hsl(215,50%,45%)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(215,50%,45%)]/15",
                      "dark:border-slate-600/80 dark:bg-slate-800/50 dark:text-slate-100",
                      "dark:hover:border-slate-500 dark:hover:bg-slate-800/70",
                      "dark:focus:border-[hsl(215,50%,55%)] dark:focus:bg-slate-800 dark:focus:ring-[hsl(215,50%,55%)]/20"
                    )}
                  />
                </div>
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-[13px] text-red-700"
                >
                  {error}
                </motion.p>
              )}

              <motion.div variants={item} className="pt-1">
                <button
                  type="submit"
                  className={cn(
                    "flex h-10 w-full items-center justify-center gap-2 rounded-lg",
                    "bg-[hsl(215,55%,32%)] text-sm font-medium text-white",
                    "shadow-sm shadow-[hsl(215,55%,32%)]/20",
                    "transition-all duration-200",
                    "hover:bg-[hsl(215,55%,28%)] hover:shadow-md hover:shadow-[hsl(215,55%,32%)]/25",
                    "active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(215,50%,45%)]/40 focus-visible:ring-offset-2"
                  )}
                >
                  Ingresar
                  <ArrowRight className="h-4 w-4 opacity-90" />
                </button>
              </motion.div>
            </form>

            {/* Demo — discreto */}
            <motion.div
              variants={item}
              className="mt-6 border-t border-slate-200/80 pt-5 dark:border-slate-700/60"
            >
              <p className="mb-2.5 text-center text-[11px] text-slate-400">
                Vista previa · selecciona un perfil
              </p>
              <div className="flex justify-center gap-1.5">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => fillDemo(account.email)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-500",
                      "transition-all duration-150",
                      "hover:bg-slate-100 hover:text-slate-800",
                      email === account.email &&
                        "bg-slate-100 text-[hsl(215,50%,32%)] ring-1 ring-slate-200"
                    )}
                  >
                    {account.role === "student"
                      ? "Estudiante"
                      : account.role === "teacher"
                        ? "Docente"
                        : "Admin"}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.p
              variants={item}
              className="mt-5 text-center text-[13px] text-slate-500 dark:text-slate-400"
            >
              ¿Sin cuenta?{" "}
              <Link
                href="/register"
                className="font-medium text-[hsl(215,50%,38%)] hover:underline"
              >
                Solicitar acceso
              </Link>
            </motion.p>
          </motion.div>

          <p className="mt-5 text-center text-[11px] text-slate-500/90 dark:text-slate-500">
            © {new Date().getFullYear()} {BRAND.institutionName}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
