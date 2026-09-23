import { createFileRoute, Link } from "@tanstack/react-router";
import { business } from "@/content/business";
import { faqGroups } from "@/content/faq";
import { zones } from "@/content/zones";
import {
  Breadcrumbs,
  CallButtons,
  Eyebrow,
  QuoteBanner,
  Section,
} from "@/components/site-blocks";
import { LocalInfo } from "@/components/local-info";
import { canonicalUrl, breadcrumbJsonLd, faqJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";

const title = "FAQ nettoyage — horaires, devis, tarifs, zones | PURE SPACE NETT";
const description =
  "Réponses aux questions fréquentes sur nos prestations de nettoyage en Seine-Saint-Denis et à Paris : horaires 7h–22h, devis gratuit sous 24 h, tarifs, prestations et villes couvertes.";

export const Route = createFileRoute("/faq")({
  staticData: { sitemap: true },
  head: () => ({
    meta: pageMeta({ title, description, path: "/faq" }),
    links: [{ rel: "canonical", href: canonicalUrl("/faq") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({ ...localBusinessJsonLd, url: canonicalUrl("/faq") }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Accueil", item: "/" },
            { name: "Questions fréquentes", item: "/faq" },
          ]),
        ),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Questions fréquentes" }]} />

      <Section className="pb-8">
        <Eyebrow>Questions fréquentes</Eyebrow>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight">
          FAQ nettoyage : horaires, devis, tarifs et zones couvertes
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground">
          Vous hésitez avant de nous confier vos locaux ? Voici les réponses aux questions que l'on
          nous pose le plus souvent au {business.city}, à Pantin, à Paris est et partout en{" "}
          {business.region}.
        </p>
        <div className="mt-8">
          <CallButtons subject="questions fréquentes" />
        </div>
      </Section>

      <Section className="pt-0">
        <nav aria-label="Sommaire de la FAQ" className="flex flex-wrap gap-2">
          {faqGroups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-accent hover:text-primary"
            >
              {group.title}
            </a>
          ))}
        </nav>
      </Section>

      {faqGroups.map((group) => (
        <Section key={group.id} id={group.id} className="pt-0">
          <h2 className="font-display text-2xl font-bold">{group.title}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {group.items.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <h3 className="font-display text-base font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </Section>
      ))}

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold">
          Nos informations pratiques et nos villes d'intervention
        </h2>
        <div className="mt-6">
          <LocalInfo />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {zones.map((z) => (
            <Link
              key={z.slug}
              to="/zones/$slug"
              params={{ slug: z.slug }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-accent hover:text-primary"
            >
              Nettoyage à {z.name}
              {z.postalCode ? ` (${z.postalCode})` : ""}
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/tarifs"
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
          >
            Voir nos tarifs
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:border-accent"
          >
            Toutes nos prestations
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:border-accent"
          >
            Nous contacter
          </Link>
        </div>
      </Section>

      <QuoteBanner subject="questions fréquentes" />
    </>
  );
}
