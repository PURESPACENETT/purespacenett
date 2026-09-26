import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getZone, zoneLocalAnswers, zoneQueries, zones } from "@/content/zones";
import { getService } from "@/content/services";
import {
  Breadcrumbs,
  CallButtons,
  Eyebrow,
  QuoteBanner,
  Section,
  WhatsAppButton,
} from "@/components/site-blocks";
import {
  canonicalUrl,
  breadcrumbJsonLd,
  faqJsonLd,
  cityBusinessJsonLd,
  geoMeta,
  localOgMeta,
  pageMeta,
} from "@/lib/seo";
import { getZoneImage } from "@/lib/site-images";
import { LocalInfo, LocalMap } from "@/components/local-info";
import { ReviewRequestBlock } from "@/components/review-request";
import { SocialProof } from "@/components/published-reviews";

export const Route = createFileRoute("/zones/$slug")({
  staticData: { sitemap: true },
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
      meta: [
        ...pageMeta({
          title: z.title,
          description: z.description,
          path,
          type: "business.business",
        }),
        ...localOgMeta({
          city: z.name,
          postalCode: z.postalCode,
          department: z.department,
        }),
        ...geoMeta({ city: z.name, postalCode: z.postalCode, department: z.department }),
      ],
      links: [{ rel: "canonical", href: canonicalUrl(path) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            cityBusinessJsonLd({
              city: z.name,
              postalCode: z.postalCode,
              department: z.department,
              sectors: z.sectors,
              neighbours: z.neighbours,
              path,
              description: z.description,
              services: z.serviceSlugs
                .map((slug) => getService(slug))
                .filter((s): s is NonNullable<ReturnType<typeof getService>> => Boolean(s))
                .map((s) => ({ name: s.navName, path: `/services/${s.slug}` })),
            }),
          ),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            faqJsonLd(zoneLocalAnswers(z).map((a) => ({ q: a.question, a: a.answer }))),
          ),
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
  const zoneIndex = Math.max(
    0,
    zones.findIndex((item) => item.slug === zone.slug),
  );
  const queries = zoneQueries(zone);
  const answers = zoneLocalAnswers(zone);
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
            <Eyebrow>Nettoyage {zone.name}</Eyebrow>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight">
              Nettoyage {zone.name}
              {zone.postalCode ? ` (${zone.postalCode})` : ""} — entreprise de nettoyage
              professionnel
            </h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {zone.department} · société de nettoyage de proximité · devis gratuit sous 24 h
            </p>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground">{zone.intro}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/90">
              {zone.context}
            </p>
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
          Nettoyage {zone.name} : quartiers et secteurs desservis
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Nous intervenons sur l'ensemble de {zone.name}
          {zone.postalCode ? ` (${zone.postalCode})` : ""}, quartier par quartier :
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {zone.sectors.map((sector) => (
            <li key={sector} className="rounded-2xl border border-border bg-card p-4">
              <h3 className="font-display text-sm font-semibold">
                Nettoyage {sector} — {zone.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Bureaux, parties communes, commerces et fin de chantier sur ce secteur.
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/80">
                Recherches liées : nettoyage bureaux {sector}, entretien copropriété {sector},
                nettoyage vitres {sector}.
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold">
          Entreprise nettoyage {zone.name}
          {zone.postalCode ? ` (${zone.postalCode})` : ""} : vos questions les plus fréquentes
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {answers.map((a) => (
            <div
              key={a.question}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <h3 className="font-display text-base font-semibold">{a.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.answer}</p>
              {a.servicePath ? (
                <Link
                  to={a.servicePath}
                  className="mt-3 inline-block text-sm text-primary underline underline-offset-2"
                >
                  Voir le détail
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold">
          Besoins de nettoyage pris en charge à {zone.name}
          {zone.postalCode ? ` (${zone.postalCode})` : ""}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Entretien régulier, intervention ponctuelle ou remise en état : voici les demandes pour
          lesquelles nous sommes le plus souvent sollicités localement.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: `Nettoyage de bureaux à ${zone.name}`,
              path: "/services/nettoyage-bureaux",
            },
            {
              label: `Entretien des copropriétés à ${zone.name}`,
              path: "/services/nettoyage-copropriete",
            },
            {
              label: `Nettoyage de fin de chantier à ${zone.name}`,
              path: "/services/nettoyage-fin-de-chantier",
            },
            {
              label: `Nettoyage de vitres à ${zone.name}`,
              path: "/services/nettoyage-vitres",
            },
            {
              label: `Ménage avant état des lieux à ${zone.name}`,
              path: "/services/menage-etat-des-lieux",
            },
            {
              label: `Remise en état à ${zone.name}`,
              path: "/services/remise-en-etat",
            },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="rounded-2xl border border-border bg-card p-5 text-sm font-medium transition-colors hover:border-accent hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Section>


      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold">
          Nos prestations de nettoyage à {zone.name}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Société de nettoyage de proximité, nous couvrons {zone.name} pour les entreprises, les
          syndics et les particuliers. Cliquez sur une prestation pour en voir le détail.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {zoneServices.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent"
            >
              <h3 className="font-display text-base font-semibold">
                {s.navName} à {zone.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.audience}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold">
          Pourquoi choisir PURE SPACE NETT à {zone.name} ?
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-base font-semibold">Une entreprise du secteur</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Basés au Pré-Saint-Gervais, nous connaissons {zone.name} et {zone.department} : accès,
              stationnement, horaires de livraison. En savoir plus{" "}
              <Link to="/a-propos" className="text-primary underline underline-offset-2">
                sur notre entreprise
              </Link>
              .
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-base font-semibold">Des tarifs clairs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Chiffrage détaillé, sans frais cachés, pour un entretien régulier ou une intervention
              ponctuelle à {zone.name}. Voir{" "}
              <Link to="/tarifs" className="text-primary underline underline-offset-2">
                nos tarifs de nettoyage
              </Link>
              .
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-base font-semibold">Des clients qui recommandent</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Équipes formées et assurées, résultat contrôlé après chaque passage. Lisez{" "}
              <Link to="/avis" className="text-primary underline underline-offset-2">
                les avis de nos clients
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold">
          Nettoyage dans les communes proches de {zone.name}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Également desservies depuis {zone.name} : {zone.neighbours.join(", ")}.
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
                Nettoyage à {z.name}
                {z.postalCode ? ` (${z.postalCode})` : ""}
              </Link>
            ))}
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold">
          Contacter votre entreprise de nettoyage à {zone.name}
          {zone.postalCode ? ` (${zone.postalCode})` : ""}
        </h2>
        <div className="mt-6">
          <LocalInfo area={`${zone.name} et communes voisines`} />
        </div>
        <div className="mt-6">
          <SocialProof city={zone.name} />
        </div>
        <div className="mt-6">
          <ReviewRequestBlock city={zone.name} />
        </div>
        <div className="mt-6">
          <LocalMap
            query={`${zone.name} Île-de-France France`}
            title={`Carte du secteur d'intervention de nettoyage à ${zone.name}`}
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/devis"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Demander un devis de nettoyage à {zone.name}
          </Link>
          <WhatsAppButton
            subject={`nettoyage à ${zone.name}${zone.postalCode ? ` (${zone.postalCode})` : ""}`}
            label="Écrire sur WhatsApp"
          />
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:border-accent"
          >
            Questions fréquentes
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
          >
            Nous écrire
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:border-accent"
          >
            Toutes nos prestations
          </Link>
        </div>
      </Section>

      <QuoteBanner subject={`nettoyage ${zone.name}`} />
    </>
  );
}
