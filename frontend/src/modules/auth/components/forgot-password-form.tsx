"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth-service";
import { ApiError } from "@/services/api-error";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await authService.forgotPassword(email);
      setDevLink(response.enlaceDesarrollo ?? null);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="border-border/60 shadow-lg text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h2 className="mt-4 font-display text-xl font-semibold">Solicitud registrada</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Si el correo existe en el sistema, recibirás instrucciones para restablecer tu contraseña.
            </p>
            {devLink && (
              <p className="mt-4 rounded-lg bg-muted/40 p-3 text-left text-xs text-muted-foreground">
                Modo desarrollo: usa este enlace para restablecer la contraseña.
                <Link href={devLink} className="mt-2 block break-all text-primary hover:underline">
                  {devLink}
                </Link>
              </p>
            )}
            <Button asChild className="mt-6" variant="outline">
              <Link href="/login">Volver al inicio de sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="border-border/60 shadow-lg">
        <CardHeader>
          <CardTitle>Recuperar contraseña</CardTitle>
          <CardDescription>Te enviaremos un enlace de recuperación si el correo está registrado.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo institucional</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar enlace"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm">
            <Link href="/login" className="inline-flex items-center gap-1 text-primary hover:underline">
              <ArrowLeft className="h-3 w-3" /> Volver al inicio de sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
