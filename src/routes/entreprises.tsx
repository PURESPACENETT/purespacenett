import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, FileText, Handshake, Phone } from "lucide-react";
import { business } from "@/content/business";
import { Breadcrumbs, CallButtons, Eyebrow, QuoteBanner, Section } from "@/components/site-blocks";
import { B2BLeadForm } from "@/components/b2b-lead-form";
import { canonicalUrl, breadcrumbJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";

const title = "Sous-traitance B2B nettoyage | PURE SPACE NETT";
const description = "PURE SPACE NETT recherche des partenariats avec des entreprises de nettoyage pour prendre en charge des chantiers en sous-traitance dans le 93, à Paris et en Île-de-France.";

export const Route = createFileRoute("/sous-traitance")({
  staticData: { sitemap: true },
  head: () => ({
    meta: pageMeta({ title, description, path: "/sous-traitance" }),
    links: [{ rel: "canonical", href: canonicalUrl("/sous-traitance") }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(localBusinessJsonLd) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbJsonLd([{ name: "Accueil", item: "/" }, { name: "Sous-traitance B2B", item: "/sous-traitance" }])) },
    ],
  }),
  component: SubcontractingPage,
});

const benefits = [
  { icon: Handshake, title: "Un partenaire pour vos chantiers", text: "Vous avez un chantier à déléguer, un besoin de renfort ou une intervention que vous ne pouvez pas assurer directement ? Présentez-nous le besoin." },
  { icon: Building2, title: "Des prestations de nettoyage", text: "Bureaux, commerces, copropriétés, vitrerie, fin de chantier, remise en état et autres prestations selon le chantier." },
  { icon: FileText, title: "Un cadre d'intervention clair", text: "Nous étudions le périmètre, les horaires, les accès, les consignes et les modalités avant de confirmer l'intervention." },
  { icon: CheckCircle2, title: "Un suivi commercial structuré", text: "Chaque demande est qualifiée et suivie afin de faciliter les échanges jusqu'à la décision sur le chantier." },
];

function SubcontractingPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Sous-traitance B2B" }]} />
      <Section>
        <Eyebrow>Partenariats avec les entreprises de nettoyage</Eyebrow>
        <div className="mt-3 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">Vous avez des chantiers de nettoyage à déléguer ?</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">PURE SPACE NETT travaille avec des entreprises de nettoyage qui recherchent un partenaire pour prendre en charge certains chantiers, renforcer leur capacité d'intervention ou couvrir un secteur géographique.</p>
            <div className="mt-7"><CallButtons subject="partenariat sous-traitance B2B" /></div>
            <p className="mt-3 text-xs text-muted-foreground">Brief · étude du chantier · proposition · intervention</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">Vous êtes une entreprise de nettoyage ?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Si vous avez un chantier à confier, indiquez-nous sa localisation, sa nature, sa surface, ses horaires et vos contraintes. Nous vous recontactons pour étudier les modalités.</p>
          </div>
        </div>
      </Section>
      <Section className="pt-0">
        <Eyebrow>Pourquoi nous contacter</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-bold">Un canal dédié aux chantiers à déléguer</h2>
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
        <Eyebrow>Transmettre un chantier</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-bold">Décrivez-nous le chantier que vous souhaitez déléguer</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Votre demande est enregistrée dans notre espace commercial pour qualification et suivi.</p>
        <div className="mt-6 max-w-3xl"><B2BLeadForm /></div>
      </Section>
      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-secondary p-6 sm:p-8">
            <Eyebrow>Comment ça fonctionne</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-bold">Un processus simple</h2>
            <ol className="mt-5 space-y-4 text-sm">
              <li><strong>1. Brief :</strong> vous nous transmettez les informations disponibles.</li>
              <li><strong>2. Étude :</strong> nous vérifions le périmètre, les horaires, les accès et les contraintes.</li>
              <li><strong>3. Proposition :</strong> nous échangeons sur les conditions d'intervention.</li>
              <li><strong>4. Chantier :</strong> l'intervention est organisée selon ce qui a été convenu.</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <Eyebrow>Contact direct</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-bold">Vous préférez présenter le chantier par téléphone ?</h2>
            <p className="mt-4 text-sm text-muted-foreground">Appelez-nous directement pour nous exposer le besoin.</p>
            <a href={business.phoneHref} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"><Phone className="size-4" /> {business.phone}</a>
          </div>
        </div>
      </Section>
      <QuoteBanner subject="partenariat sous-traitance B2B" />
    </>
  );
}
