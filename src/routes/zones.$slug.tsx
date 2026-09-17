import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getZone, zones } from "@/content/zones";
import { getService } from "@/content/services";
import {
  Breadcrumbs,
  CallButtons,
  Eyebrow,
  QuoteBanner,
  Section,
} from "@/components/site-blocks";
import { breadcrumbJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";
import { getZoneImage } from "@/lib/site-images";

export const Route = createFileRoute("/zones/$slug")({
  loader: ({ params }) => {
    const zone = getZone(params.slug);
    if (!zone) throw notFound();
    return { zone };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Zone introuvable" }, { name: "robots", content: "noindex" }] };
    }
    const z = loaderData.zone;
    const path = `/zones/${params.slug}`;
    return {
      meta: pageMeta({ title: z.title, description: z.description, path }),
      links: [{ rel: "canonical", href: path }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({ ...localBusinessJsonLd, url: path }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Accueil", item: "/" },
              { name: "Zones desservies", item: "/zones" },
              { name: z.name, item: path },
            ]),
          ),
        },
      ],
    };
  },
  component: ZoneDetail,
});

function ZoneDetail() {
  const { zone } = Route.useLoaderData();
  const zoneIndex = Math.max(0, zones.findIndex((item) => item.slug === zone.slug));
  const zoneServices = zone.serviceSlugs
    .map((slug) => getService(slug))
    .filter((s): s is NonNullable<ReturnType<typeof getService>> => Boolean(s));

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Accueil", to: "/" },
          { label: "Zones desservies", to: "/zones" },
          { label: zone.name },
        ]}
      />

      <Section className="pb-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Eyebrow>Zone desservie</Eyebrow>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight">
              Entreprise de nettoyage à {zone.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground">{zone.intro}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/90">{zone.context}</p>
            <div className="mt-8">
              <CallButtons subject={`nettoyage ${zone.name}`} />
            </div>
          </div>
          <img
            src={getZoneImage(zoneIndex)}
            alt={`Chantier de nettoyage réalisé dans le secteur de ${zone.name}`}
            className="aspect-[4/3] w-full rounded-2xl border border-border object-cover shadow-card"
          />
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold">
          Nos prestations disponibles à {zone.name}
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {zoneServices.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent"
            >
              <span className="font-display text-base font-semibold">{s.navName}</span>
              <p className="mt-1 text-sm text-muted-foreground">{s.audience}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold">Communes voisines</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Également desservies : {zone.neighbours.join(", ")}.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {zones
            .filter((z) => z.slug !== zone.slug)
            .map((z) => (
              <Link
                key={z.slug}
                to="/zones/$slug"
                params={{ slug: z.slug }}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-accent hover:text-primary"
              >
                Nettoyage {z.name}
              </Link>
            ))}
        </div>
      </Section>

      <QuoteBanner subject={`nettoyage ${zone.name}`} />
    </>
  );
}
