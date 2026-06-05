"use client";

import { MessageSquare, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroSection, Surface } from "@/components/design-system";
import { getPageHeroMeta } from "@/lib/page-meta";

const feedbackItems = [
  {
    id: "f1",
    student: "Ana Martínez",
    case: "Ansiedad generalizada",
    comment:
      "Buen manejo de la exploración emocional. Considera profundizar en factores protectores antes de cerrar la sesión.",
    status: "pendiente",
  },
  {
    id: "f2",
    student: "Carlos Ruiz",
    case: "Intervención en crisis",
    comment: "Necesita reforzar el protocolo de evaluación de riesgo. Revisar material de la semana 3.",
    status: "revisado",
  },
  {
    id: "f3",
    student: "Laura Vega",
    case: "Conflicto familiar",
    comment: "Excelente escucha activa y validación empática. Continuar con este enfoque.",
    status: "revisado",
  },
];

export default function TeacherFeedbackPage() {
  const meta = getPageHeroMeta("/teacher/feedback");

  return (
    <div className="space-y-8">
      <HeroSection eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />

      <div className="space-y-3">
        {feedbackItems.map((item) => (
          <Surface key={item.id} hover>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{item.student}</p>
                  <p className="text-sm text-muted-foreground">{item.case}</p>
                  <p className="mt-2 text-sm leading-relaxed">{item.comment}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={item.status === "pendiente" ? "warning" : "success"}>
                  {item.status === "pendiente" ? "Pendiente" : "Revisado"}
                </Badge>
                {item.status === "pendiente" && (
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Responder
                  </Button>
                )}
              </div>
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}
