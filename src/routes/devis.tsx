import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/content/business";
import { QuoteForm } from "@/components/quote-form";
import { Breadcrumbs, CheckList, Eyebrow, Section } from "@/components/site-blocks";
import { LocalInfo } from "@/components/local-info";
import { breadcrumbJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";

const title = "Devis nettoyage gratuit en 24 h | PURE SPACE NETT";
const description =
  "Demandez un devis de nettoyage gratuit : bureaux, copropriétés, fin de chantier, vitres, état des lieux. Réponse sous 24 h dans le 93, à Paris et en Île-de-France.";
const path = "/devis";

export const Route = createFileRoute("/devis")({
  staticData: { sitemap: true },
  head: () => ({
    meta: pageMeta({ title, description, path }),
    links: [{ rel: "canonical", href: path }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify({ ...localBusinessJsonLd, url: path }) },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Accueil", item: "/" },
            { name: "Devis gratuit", item: path },
          ]),
        ),
      },
    ],
  }),
  component: DevisPage,
});

function DevisPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Devis gratuit" }]} />

      <Section className="pb-8">
        <Eyebrow>Devis gratuit et sans engagement</Eyebrow>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight">
          Demandez votre devis de nettoyage
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground">
          Remplissez le formulaire ci-dessous : nous étudions votre demande et revenons vers vous
          sous 24 heures avec un chiffrage clair, ou une proposition de visite sur place.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <QuoteForm />

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-bold">Ce que vous obtenez</h2>
              <div className="mt-4">
                <CheckList items={business.usp} />
              </div>
            </div>
            <div className="rounded-2xl bg-sand p-6 text-sm text-sand-foreground">
              <p className="font-semibold">Besoin d'une réponse tout de suite ?</p>
              <p className="mt-2">
                Appelez-nous au{" "}
                <a className="font-semibold underline" href={business.phoneHref}>
                  {business.phone}
                </a>
                {" "}— {business.hours}.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <LocalInfo />
      </Section>
    </>
  );
}
