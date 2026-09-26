import { useEffect, useRef, useState } from "react";
import { business, whatsappHref } from "@/content/business";
import { trackEvent, trackLeadGenerated } from "@/lib/analytics";
import { getMarketingAttribution } from "@/lib/attribution";

export const clientTypes = [
  { value: "entreprise", label: "Entreprise" },
  { value: "sous_traitance", label: "Sous-traitance" },
  { value: "particulier", label: "Particulier" },
] as const;

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
  clientType: "particulier",
  companyName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  propertyType: "",
  surface: "",
  serviceType: "",
  frequency: "",
  desiredDate: "",
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
  const startedRef = useRef(false);

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
      `Ville : ${form.postalCode} ${form.city}`,
      `Type de client : ${form.clientType}`,
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

  const handleFormFocus = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("formulaire_devis_commence", { source: "page_devis" });
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
      const attribution = getMarketingAttribution();
      Object.entries(attribution).forEach(([key, value]) => {
        if (value) body.append(key, value);
      });

      const res = await fetch("/api/public/devis", {
        method: "POST",
        body,
      });
      if (!res.ok) throw new Error(await res.text());
      trackLeadGenerated({ source: "formulaire_devis", prestation: form.serviceType, type_de_bien: form.propertyType, frequence: form.frequency, gclid: getMarketingAttribution().gclid ?? undefined });
      trackEvent("devis_envoye", {
        prestation: form.serviceType,
        type_de_bien: form.propertyType,
        frequence: form.frequency,
      });
      trackEvent("devis_confirmation_affichee", { source: "page_devis" });
      setStatus("sent");
      setForm(emptyForm);
      setPhotos([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      trackEvent("devis_echec_envoi", { prestation: form.serviceType });
      setStatus("error");
      setError("Vous pouvez réessayer ou nous contacter directement.");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <h2 className="font-display text-2xl font-bold">Demande envoyée</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Merci ! Nous avons bien reçu votre demande. Nous revenons vers vous après étude de votre besoin. Pour une urgence,
          appelez-nous au{" "}
          <a
            className="font-semibold text-foreground"
            href={business.phoneHref}
            onClick={() => trackEvent("appel_telephone", { source: "confirmation_devis" })}
          >
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
    <form
      id="demande-devis"
      name="demande-devis"
      onSubmit={submit}
      onFocus={handleFormFocus}
      className="rounded-2xl border border-border bg-card p-6 shadow-card"
    >
      <div className="mb-6 rounded-xl border border-primary/10 bg-primary/5 p-4">
        <p className="text-sm font-semibold">Votre demande en 3 étapes</p>
        <ol className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <li><span className="font-semibold text-foreground">1.</span> Vos coordonnées</li>
          <li><span className="font-semibold text-foreground">2.</span> Le besoin à chiffrer</li>
          <li><span className="font-semibold text-foreground">3.</span> Envoi de la demande</li>
        </ol>
      </div>
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
          Type de client *
          <select
            className={field}
            required
            value={form.clientType}
            onChange={(e) => set("clientType", e.target.value as (typeof form)["clientType"])}
          >
            {clientTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Entreprise (si applicable)
          <input
            className={field}
            maxLength={160}
            placeholder="Nom de l'entreprise"
            value={form.companyName}
            onChange={(e) => set("companyName", e.target.value)}
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
          Ville *
          <input
            className={field}
            required
            maxLength={120}
            placeholder="Paris"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Code postal *
          <input
            className={field}
            required
            maxLength={10}
            placeholder="75001"
            value={form.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
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
            required
            min={1}
            max={100000}
            placeholder="50"
            value={form.surface}
            onChange={(e) => set("surface", e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Date souhaitée
          <input
            className={field}
            type="date"
            value={form.desiredDate}
            onChange={(e) => set("desiredDate", e.target.value)}
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
              if (valid.length > 0) {
                trackEvent("devis_photo_ajoutee", { nombre: Math.min(valid.length, 5) });
              }
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
          devis et me recontacter. Elles ne sont pas vendues à des tiers.
        </span>
      </label>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "sending" ? "Envoi en cours…" : "Recevoir mon devis gratuit"}
      </button>

      {status === "error" ? (
        <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-xs text-destructive">
            {error ?? "L'envoi a échoué. Vous pouvez réessayer ou nous contacter directement."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="submit" className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold">
              Réessayer
            </button>
            <a
              href={business.phoneHref}
              onClick={() => trackEvent("appel_telephone", { source: "erreur_formulaire_devis" })}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Appeler
            </a>
            <a
              href={whatsappHref("demande de devis")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("clic_whatsapp", { source: "erreur_formulaire_devis" })}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold"
            >
              WhatsApp
            </a>
            <button
              type="button"
              onClick={() => {
                trackEvent("clic_email", { source: "erreur_formulaire_devis" });
                mailtoFallback();
              }}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold"
            >
              Préparer un e-mail
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Votre demande arrive directement dans la boîte {business.email}. Nous revenons vers vous après étude de votre besoin.
        </p>
      )}

      <p className="mt-2 text-center text-xs text-muted-foreground">
        Photos facultatives • Gratuit • Sans engagement
      </p>
    </form>
  );
}
