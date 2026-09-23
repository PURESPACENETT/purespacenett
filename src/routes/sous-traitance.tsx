import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, FileText, Handshake, Phone } from "lucide-react";
import { business } from "@/content/business";
import { Breadcrumbs, CallButtons, Eyebrow, QuoteBanner, Section } from "@/components/site-blocks";
import { canonicalUrl, breadcrumbJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";

const title = "Sous-traitance B2B nettoyage | PURE SPACE NETT";
const description =
  "PURE SPACE NETT accompagne les entreprises de nettoyage en sous-traitance dans le 93, à Paris et en Île-de-France : renfort d'équipe, chantiers ponctuels et contrats réguliers.";

export const Route = createFileRoute("/sous-traitance")({
  staticData: { sitemap: true },
  head: () => ({
    meta: pageMeta({ title, description, path: "/sous-traitance" }),
    links: [{ rel: "canonical", href: canonicalUrl("/sous-traitance") }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(localBusinessJsonLd) },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Accueil", item: "/" },
            { name: "Sous-traitance B2B", item: "/sous-traitance" },
          ]),
        ),
      },
    ],
  }),
  component: SubcontractingPage,
});

const benefits = [
  {
    icon: Handshake,
    title: "Un partenaire opérationnel",
    text: "Renfort ponctuel ou intervention régulière selon vos besoins et le cahier des charges convenu.",
  },
  {
    icon: Building2,
    title: "Des prestations de nettoyage",
    text: "Bureaux, copropriétés, commerces, vitres, fin de chantier et remise en état selon le périmètre confié.",
  },
  {
    icon: FileText,
    title: "Un cadre clair",
    text: "Périmètre, horaires, accès, consignes et modalités d'intervention définis avant le démarrage.",
  },
  {
    icon: CheckCircle2,
    title: "Suivi des interventions",
    text: "Un interlocuteur identifié pour faciliter les échanges et le suivi des chantiers confiés.",
  },
];

function SubcontractingPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Sous-traitance B2B" }]} />

      <Section>
        <Eyebrow>Partenariat B2B</Eyebrow>
        <div className="mt-3 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Sous-traitance de nettoyage pour les entreprises de propreté
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Vous avez besoin d'un renfort fiable pour absorber un chantier, remplacer une équipe
              ou prendre en charge une prestation sur un secteur précis ? PURE SPACE NETT peut
              intervenir comme partenaire sous-traitant, selon vos contraintes et le périmètre convenu.
            </p>
            <div className="mt-7">
              <CallButtons subject="sous-traitance B2B" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Échange initial · Cahier des charges · Devis · Organisation de l'intervention
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">Vous êtes une entreprise de nettoyage ?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Envoyez-nous votre secteur, la nature du chantier, les horaires, la fréquence et les
              contraintes particulières. Nous étudions la demande avant de confirmer les modalités
              d'intervention.
            </p>
            <a
              href={business.emailHref}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              <FileText className="size-4" />
              Présenter votre besoin
            </a>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Ce que nous pouvons prendre en charge</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-bold">Un renfort adapté au chantier</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <item.icon className="size-6 text-accent" />
              <h3 className="mt-4 font-display text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-secondary p-6 sm:p-8">
            <Eyebrow>Comment travailler ensemble</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-bold">Un processus simple</h2>
            <ol className="mt-5 space-y-4 text-sm">
              <li><strong>1. Brief :</strong> vous nous transmettez le site, le besoin et le cahier des charges.</li>
              <li><strong>2. Étude :</strong> nous vérifions le périmètre, les horaires, les accès et les moyens nécessaires.</li>
              <li><strong>3. Proposition :</strong> les conditions d'intervention sont définies avant validation.</li>
              <li><strong>4. Intervention :</strong> le chantier est réalisé selon les consignes convenues, avec un interlocuteur identifié.</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <Eyebrow>Informations utiles</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-bold">Pour obtenir une réponse précise</h2>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>• Adresse ou secteur du chantier</li>
              <li>• Type de locaux et surface approximative</li>
              <li>• Prestation demandée et fréquence</li>
              <li>• Jours et horaires d'intervention</li>
              <li>• Date de démarrage souhaitée</li>
              <li>• Cahier des charges ou photos si disponibles</li>
            </ul>
            <a href={business.phoneHref} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Phone className="size-4" />
              {business.phone}
            </a>
          </div>
        </div>
      </Section>

      <QuoteBanner subject="sous-traitance B2B" />
    </>
  );
}
