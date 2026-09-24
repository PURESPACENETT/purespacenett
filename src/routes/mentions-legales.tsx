import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/content/business";
import { Breadcrumbs, Eyebrow, Section } from "@/components/site-blocks";
import { canonicalUrl, breadcrumbJsonLd, pageMeta } from "@/lib/seo";

const title = "Mentions légales | PURE SPACE NETT";
const description = "Mentions légales de PURE SPACE NETT, entreprise individuelle de nettoyage au Pré-Saint-Gervais.";

export const Route = createFileRoute("/mentions-legales")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      ...pageMeta({ title, description, path: "/mentions-legales" }),
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/mentions-legales") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Accueil", item: "/" },
            { name: "Mentions légales", item: "/mentions-legales" },
          ]),
        ),
      },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Mentions légales" }]} />
      <Section>
        <Eyebrow>Informations légales</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-extrabold">Mentions légales</h1>

        <div className="mt-8 max-w-3xl space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold">Éditeur du site</h2>
            <dl className="mt-3 space-y-2">
              <div><dt className="font-semibold">Nom commercial</dt><dd>{business.name}</dd></div>
              <div><dt className="font-semibold">Exploitant</dt><dd>{business.legalName}</dd></div>
              <div><dt className="font-semibold">Forme</dt><dd>Entrepreneur individuel (EI)</dd></div>
              <div><dt className="font-semibold">SIREN</dt><dd>{business.siren}</dd></div>
              <div><dt className="font-semibold">SIRET du siège</dt><dd>{business.siret}</dd></div>
              <div><dt className="font-semibold">TVA intracommunautaire</dt><dd>{business.vatNumber}</dd></div>
              <div><dt className="font-semibold">Adresse</dt><dd>{business.address}, {business.postalCode} {business.city}</dd></div>
              <div><dt className="font-semibold">E-mail</dt><dd>{business.email}</dd></div>
              <div><dt className="font-semibold">Téléphone</dt><dd>{business.phone}</dd></div>
            </dl>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Activité</h2>
            <p className="mt-3">
              Activité principale : nettoyage courant des bâtiments (APE 81.21Z).
              Le site présente les prestations de nettoyage proposées aux particuliers et aux professionnels.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Hébergement</h2>
            <dl className="mt-3 space-y-2">
              <div><dt className="font-semibold">Hébergeur</dt><dd>Lovable Labs Incorporated</dd></div>
              <div><dt className="font-semibold">Adresse</dt><dd>1 Lincoln St, Boston, MA 02111, États-Unis</dd></div>
            </dl>
            <p className="mt-3">
              Le site est publié et hébergé via la plateforme Lovable. Cette mention est
              fournie à titre informatif et ne constitue pas une certification.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Propriété intellectuelle</h2>
            <p className="mt-3">
              Sauf mention contraire, les textes, éléments graphiques, marques et contenus présents
              sur ce site sont réservés à PURE SPACE NETT. Toute reproduction ou réutilisation
              substantielle sans autorisation préalable est susceptible d'être interdite.
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
