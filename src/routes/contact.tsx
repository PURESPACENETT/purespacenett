import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { business } from "@/content/business";
import { services } from "@/content/services";
import { Breadcrumbs, Eyebrow, Section } from "@/components/site-blocks";
import { breadcrumbJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";

const title = "Contact et devis gratuit | PURE SPACE NETT";
const description =
  "Contactez PURE SPACE NETT au 07 59 48 30 21 ou à contact@purespacenett.com pour un devis de nettoyage gratuit en Île-de-France. Réponse sous 24 heures.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: pageMeta({ title, description, path: "/contact" }),
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(localBusinessJsonLd) },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Accueil", item: "/" },
            { name: "Contact", item: "/contact" },
          ]),
        ),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: services[0]!.name,
    city: "",
    message: "",
  });

  const mailto = `mailto:${business.email}?subject=${encodeURIComponent(
    `Demande de devis — ${form.service}`,
  )}&body=${encodeURIComponent(
    `Nom : ${form.name}\nTéléphone : ${form.phone}\nPrestation : ${form.service}\nVille : ${form.city}\n\n${form.message}`,
  )}`;

  const field =
    "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/40";

  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Contact" }]} />
      <Section>
        <Eyebrow>Contact</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-extrabold">Demander un devis gratuit</h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Le plus rapide reste le téléphone. Sinon, décrivez votre besoin ci-dessous : votre
          messagerie s'ouvre avec le message pré-rempli, et nous vous répondons sous 24 heures.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <a
              href={business.phoneHref}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-colors hover:border-accent"
            >
              <Phone className="size-5 text-accent" />
              <span>
                <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                  Téléphone
                </span>
                <span className="font-display text-lg font-bold">{business.phone}</span>
              </span>
            </a>
            <a
              href={business.emailHref}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-colors hover:border-accent"
            >
              <Mail className="size-5 text-accent" />
              <span>
                <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                  E-mail
                </span>
                <span className="font-semibold">{business.email}</span>
              </span>
            </a>
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
              <MapPin className="size-5 text-accent" />
              <span>
                <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                  Base
                </span>
                <span className="font-semibold">
                  {business.city} ({business.postalCode})
                </span>
              </span>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
              <Clock className="size-5 text-accent" />
              <span>
                <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                  Horaires
                </span>
                <span className="text-sm">{business.hours}</span>
              </span>
            </div>
          </div>

          <form
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = mailto;
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Nom
                <input
                  className={field}
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Votre nom ou société"
                />
              </label>
              <label className="text-sm font-medium">
                Téléphone
                <input
                  className={field}
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="06 00 00 00 00"
                />
              </label>
              <label className="text-sm font-medium">
                Prestation
                <select
                  className={field}
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                >
                  {services.map((s) => (
                    <option key={s.slug} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Ville
                <input
                  className={field}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Pantin, Paris 19e…"
                />
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium">
              Votre besoin
              <textarea
                className={`${field} min-h-32`}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Surface approximative, fréquence souhaitée, contraintes d'horaires…"
              />
            </label>
            <button
              type="submit"
              className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Envoyer ma demande
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
              Le bouton ouvre votre messagerie avec le message déjà rédigé, adressé à{" "}
              {business.email}.
            </p>
          </form>
        </div>
      </Section>
    </>
  );
}
