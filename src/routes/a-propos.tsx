import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/content/business";
import { Breadcrumbs, CheckList, Eyebrow, QuoteBanner, Section } from "@/components/site-blocks";
import { canonicalUrl, breadcrumbJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";

const title = "À propos de PURE SPACE NETT | Entreprise de nettoyage 93";
const description =
  "PURE SPACE NETT est une entreprise de nettoyage basée au Pré-Saint-Gervais, au service des entreprises, syndics et particuliers du 93, de Paris et de l'Île-de-France.";

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
  "Un référent unique, joignable directement au téléphone",
  "Les mêmes agents sur votre site, mois après mois",
  "Un cahier des charges écrit et des points de contrôle",
  "Des produits professionnels dosés, sans excès de chimie",
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
              {business.name} est une entreprise de nettoyage installée au Pré-Saint-Gervais, en
              Seine-Saint-Denis. Nous travaillons pour des entreprises, des syndics, des artisans et
              des particuliers, sur des contrats réguliers comme sur des interventions ponctuelles.
            </p>
            <p>
              Notre parti pris est simple : rester une structure à taille humaine, où le client parle
              directement à la personne qui organise les interventions. Pas de plateau téléphonique,
              pas de sous-traitance en chaîne. Vous appelez, on décroche, et on connaît votre site.
            </p>
            <p>
              Nous couvrons en priorité le 93 et l'est parisien, où nous sommes réactifs en quelques
              minutes, et nous nous déplaçons dans toute l'Île-de-France pour les chantiers et les
              contrats plus importants.
            </p>
            <p>
              Nos équipes sont formées aux protocoles d'hygiène, aux règles de sécurité et à
              l'utilisation du matériel professionnel : monobrosse, injection-extraction, perche à
              eau pure, nettoyage haute pression.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
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
      </Section>

      <QuoteBanner subject="à propos" />
    </>
  );
}
