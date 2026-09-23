import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, FileText, Phone, Target } from "lucide-react";
import { B2BLeadForm } from "@/components/b2b-lead-form";
import { business } from "@/content/business";
import { Breadcrumbs, CallButtons, Eyebrow, QuoteBanner, Section } from "@/components/site-blocks";
import { canonicalUrl, breadcrumbJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";

const title = "Nettoyage pour entreprises | Contrats B2B | PURE SPACE NETT";
const description =
  "PURE SPACE NETT accompagne les entreprises, commerces, bureaux et gestionnaires de sites en Île-de-France avec des prestations de nettoyage ponctuelles ou régulières et des contrats B2B.";

export const Route = createFileRoute("/entreprises")({
  staticData: { sitemap: true },
  head: () => ({
    meta: pageMeta({ title, description, path: "/entreprises" }),
    links: [{ rel: "canonical", href: canonicalUrl("/entreprises") }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(localBusinessJsonLd) },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Accueil", item: "/" },
            { name: "Entreprises", item: "/entreprises" },
          ]),
        ),
      },
    ],
  }),
  component: BusinessesPage,
});

const benefits = [
  {
    icon: Building2,
    title: "Des prestations pour les professionnels",
    text: "Nettoyage de bureaux, commerces, copropriétés, locaux professionnels, remises en état et autres besoins selon le cahier des charges.",
  },
  {
    icon: Target,
    title: "Une réponse adaptée au site",
    text: "Chaque demande est étudiée selon la surface, les contraintes du site, les horaires, la fréquence et le niveau de service attendu.",
  },
  {
    icon: CheckCircle2,
    title: "Ponctuel ou récurrent",
    text: "Intervention unique, renfort sur une période donnée ou organisation d'un contrat régulier selon votre besoin.",
  },
  {
    icon: FileText,
    title: "Un interlocuteur identifié",
    text: "Vous disposez d'un contact direct pour préparer la prestation, organiser l'intervention et suivre les besoins du site.",
  },
];

function BusinessesPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Entreprises" }]} />

      <Section>
        <Eyebrow>Solutions de nettoyage B2B</Eyebrow>
        <div className="mt-3 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Un partenaire de nettoyage pour vos sites professionnels
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Vous recherchez une entreprise de nettoyage pour vos bureaux, commerces, locaux
              professionnels, copropriétés ou remises en état ? PURE SPACE NETT étudie les besoins
              des entreprises qui recherchent une prestation ponctuelle ou un contrat régulier en
              Île-de-France.
            </p>
            <div className="mt-7">
              <CallButtons subject="demande de nettoyage B2B" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Échange sur le besoin · Visite si nécessaire · Proposition · Mise en place
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">Vous avez plusieurs sites ou un besoin récurrent ?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Transmettez-nous les informations disponibles sur vos sites, les prestations attendues,
              la fréquence et vos contraintes. Nous pouvons étudier un dispositif adapté à votre organisation.
            </p>
            <a
              href="/devis"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              <FileText className="size-4" />
              Demander un devis
            </a>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Pour les entreprises</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-bold">Une organisation pensée pour les besoins professionnels</h2>
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
            <Eyebrow>Demande B2B</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-bold">Les informations utiles pour préparer votre demande</h2>
            <ol className="mt-5 space-y-4 text-sm">
              <li><strong>1. Le site :</strong> adresse, type de locaux et surface approximative.</li>
              <li><strong>2. Le besoin :</strong> prestations souhaitées, fréquence et niveau de service.</li>
              <li><strong>3. L'organisation :</strong> jours, horaires, accès et contraintes particulières.</li>
              <li><strong>4. Le démarrage :</strong> date souhaitée et durée prévue si le besoin est temporaire.</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <Eyebrow>Documents et détails</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-bold">Ajoutez ce qui permet d'étudier précisément le chantier</h2>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>• Cahier des charges ou descriptif des prestations</li>
              <li>• Plans, photos ou informations sur les locaux</li>
              <li>• Fréquence et créneaux d'intervention</li>
              <li>• Contraintes d'accès ou consignes particulières</li>
              <li>• Nombre de sites concernés si vous avez un besoin multi-sites</li>
            </ul>
            <a href={business.phoneHref} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Phone className="size-4" />
              {business.phone}
            </a>
          </div>
        </div>
      </Section>

      <Section className="pt-0"><Eyebrow>Parlons de votre besoin</Eyebrow><h2 className="mt-3 font-display text-3xl font-bold">Décrivez le chantier à nous confier</h2><p className="mt-3 max-w-2xl text-sm text-muted-foreground">Votre demande est transmise directement à notre espace commercial pour qualification et suivi.</p><div className="mt-6 max-w-3xl"><B2BLeadForm /></div></Section>
    </>
  );
}
