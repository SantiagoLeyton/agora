/** Etiquetas de presentación para la alianza terapéutica (solo UI). */

export interface TherapeuticAlliancePhase {
  label: string;
  description: string;
  levelLabel: string;
  dynamicDescription: string;
}

function allianceDynamicDescription(pct: number): string {
  if (pct < 20) {
    return "El consultante aún evalúa la seguridad del espacio; prioriza escucha, validación y ritmo pausado.";
  }
  if (pct < 40) {
    return "Surgen primeras señales de vínculo, con apertura emocional aún selectiva según el tema.";
  }
  if (pct < 60) {
    return "La confianza se consolida gradualmente; conviene sostener exploración sin forzar contenidos.";
  }
  if (pct < 80) {
    return "El consultante muestra mayor apertura emocional y disposición para colaborar en el proceso.";
  }
  return "El vínculo terapéutico ofrece un marco seguro para trabajar contenidos sensibles con solidez.";
}

export function getTherapeuticAlliancePhase(value: number): TherapeuticAlliancePhase {
  const pct = Math.min(100, Math.max(0, value));

  if (pct < 20) {
    return {
      label: "Contacto inicial",
      levelLabel: "Contacto inicial",
      description: "Primer contacto terapéutico",
      dynamicDescription: allianceDynamicDescription(pct),
    };
  }
  if (pct < 40) {
    return {
      label: "Relación emergente",
      levelLabel: "Relación emergente",
      description: "Vínculo en formación",
      dynamicDescription: allianceDynamicDescription(pct),
    };
  }
  if (pct < 60) {
    return {
      label: "Construcción de confianza",
      levelLabel: "Construcción de confianza",
      description: "Consolidación del vínculo",
      dynamicDescription: allianceDynamicDescription(pct),
    };
  }
  if (pct < 80) {
    return {
      label: "Alianza favorable",
      levelLabel: "Alianza favorable",
      description: "Colaboración activa",
      dynamicDescription: allianceDynamicDescription(pct),
    };
  }
  return {
    label: "Vínculo terapéutico sólido",
    levelLabel: "Vínculo terapéutico sólido",
    description: "Alianza establecida",
    dynamicDescription: allianceDynamicDescription(pct),
  };
}
