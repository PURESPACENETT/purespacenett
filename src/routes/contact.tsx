import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { business } from "@/content/business";
import { Breadcrumbs, Eyebrow, Section } from "@/components/site-blocks";
import { QuoteForm } from "@/components/quote-form";
import { canonicalUrl, breadcrumbJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";

const title = "Contact et devis gratuit | PURE SPACE NETT";
const description =
  "Contactez PURE SPACE NETT au 07 59 48 30 21 ou à contact@purespacenett.com pour un devis de nettoyage gratuit en Île-de-France. Réponse sous 24 heures.";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => ({
    meta: pageMeta({ title, description, path: "/contact" }),
    links: [{ rel: "canonical", href: canonicalUrl("/contact") }],
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
  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Contact" }]} />
      <Section>
        <Eyebrow>Contact</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-extrabold">Demander un devis gratuit</h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Remplissez le formulaire ci-dessous et recevez votre devis personnalisé sous 24 h. Le plus
          rapide reste le téléphone si votre besoin est urgent.
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

          <QuoteForm />
        </div>
      </Section>
    </>
  );
}
