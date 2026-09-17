import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs, Eyebrow, FaqList, QuoteBanner, Section } from "@/components/site-blocks";
import { breadcrumbJsonLd, faqJsonLd, pageMeta } from "@/lib/seo";

const title = "Tarifs de nettoyage et devis | PURE SPACE NETT";
const description =
  "Comment sont calculés nos tarifs de nettoyage en Île-de-France : entretien régulier, fin de chantier au m², remise en état, vitrerie, textiles. Devis gratuit sous 24 h.";

const faq = [
  {
    q: "Pourquoi ne pas afficher un prix fixe ?",
    a: "Deux locaux de même surface peuvent demander deux fois plus de temps selon l'encrassement, les revêtements et l'accès. Nous préférons un chiffrage juste après un échange ou une visite.",
  },
  {
    q: "Le devis est-il payant ?",
    a: "Non, le devis et la visite préalable sont gratuits et sans engagement.",
  },
  {
    q: "Le matériel et les produits sont-ils inclus ?",
    a: "Oui, toujours. Les consommables (papier, savon, sacs) peuvent être inclus sur demande dans les contrats réguliers.",
  },
  {
    q: "Y a-t-il un engagement de durée ?",
    a: "Les contrats réguliers sont mensuels, résiliables avec un préavis court. Les interventions ponctuelles sont payables à la prestation.",
  },
];

const grid = [
  {
    title: "Entretien régulier",
    unit: "Au passage ou au forfait mensuel",
    text: "Bureaux, copropriétés, commerces. Le prix dépend de la surface, de la fréquence et de la durée de passage. Plus la fréquence est élevée, plus le coût par passage baisse.",
  },
  {
    title: "Fin de chantier",
    unit: "Au m²",
    text: "Chiffrage sur plans ou après visite, selon le niveau de poussière, la présence de traces de peinture et la surface vitrée.",
  },
  {
    title: "Remise en état",
    unit: "Au devis, après diagnostic",
    text: "Décapage, dégraissage, traitement d'odeurs : le temps nécessaire varie beaucoup, une visite est indispensable.",
  },
  {
    title: "Ménage état des lieux",
    unit: "Au forfait, par logement",
    text: "Forfait selon le nombre de pièces et l'état, du studio au grand appartement.",
  },
  {
    title: "Vitrerie",
    unit: "Au m² de vitrage ou au forfait",
    text: "Vitrines de commerce en abonnement hebdomadaire ou bimensuel, baies vitrées au forfait.",
  },
  {
    title: "Textiles et véhicules",
    unit: "À la pièce ou au véhicule",
    text: "Canapés, fauteuils, tapis, moquettes, intérieur de voiture ou d'utilitaire, avec tarif dégressif au volume.",
  },
];

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: pageMeta({ title, description, path: "/tarifs" }),
    links: [{ rel: "canonical", href: "/tarifs" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Accueil", item: "/" },
            { name: "Tarifs", item: "/tarifs" },
          ]),
        ),
      },
      { type: "application/ld+json", children: JSON.stringify(faqJsonLd(faq)) },
    ],
  }),
  component: TarifsPage,
});

function TarifsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Tarifs" }]} />
      <Section className="pb-6">
        <Eyebrow>Tarifs</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-extrabold">
          Comment nous calculons nos tarifs
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Nous préférons un devis honnête à un prix d'appel. Voici la base de calcul de chaque type
          de prestation, pour que vous sachiez à quoi vous attendre avant même de nous appeler.
        </p>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((g) => (
            <div key={g.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold">{g.title}</h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">
                {g.unit}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{g.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold">Questions fréquentes sur les prix</h2>
        <div className="mt-6">
          <FaqList faq={faq} />
        </div>
      </Section>

      <QuoteBanner subject="tarifs" />
    </>
  );
}
