import { useState } from "react";
import { Copy, MessageCircle, Star } from "lucide-react";
import { business } from "@/content/business";
import { trackEvent } from "@/lib/analytics";

/** Message prérempli à envoyer à un client pour qu'il dépose un avis Google. */
export function reviewRequestMessage(city: string) {
  return `Bonjour, merci d'avoir fait confiance à ${business.name} pour votre nettoyage à ${city}. Si vous êtes satisfait de notre intervention, pouvez-vous nous laisser un avis sur notre fiche Google ? Cela prend moins d'une minute et nous aide énormément : ${business.googleReviewUrl} — Merci beaucoup ! L'équipe ${business.name}, ${business.phone}`;
}

/**
 * Bloc « demande d'avis » pour les pages de villes :
 * - bouton direct vers la fiche Google pour déposer un avis
 * - message prérempli, envoyable sur WhatsApp ou copiable pour un SMS / e-mail
 */
export function ReviewRequestBlock({ city }: { city: string }) {
  const [copied, setCopied] = useState(false);
  const message = reviewRequestMessage(city);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  const copy = async () => {
    trackEvent("copie_demande_avis", { ville: city });
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h3 className="font-display text-lg font-bold">
        Vous êtes client à {city} ? Laissez-nous un avis Google
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Votre avis aide les habitants et les entreprises de {city} à trouver une société de nettoyage
        de confiance. Vous pouvez aussi envoyer ce message prérempli à un proche ou à un collègue.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={business.googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("clic_demande_avis", { ville: city, source: "page_ville" })}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Star className="size-4" />
          Laisser un avis sur Google
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("clic_whatsapp", { source: `demande_avis_${city}` })}
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-[#0b3d24] transition-opacity hover:opacity-90"
        >
          <MessageCircle className="size-4" />
          Envoyer la demande sur WhatsApp
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:border-accent"
        >
          <Copy className="size-4" />
          {copied ? "Message copié" : "Copier le message"}
        </button>
      </div>

      <p className="mt-4 rounded-xl bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
