import { createFileRoute, Link } from "@tanstack/react-router";
import { business, whatsappHref } from "@/content/business";
import { services } from "@/content/services";
import { zones } from "@/content/zones";
import { QuoteForm } from "@/components/quote-form";
import { Breadcrumbs, CheckList, Eyebrow, Section } from "@/components/site-blocks";
import { LocalInfo } from "@/components/local-info";
import { canonicalUrl, breadcrumbJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";

const title = "Devis nettoyage gratuit en 24 h | PURE SPACE NETT";
const description =
  "Demandez un devis de nettoyage gratuit : bureaux, copropriétés, fin de chantier, vitres, état des lieux. Réponse sous 24 h dans le 93, à Paris et en Île-de-France.";
const path = "/devis";

export const Route = createFileRoute("/devis")({
  staticData: { sitemap: true },
  head: () => ({
    meta: pageMeta({ title, description, path }),
    links: [{ rel: "canonical", href: canonicalUrl(path) }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify({ ...localBusinessJsonLd, url: canonicalUrl(path) }) },
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
          Remplissez le formulaire en quelques minutes. Vous pouvez ajouter des photos pour nous aider
          à comprendre le besoin. Nous revenons vers vous sous 24 heures avec un chiffrage clair ou
          une proposition de visite sur place.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
          <span className="rounded-full border border-border bg-card px-3 py-1.5">Gratuit</span>
          <span className="rounded-full border border-border bg-card px-3 py-1.5">Sans engagement</span>
          <span className="rounded-full border border-border bg-card px-3 py-1.5">Photos facultatives</span>
          <span className="rounded-full border border-border bg-card px-3 py-1.5">Réponse sous 24 h</span>
        </div>

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
              <p className="font-semibold">Vous préférez échanger directement ?</p>
              <p className="mt-2">
                Appelez-nous au{" "}
                <a
                  className="font-semibold underline"
                  href={business.phoneHref}
                  onClick={() => trackEvent("appel_telephone", { source: "page_devis" })}
                >
                  {business.phone}
                </a>
                {" "}— {business.hours}.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={whatsappHref("demande de devis")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("clic_whatsapp", { source: "page_devis" })}
                  className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold"
                >
                  Écrire sur WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <LocalInfo />
      </Section>

      <Section className="pt-0">
        <Eyebrow>Prestations chiffrables</Eyebrow>
        <h2 className="mt-3 font-display text-2xl font-bold">
          Toutes nos prestations de nettoyage
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Choisissez la prestation qui correspond à votre besoin dans le formulaire, ou consultez sa
          page détaillée avant de demander votre devis.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="rounded-2xl border border-border bg-card p-4 text-sm font-medium transition-colors hover:border-accent hover:text-primary"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Villes desservies</Eyebrow>
        <h2 className="mt-3 font-display text-2xl font-bold">Où nous intervenons</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {zones.map((z) => (
            <Link
              key={z.slug}
              to="/zones/$slug"
              params={{ slug: z.slug }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-primary"
            >
              Nettoyage {z.name}
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
