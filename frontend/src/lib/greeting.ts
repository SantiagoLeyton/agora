export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function getMotivationalMessage(): string {
  const messages = [
    "Continúa fortaleciendo tus competencias en intervención psicosocial y evaluación clínica.",
    "Cada simulación te acerca a una práctica clínica más reflexiva y segura.",
    "Tu progreso académico refleja dedicación al aprendizaje experiencial.",
    "Explora casos clínicos para desarrollar criterio profesional en contextos reales.",
  ];
  const dayIndex = new Date().getDate() % messages.length;
  return messages[dayIndex];
}
