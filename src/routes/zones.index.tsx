import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { zones } from "@/content/zones";
import { Breadcrumbs, Eyebrow, QuoteBanner, Section } from "@/components/site-blocks";
import { canonicalUrl, breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { getZoneImage } from "@/lib/site-images";

const title = "Zones desservies en Île-de-France | PURE SPACE NETT";
const description =
  "PURE SPACE NETT intervient au Pré-Saint-Gervais, Pantin, Les Lilas, Aubervilliers, Montreuil, Bagnolet, Saint-Denis, Paris et dans toute l'Île-de-France.";

export const Route = createFileRoute("/zones/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: pageMeta({ title, description, path: "/zones" }),
    links: [{ rel: "canonical", href: canonicalUrl("/zones") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Accueil", item: "/" },
            { name: "Zones desservies", item: "/zones" },
          ]),
        ),
      },
    ],
  }),
  component: ZonesIndex,
});

function ZonesIndex() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Zones desservies" }]} />
      <Section className="pb-6">
        <Eyebrow>Zones desservies</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-extrabold">
          Nettoyage professionnel dans le 93, à Paris et en Île-de-France
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Nous sommes basés au Pré-Saint-Gervais. Plus vous êtes proche, plus nous sommes réactifs :
          dans les communes limitrophes, nous pouvons intervenir le jour même en cas d'urgence.
        </p>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((z, index) => (
            <Link
              key={z.slug}
              to="/zones/$slug"
              params={{ slug: z.slug }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-colors hover:border-accent"
            >
              <img
                src={getZoneImage(index)}
                alt={`Intervention de nettoyage près de ${z.name}`}
                loading="lazy"
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="p-6">
                <MapPin className="size-5 text-accent" />
                <h2 className="mt-3 font-display text-lg font-semibold">
                  Nettoyage à {z.name}
                  {z.postalCode ? ` (${z.postalCode})` : ""}
                </h2>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{z.department}</p>
                <p className="mt-2 text-sm text-muted-foreground">{z.intro}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <QuoteBanner subject="zones desservies" />
    </>
  );
}
