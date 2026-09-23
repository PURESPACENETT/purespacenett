import { useEffect, useRef, useState } from "react";
import { business } from "@/content/business";
import { trackEvent } from "@/lib/analytics";

export const propertyTypes = [
  "Maison",
  "Appartement",
  "Bureau",
  "Commerce",
  "Immeuble",
] as const;

export const serviceTypes = [
  "Nettoyage de bureaux et locaux professionnels",
  "Entretien de copropriété et parties communes",
  "Entretien de local commercial ou boutique",
  "Ménage régulier (particulier)",
  "Ménage ponctuel / grand nettoyage",
  "Nettoyage de vitres et vitrines",
  "Nettoyage fin de chantier",
  "Remise en état après sinistre ou dégradation",
  "Nettoyage avant / après déménagement (état des lieux)",
  "Nettoyage de canapés, fauteuils et matelas",
  "Nettoyage de tapis et moquettes",
  "Nettoyage intérieur de véhicule",
  "Désinfection et sanitaires",
  "Nettoyage de parking et local poubelles",
  "Débarras et évacuation d'encombrants",
  "Autre besoin (à préciser)",
] as const;

export const frequencies = [
  "Une seule fois",
  "Hebdomadaire",
  "Bi-mensuel",
  "Mensuel",
] as const;

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  propertyType: "",
  surface: "",
  serviceType: "",
  frequency: "",
  message: "",
  consent: false,
  // champ piège anti-robots, invisible pour les visiteurs
  company: "",
};

const field =
  "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/40";
const labelCls = "block text-sm font-medium";

export function QuoteForm() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trackEvent("formulaire_devis_vu");
  }, []);

  const set = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mailtoFallback = () => {
    const body = [
      `Nom : ${form.fullName}`,
      `Email : ${form.email}`,
      `Téléphone : ${form.phone}`,
      `Adresse : ${form.address}`,
      `Type de bien : ${form.propertyType}`,
      `Surface : ${form.surface} m²`,
      `Prestation : ${form.serviceType}`,
      `Fréquence : ${form.frequency}`,
      "",
      form.message,
    ].join("\n");
    window.location.href = `mailto:${business.email}?subject=${encodeURIComponent(
      `Demande de devis — ${form.serviceType}`,
    )}&body=${encodeURIComponent(body)}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) return;
    setStatus("sending");
    setError(null);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, String(value)));
      photos.forEach((photo) => body.append("photos", photo));

      const res = await fetch("/api/public/devis", {
        method: "POST",
        body,
      });
      if (!res.ok) throw new Error(await res.text());
      trackEvent("devis_envoye", {
        prestation: form.serviceType,
        type_de_bien: form.propertyType,
        frequence: form.frequency,
      });
      setStatus("sent");
      setForm(emptyForm);
      setPhotos([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      trackEvent("devis_echec_envoi", { prestation: form.serviceType });
      setStatus("error");
      setError(null);
      mailtoFallback();
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <h2 className="font-display text-2xl font-bold">Demande envoyée</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Merci ! Nous avons reçu votre demande et vous répondons sous 24 heures. Pour une urgence,
          appelez-nous au{" "}
          <a className="font-semibold text-foreground" href={business.phoneHref}>
            {business.phone}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-border px-5 py-2 text-sm font-semibold"
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          Nom complet *
          <input
            className={field}
            required
            maxLength={100}
            placeholder="Jean Dupont"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Email *
          <input
            className={field}
            type="email"
            required
            maxLength={255}
            placeholder="jean.dupont@example.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Téléphone *
          <input
            className={field}
            type="tel"
            required
            maxLength={30}
            placeholder="06 12 34 56 78"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Adresse d'intervention
          <input
            className={field}
            maxLength={200}
            placeholder="123 Rue de Paris, 75001 Paris"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Type de bien
          <select
            className={field}
            value={form.propertyType}
            onChange={(e) => set("propertyType", e.target.value)}
          >
            <option value="">Sélectionnez</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Surface approximative (m²)
          <input
            className={field}
            type="number"
            min={0}
            max={100000}
            placeholder="50"
            value={form.surface}
            onChange={(e) => set("surface", e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Type de prestation *
          <select
            className={field}
            required
            value={form.serviceType}
            onChange={(e) => set("serviceType", e.target.value)}
          >
            <option value="">Sélectionnez</option>
            {serviceTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Fréquence souhaitée
          <select
            className={field}
            value={form.frequency}
            onChange={(e) => set("frequency", e.target.value)}
          >
            <option value="">Sélectionnez</option>
            {frequencies.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <label className={labelCls} htmlFor="quote-photos">
          Photos des lieux (facultatif)
          <input
            ref={fileInputRef}
            id="quote-photos"
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            onChange={(e) => {
              const selected = Array.from(e.target.files ?? []);
              const valid = selected.filter((file) => file.size <= 5 * 1024 * 1024);
              setPhotos(valid.slice(0, 5));
              if (selected.some((file) => file.size > 5 * 1024 * 1024) || selected.length > 5) {
                setError("Vous pouvez joindre jusqu'à 5 photos de 5 Mo maximum chacune.");
              } else {
                setError(null);
              }
            }}
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          Jusqu'à 5 photos, 5 Mo maximum chacune. JPG, PNG ou WebP (HEIC/HEIF selon votre appareil).
        </p>
        {photos.length > 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {photos.length} photo{photos.length > 1 ? "s" : ""} sélectionnée{photos.length > 1 ? "s" : ""}.
          </p>
        ) : null}
      </div>

      <label className="mt-4 block text-sm font-medium">
        Précisions supplémentaires
        <textarea
          className={`${field} min-h-32`}
          maxLength={2000}
          placeholder="Informations complémentaires..."
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </label>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.company}
        onChange={(e) => set("company", e.target.value)}
        className="pointer-events-none absolute left-[-9999px] size-0 opacity-0"
      />

      <label className="mt-4 flex items-start gap-3 text-xs text-muted-foreground">
        <input
          type="checkbox"
          required
          className="mt-0.5 size-4 shrink-0 rounded border-input"
          checked={form.consent}
          onChange={(e) => set("consent", e.target.checked)}
        />
        <span>
          J'accepte que mes données soient utilisées par {business.name} pour traiter ma demande de
          devis et me recontacter. Elles ne sont jamais cédées à des tiers.
        </span>
      </label>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "sending" ? "Envoi en cours…" : "Envoyer ma demande"}
      </button>

      {status === "error" ? (
        <p className="mt-3 text-xs text-destructive">
          L'envoi a échoué. Merci de nous appeler au {business.phone} ou d'écrire à {business.email}.
          {error ? ` (${error})` : ""}
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Votre demande arrive directement dans la boîte {business.email}. Réponse sous 24 heures.
        </p>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        Vous avez des photos des lieux ? Envoyez-les par WhatsApp ou par e-mail au {business.phone}{" "}
        après votre demande.
      </p>
    </form>
  );
}
