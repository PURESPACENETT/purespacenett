import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { services } from "@/content/services";
import { Breadcrumbs, Eyebrow, QuoteBanner, Section } from "@/components/site-blocks";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";

const title = "Nos prestations de nettoyage | PURE SPACE NETT";
const description =
  "Toutes les prestations de PURE SPACE NETT : nettoyage de bureaux, copropriétés, commerces, vitres, fin de chantier, remise en état, état des lieux, canapés et véhicules en Île-de-France.";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: pageMeta({ title, description, path: "/services" }),
    links: [{ rel: "canonical", href: "/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Accueil", item: "/" },
            { name: "Services", item: "/services" },
          ]),
        ),
      },
    ],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Services" }]} />
      <Section className="pb-6">
        <Eyebrow>Prestations</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-extrabold">
          Nos prestations de nettoyage en Île-de-France
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Entretien régulier ou intervention ponctuelle, pour des professionnels comme pour des
          particuliers. Choisissez la prestation qui correspond à votre besoin pour en voir le
          détail, le déroulé et les tarifs indicatifs.
        </p>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-colors hover:border-accent"
            >
              <h2 className="font-display text-lg font-semibold">{s.name}</h2>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-accent-foreground/70">
                {s.audience}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{s.intro}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Détail de la prestation
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <QuoteBanner subject="prestations" />
    </>
  );
}
