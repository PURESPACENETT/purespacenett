import { useState } from "react";
import { Star } from "lucide-react";
import { business } from "@/content/business";
import { services } from "@/content/services";
import { trackEvent } from "@/lib/analytics";

type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent";

export function ReviewForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [rating, setRating] = useState(5);

  const buildMailto = (values: Record<string, string>) => {
    const body = [
      `Nom : ${values["authorName"]}`,
      `Ville : ${values["city"] || "—"}`,
      `Prestation : ${values["serviceType"] || "—"}`,
      `Note : ${rating}/5`,
      `E-mail : ${values["email"] || "—"}`,
      "",
      "Avis :",
      values["message"] ?? "",
    ].join("\n");
    return `mailto:${business.email}?subject=${encodeURIComponent(
      `Nouvel avis client — ${values["authorName"]}`,
    )}&body=${encodeURIComponent(body)}`;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setStatus("sending");

    try {
      const response = await fetch("/api/public/avis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // la case de consentement arrive en chaîne "true"/absente via FormData : on la convertit en booléen
        body: JSON.stringify({ ...raw, rating, consent: raw.consent === "true" }),
      });
      if (!response.ok) throw new Error("api");
      trackEvent("avis_envoye", { note: rating });
      setStatus("sent");
      form.reset();
      setRating(5);
    } catch {
      setStatus("error");
      window.location.href = buildMailto(raw);
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
        <Star className="mx-auto size-7 fill-accent text-accent" />
        <h3 className="mt-4 font-display text-xl font-bold">Merci beaucoup pour votre avis !</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Nous l'avons bien reçu. Dernière étape, très utile pour nous : publiez-le aussi sur notre
          fiche Google, il sera visible par tous ceux qui cherchent une entreprise de nettoyage près
          de chez vous.
        </p>
        <a
          href={business.googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("clic_fiche_google", { source: "avis_apres_envoi" })}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Star className="size-4" />
          Publier mon avis sur Google
        </a>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 block w-full text-xs font-semibold text-muted-foreground underline"
        >
          Laisser un autre avis
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Votre nom ou prénom *
          <input name="authorName" required minLength={2} maxLength={100} className={inputClass} />
        </label>
        <label className="text-sm font-medium">
          Votre ville
          <input name="city" maxLength={80} placeholder="Pantin, Paris…" className={inputClass} />
        </label>
        <label className="text-sm font-medium">
          Prestation réalisée
          <select name="serviceType" defaultValue="" className={inputClass}>
            <option value="">Choisir…</option>
            {services.map((service) => (
              <option key={service.slug} value={service.navName}>
                {service.navName}
              </option>
            ))}
            <option value="Autre prestation">Autre prestation</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Votre e-mail (facultatif)
          <input name="email" type="email" maxLength={255} className={inputClass} />
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Votre note *</legend>
        <div className="mt-2 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`Note de ${value} sur 5`}
              aria-pressed={rating === value}
              className="rounded-full p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`size-7 ${value <= rating ? "fill-accent text-accent" : "text-muted-foreground/40"}`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
        </div>
      </fieldset>

      <label className="mt-5 block text-sm font-medium">
        Votre avis *
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder="Racontez en quelques mots l'intervention : lieu, prestation, résultat…"
          className={inputClass}
        />
      </label>

      {/* champ piège anti-robots */}
      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <label className="mt-5 flex items-start gap-3 text-xs text-muted-foreground">
        <input
          name="consent"
          type="checkbox"
          value="true"
          required
          className="mt-0.5 size-4 shrink-0 rounded border-input"
        />
        <span>
          J'accepte que PURE SPACE NETT traite cet avis et les données que je transmets pour le
          gérer. Je peux demander sa modification ou sa suppression à {business.email}.
        </span>
      </label>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        <Star className="size-4" />
        {status === "sending" ? "Envoi en cours…" : "Envoyer mon avis"}
      </button>

      {status === "error" && (
        <p className="mt-3 text-sm text-destructive">
          L'envoi automatique a échoué. Votre logiciel de messagerie vient de s'ouvrir pour nous
          envoyer votre avis à {business.email}.
        </p>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Votre avis nous est envoyé directement. Il n'est pas publié automatiquement sur le site.
        Toute republication sur notre site fera l'objet d'un accord séparé.
      </p>
    </form>
  );
}
