import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Ancienne URL de devis conservée pour éviter les liens cassés.
 * Le formulaire historique a été retiré : toutes les demandes passent désormais
 * par le parcours de sous-traitance / prospection B2B.
 */
export const Route = createFileRoute("/devis")({
  staticData: { sitemap: false },
  loader: () => {
    throw redirect({ to: "/sous-traitance" });
  },
  component: () => null,
});
