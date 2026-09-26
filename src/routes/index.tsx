import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { business } from "@/content/business";
import { testimonials } from "@/content/testimonials";
import { services } from "@/content/services";
import { zones } from "@/content/zones";
import { CallButtons, CheckList, Eyebrow, QuoteBanner, Section } from "@/components/site-blocks";
import { canonicalUrl, localBusinessJsonLd, pageMeta } from "@/lib/seo";
import { siteImages } from "@/lib/site-images";
import { LocalInfo, LocalMap } from "@/components/local-info";
import { GoogleReviewCard, SocialProof } from "@/components/published-reviews";

const title = "Entreprise de nettoyage Île-de-France | PURE SPACE NETT";
const description =
  "PURE SPACE NETT, entreprise de nettoyage au Pré-Saint-Gervais : bureaux, copropriétés, fin de chantier, vitres, remise en état dans le 93, Paris et toute l'Île-de-France. Devis gratuit sous 24 h.";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: pageMeta({ title, description, path: "/" }),
    links: [{ rel: "canonical", href: canonicalUrl("/") }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(localBusinessJsonLd) }],
  }),
  component: Index,
});

const arguments_ = [
  {
    icon: Clock,
    title: "Réponse sous 24 heures",
    text: "Un devis clair, sans engagement, après un échange téléphonique ou une visite sur place.",
  },
  {
    icon: ShieldCheck,
    title: "Équipes formées et assurées",
    text: "Le même agent d'un mois sur l'autre, une responsabilité civile professionnelle à jour.",
  },
  {
    icon: Building2,
    title: "Du studio à l'immeuble",
    text: "Particuliers, entreprises, syndics et artisans : nous adaptons le matériel à chaque site.",
  },
  {
    icon: Sparkles,
    title: "Produits professionnels",
    text: "Dosage maîtrisé, microfibres codées par couleur, gammes éco-responsables sur demande.",
  },
];

function Index() {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-secondary/70 to-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <Eyebrow>Le Pré-Saint-Gervais · Seine-Saint-Denis · Paris</Eyebrow>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">
              Entreprise de nettoyage professionnel en Île-de-France
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">
              Bureaux, copropriétés, commerces, fin de chantier, vitres, remise en état, textiles et
              véhicules. Basés au Pré-Saint-Gervais, nous intervenons dans le 93 et l'est parisien
              en priorité, et partout en Île-de-France.
            </p>
            <div className="mt-8">
              <CallButtons subject="page d'accueil" />
              <p className="mt-3 text-xs text-muted-foreground">
                Devis gratuit • Sans engagement • Réponse sous 24 h
              </p>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              {[
                ["24 h", "Délai de réponse"],
                ["6 j/7", "Disponibilité"],
                ["9", "Prestations"],
                ["IDF", "Zone couverte"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-border bg-card p-3">
                  <dt className="font-display text-xl font-bold text-primary">{value}</dt>
                  <dd className="text-xs text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <img
              src={siteImages.avantApres}
              alt="Hall de copropriété avant et après le nettoyage par PURE SPACE NETT"
              className="aspect-[16/10] w-full object-cover"
              fetchPriority="high"
            />
            <div className="p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold">Pourquoi nous confier vos locaux</h2>
              <div className="mt-5">
                <CheckList items={business.usp} />
              </div>
              <div className="mt-6 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm">
                <p className="font-semibold">Votre demande en quelques minutes</p>
                <p className="mt-1 text-muted-foreground">
                  Décrivez le besoin, indiquez la surface et ajoutez vos photos si vous le
                  souhaitez.
                </p>
              </div>
              <div className="mt-3 rounded-2xl bg-sand p-4 text-sm text-sand-foreground">
                <p className="font-semibold">Besoin urgent&nbsp;?</p>
                <p className="mt-1">
                  Fin de chantier à livrer ou état des lieux demain : appelez-nous, nous
                  réorganisons nos tournées quand c'est possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section>
        <Eyebrow>Nos prestations</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-bold">
          Neuf prestations de nettoyage, une seule entreprise
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Chaque prestation a sa page dédiée : contenu détaillé, déroulé de l'intervention et
          réponses aux questions les plus fréquentes.
        </p>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-colors hover:border-accent"
            >
              <h3 className="font-display text-base font-semibold">{s.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.intro}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Voir la prestation
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Réalisations</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-bold">Nos chantiers récents</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            [siteImages.couloir, "Sol brillant après nettoyage dans une résidence"],
            [siteImages.solNettoye, "Entretien d'un sol dans les parties communes"],
            [siteImages.bureaux, "Bureaux lumineux après une intervention de nettoyage"],
          ].map(([src, alt]) => (
            <img
              key={src}
              src={src}
              alt={alt}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-2xl border border-border object-cover shadow-card"
            />
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {arguments_.map((a) => (
            <div key={a.title} className="rounded-2xl border border-border bg-card p-6">
              <a.icon className="size-6 text-accent" />
              <h3 className="mt-4 font-display text-base font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Zones desservies</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-bold">
          Une entreprise de nettoyage vraiment locale
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Notre base se trouve au Pré-Saint-Gervais : nous sommes sur place en quelques minutes dans
          les communes voisines, et nous nous déplaçons dans toute la région.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
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

      <Section className="pt-0">
        <Eyebrow>Nous joindre</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-bold">
          Une équipe locale, joignable {business.hours.toLowerCase()}
        </h2>
        <div className="mt-8">
          <LocalInfo />
        </div>
        <div className="mt-6">
          <LocalMap
            query={`${business.city} ${business.postalCode} France`}
            title={`Zone d'intervention de ${business.name} autour du ${business.city}`}
          />
        </div>
        <div className="mt-6">
          <Link
            to="/sous-traitance"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Demander un devis en ligne
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Avis clients</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-bold">Ils nous ont confié leur nettoyage</h2>
        <div className="mt-6">
          <SocialProof />
        </div>
        {testimonials.some((review) => review.sourceUrl) && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.filter((review) => review.sourceUrl).map((review) => (
              <GoogleReviewCard key={review.author} review={review} />
            ))}
          </div>
        )}
      </Section>

      <QuoteBanner subject="page d'accueil" />
    </>
  );
}
