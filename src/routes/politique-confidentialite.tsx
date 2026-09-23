import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/content/business";
import { Breadcrumbs, Eyebrow, Section } from "@/components/site-blocks";
import { canonicalUrl, breadcrumbJsonLd, pageMeta } from "@/lib/seo";

const title = "Politique de confidentialité | PURE SPACE NETT";
const description = "Politique de confidentialité et protection des données personnelles de PURE SPACE NETT.";

export const Route = createFileRoute("/politique-confidentialite")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      ...pageMeta({ title, description, path: "/politique-confidentialite" }),
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/politique-confidentialite") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Accueil", item: "/" },
            { name: "Politique de confidentialité", item: "/politique-confidentialite" },
          ]),
        ),
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Confidentialité" }]} />
      <Section>
        <Eyebrow>Protection des données</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-extrabold">Politique de confidentialité</h1>
        <div className="mt-8 max-w-3xl space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold">Responsable du traitement</h2>
            <p className="mt-3">
              Le responsable du traitement est {business.legalName}, exploitant de {business.name}.
              Pour toute question relative aux données personnelles : {business.email}.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Données collectées</h2>
            <p className="mt-3">
              Selon le formulaire utilisé, nous pouvons collecter notamment le nom, l'adresse e-mail,
              le numéro de téléphone, l'adresse d'intervention, les caractéristiques du bien, la
              surface, la prestation demandée, la fréquence, les précisions transmises et, pour un avis,
              la ville, la note et le contenu du témoignage.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Finalités</h2>
            <p className="mt-3">
              Les données des demandes de devis servent à répondre à votre demande, préparer un
              chiffrage et vous recontacter. Les données d'avis servent à traiter votre contribution
              et, lorsque vous l'autorisez, à la publier. Les données de mesure d'audience servent à
              comprendre l'utilisation du site et à l'améliorer lorsque vous avez accepté cette mesure.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Destinataires et sous-traitants</h2>
            <p className="mt-3">
              Les données peuvent être traitées par les prestataires techniques nécessaires au
              fonctionnement du site, de la base de données, de l'envoi d'e-mails et, avec votre accord,
              de la mesure d'audience. Elles ne sont pas vendues à des tiers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Durée de conservation</h2>
            <p className="mt-3">
              Les données sont conservées pendant la durée nécessaire aux finalités pour lesquelles
              elles sont traitées, puis supprimées ou archivées lorsque la conservation est imposée
              par une obligation légale. Les durées précises peuvent dépendre de la nature de la demande
              et des obligations applicables.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Vos droits</h2>
            <p className="mt-3">
              Vous pouvez demander l'accès, la rectification, l'effacement, la limitation ou vous
              opposer à certains traitements, selon les conditions prévues par la réglementation.
              Pour exercer vos droits : {business.email}. Vous pouvez également adresser une réclamation
              à la CNIL.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Mesure d'audience</h2>
            <p className="mt-3">
              Google Analytics n'est chargé qu'après votre choix d'acceptation dans le bandeau de
              confidentialité. Un refus n'empêche pas l'utilisation du site. Vous pouvez modifier
              votre choix en supprimant la préférence enregistrée dans votre navigateur.
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
