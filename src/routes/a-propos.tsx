import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/content/business";
import { Breadcrumbs, CheckList, Eyebrow, QuoteBanner, Section } from "@/components/site-blocks";
import { canonicalUrl, breadcrumbJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";
import { siteImages } from "@/lib/site-images";

const title = "À propos de PURE SPACE NETT | Entreprise de nettoyage 93";
const description =
  "Découvrez PURE SPACE NETT, entreprise de nettoyage indépendante basée au Pré-Saint-Gervais. Méthode de travail, engagements et zones d'intervention dans le 93, à Paris et en Île-de-France.";

export const Route = createFileRoute("/a-propos")({
  staticData: { sitemap: true },
  head: () => ({
    meta: pageMeta({ title, description, path: "/a-propos" }),
    links: [{ rel: "canonical", href: canonicalUrl("/a-propos") }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(localBusinessJsonLd) },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Accueil", item: "/" },
            { name: "À propos", item: "/a-propos" },
          ]),
        ),
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  "Un interlocuteur direct pour organiser vos interventions",
  "Un cahier des charges adapté à votre site et à vos besoins",
  "Des points de contrôle pour suivre la qualité des prestations",
  "Des produits et matériels professionnels utilisés selon la prestation",
];

function AboutPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "À propos" }]} />
      <Section>
        <Eyebrow>À propos</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-extrabold">
          Une entreprise de nettoyage de proximité, au Pré-Saint-Gervais
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
            <p>
              {business.name} est une entreprise de nettoyage indépendante installée au Pré-Saint-Gervais,
              en Seine-Saint-Denis. Nous accompagnons les entreprises, syndics, artisans et particuliers
              pour des interventions ponctuelles comme pour des besoins réguliers.
            </p>
            <p>
              Notre approche repose sur une organisation simple : comprendre le besoin, définir précisément
              la prestation, organiser l'intervention et rester disponible pour le suivi. Le client dispose
              d'un interlocuteur direct pour les questions liées au chantier ou au contrat.
            </p>
            <p>
              Nous intervenons en priorité dans le 93 et l'est parisien. Pour les chantiers et contrats
              adaptés à notre organisation, nous nous déplaçons également à Paris et dans les autres secteurs
              d'Île-de-France.
            </p>
            <p>
              Selon la prestation, nous utilisons du matériel professionnel adapté au support et au niveau
              de salissure : monobrosse, injection-extraction, perche à eau pure ou matériel de nettoyage
              haute pression lorsque les conditions du site le permettent.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <img
              src={siteImages.bureaux}
              alt="Bureaux après une intervention de nettoyage par PURE SPACE NETT"
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
            <div className="p-6">
              <h2 className="font-display text-lg font-semibold">Nos engagements</h2>
              <div className="mt-4">
                <CheckList items={values} />
              </div>
              <div className="mt-6 rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
                <p className="font-semibold">Coordonnées</p>
                <p className="mt-1">
                  {business.city} ({business.postalCode}) · {business.phone} · {business.email}
                </p>
                <p className="mt-2 text-xs">{business.hours}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Notre méthode</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Échange initial, définition du besoin, estimation ou visite lorsque nécessaire, puis
              intervention selon le cahier des charges convenu.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Nos clients</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Bureaux, commerces, copropriétés, artisans, propriétaires et particuliers selon la nature
              de la prestation demandée.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Notre secteur</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Base au Pré-Saint-Gervais, interventions dans le 93, à Paris et plus largement en
              Île-de-France selon le chantier et son organisation.
            </p>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="rounded-2xl border border-border bg-secondary p-6 sm:p-8">
          <Eyebrow>Parlons de votre besoin</Eyebrow>
          <h2 className="mt-3 font-display text-2xl font-bold">Un besoin ponctuel ou un contrat régulier ?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Décrivez votre site, la prestation recherchée et, si utile, ajoutez des photos dans votre demande.
            Nous pourrons ainsi mieux comprendre le chantier avant de vous répondre.
          </p>
        </div>
      </Section>

      <QuoteBanner subject="à propos" />
    </>
  );
}
