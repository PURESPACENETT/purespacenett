import { useState } from "react";
import { business, whatsappHref } from "@/content/business";
import { trackEvent } from "@/lib/analytics";

const propertyTypes = [
  ["bureaux", "Bureaux / locaux professionnels"],
  ["commerce", "Commerce / magasin"],
  ["immeuble", "Immeuble / copropriété"],
  ["chantier", "Chantier / remise en état"],
  ["autre", "Autre"],
] as const;

const services = [
  ["nettoyage_courant", "Nettoyage courant"],
  ["vitrerie", "Vitrerie"],
  ["remise_en_etat", "Remise en état"],
  ["fin_de_chantier", "Fin de chantier"],
  ["desinfection", "Désinfection"],
] as const;

const frequencies = [
  ["ponctuel", "Ponctuel"],
  ["hebdomadaire", "1 fois par semaine"],
  ["plusieurs_semaine", "Plusieurs fois par semaine"],
  ["quotidien", "Tous les jours"],
  ["contrat_annuel", "Contrat régulier / annuel"],
] as const;

const field = "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/40";

export function B2BLeadForm() {
  const [form, setForm] = useState({
    contactName: "", companyName: "", email: "", phone: "", propertyType: "bureaux",
    surfaceM2: "", frequency: "ponctuel", services: ["nettoyage_courant"] as string[],
    city: "", postalCode: "", desiredDate: "", message: "", consent: false,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  const set = (key: string, value: string | boolean) => {
    if (!started) {
      setStarted(true);
      trackEvent("lead_b2b_commence", { source: "page_sous_traitance" });
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleService = (value: string) => {
    if (!started) {
      setStarted(true);
      trackEvent("lead_b2b_commence", { source: "page_sous_traitance" });
    }
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(value)
        ? prev.services.filter((item) => item !== value)
        : [...prev.services, value],
    }));
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.consent || form.services.length === 0) return;
    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/public/b2b-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: "", surfaceM2: Number(form.surfaceM2), desiredDate: form.desiredDate || "" }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Transmission impossible");
      }
      trackEvent("lead_b2b_envoye", { source: "page_sous_traitance" });
      setStatus("sent");
    } catch (e) {
      trackEvent("lead_b2b_echec", { source: "page_sous_traitance" });
      setError(e instanceof Error ? e.message : "Transmission impossible");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <h2 className="font-display text-2xl font-bold">Votre demande de sous-traitance a bien été transmise</h2>
        <p className="mt-3 text-sm text-muted-foreground">Merci. Notre équipe va étudier votre besoin professionnel et revenir vers vous rapidement.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={business.phoneHref} onClick={() => trackEvent("appel_telephone", { source: "b2b_confirmation" })} className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Appeler {business.phone}</a>
          <a href={whatsappHref("suivi de ma demande de sous-traitance")} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("clic_whatsapp", { source: "b2b_confirmation" })} className="inline-flex rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground">Écrire sur WhatsApp</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">Entreprise de nettoyage *
          <input className={field} required maxLength={160} value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Nom de votre entreprise" />
        </label>
        <label className="block text-sm font-medium">Votre nom *
          <input className={field} required maxLength={120} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Nom et prénom" />
        </label>
        <label className="block text-sm font-medium">Email professionnel *
          <input className={field} type="email" required maxLength={255} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@entreprise.fr" />
        </label>
        <label className="block text-sm font-medium">Téléphone *
          <input className={field} type="tel" required maxLength={30} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="06 00 00 00 00" />
        </label>
        <label className="block text-sm font-medium">Ville du chantier *
          <input className={field} required maxLength={120} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Paris" />
        </label>
        <label className="block text-sm font-medium">Code postal *
          <input className={field} required maxLength={10} value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} placeholder="75000" />
        </label>
        <label className="block text-sm font-medium">Surface approximative (m²) *
          <input className={field} type="number" min={1} max={200000} required value={form.surfaceM2} onChange={(e) => set("surfaceM2", e.target.value)} placeholder="500" />
        </label>
        <label className="block text-sm font-medium">Démarrage souhaité
          <input className={field} type="date" value={form.desiredDate} onChange={(e) => set("desiredDate", e.target.value)} />
        </label>
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Site web<input tabIndex={-1} autoComplete="off" value="" onChange={() => undefined} name="website" /></label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Type de site *</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {propertyTypes.map(([value, label]) => (
            <label key={value} className="cursor-pointer">
              <input className="sr-only" type="radio" name="propertyType" value={value} checked={form.propertyType === value} onChange={(e) => set("propertyType", e.target.value)} />
              <span className={"inline-flex rounded-full border px-3 py-2 text-sm " + (form.propertyType === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background")}>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Prestations recherchées *</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {services.map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.services.includes(value)} onChange={() => toggleService(value)} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 block text-sm font-medium">Fréquence
        <select className={field} value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
          {frequencies.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>

      <label className="mt-5 block text-sm font-medium">Décrivez votre besoin
        <textarea className={field + " min-h-32"} maxLength={1500} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Nombre de sites, horaires, contraintes, cahier des charges, délais..." />
      </label>

      <label className="mt-5 flex items-start gap-3 text-xs text-muted-foreground">
        <input type="checkbox" required className="mt-0.5 size-4 shrink-0" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} />
        <span>J'accepte que mes données soient utilisées par {business.name} pour traiter ma demande professionnelle et me recontacter.</span>
      </label>

      <button type="submit" disabled={status === "sending"} className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {status === "sending" ? "Transmission en cours…" : "Recevoir une proposition"}
      </button>

      {status === "error" && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Demande gratuite</span><span>Sans engagement</span><span>Traitement confidentiel</span>
      </div>
    </form>
  );
}
