import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { business } from "@/content/business";
import { Breadcrumbs, Eyebrow, Section } from "@/components/site-blocks";
import { canonicalUrl, breadcrumbJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";

const title = "Contact | PURE SPACE NETT";
const description =
  "Contactez PURE SPACE NETT au 07 59 48 30 21 ou à contact@purespacenett.com. Les demandes de devis passent désormais par notre parcours dédié de sous-traitance.";

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
        <h1 className="mt-3 font-display text-4xl font-extrabold">Nous contacter</h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Pour une demande de devis, utilisez désormais notre parcours dédié. Il centralise les informations du chantier et permet son suivi commercial.
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

          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Demande de devis</p>
            <h2 className="mt-3 font-display text-2xl font-bold">Transmettre votre besoin</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Le formulaire historique n’est plus utilisé. Pour transmettre un chantier et obtenir une proposition, utilisez la page dédiée.</p>
            <Link to="/sous-traitance" className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Accéder au formulaire de demande</Link>
          </div>
        </div>
      </Section>
    </>
  );
}
