type ErrorContext = Record<string, unknown>;

export function reportLovableError(error: unknown, context: ErrorContext = {}) {
  if (typeof window === "undefined") return;

  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  // Production : journaliser localement uniquement. Aucun envoi automatique
  // vers un service tiers depuis le navigateur.
  console.error("[PURE SPACE NETT] Erreur d'application", {
    message,
    route: window.location.pathname,
    ...context,
  });
}
