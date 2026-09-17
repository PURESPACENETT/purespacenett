import { createFileRoute, Link } from "@tanstack/react-router";
import { Quote, Star } from "lucide-react";
import { business } from "@/content/business";
import { testimonials } from "@/content/testimonials";
import { Breadcrumbs, Eyebrow, QuoteBanner, Section } from "@/components/site-blocks";
import { ReviewForm } from "@/components/review-form";
import { canonicalUrl, breadcrumbJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";

const title = "Avis clients — Témoignages PURE SPACE NETT (nettoyage 93 / IDF)";
const description =
  "Avis et témoignages de nos clients : bureaux, copropriétés, commerces et particuliers au Pré-Saint-Gervais, à Pantin, Paris et en Île-de-France.";

export const Route = createFileRoute("/avis")({
  staticData: { sitemap: true },
  head: () => ({
    meta: pageMeta({ title, description, path: "/avis" }),
    links: [{ rel: "canonical", href: canonicalUrl("/avis") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          ...localBusinessJsonLd,
          url: "/avis",
          ...(testimonials.length
            ? {
                review: testimonials.map((t) => ({
                  "@type": "Review",
                  author: { "@type": "Person", name: t.author },
                  reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5 },
                  ...(t.text ? { reviewBody: t.text } : {}),
                  ...(t.date ? { datePublished: t.date } : {}),
                })),
              }
            : {}),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Accueil", item: "/" },
            { name: "Avis clients", item: "/avis" },
          ]),
        ),
      },
    ],
  }),
  component: AvisPage,
});

function AvisPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Avis clients" }]} />

      <Section className="pb-6">
        <Eyebrow>Avis clients</Eyebrow>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight">
          Ce que disent les clients de {business.name}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Syndics, gérants de bureaux, commerçants et particuliers du 93, de Paris et d'Île-de-France
          nous confient l'entretien de leurs locaux. Voici leurs retours, publiés tels qu'ils nous
          ont été laissés.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={business.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("clic_fiche_google", { source: "page_avis" })}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Star className="size-4" />
            Laisser un avis sur Google
          </a>
          <Link
            to="/devis"
            onClick={() => trackEvent("clic_devis", { source: "page_avis" })}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
          >
            Demander un devis gratuit
          </Link>
        </div>
      </Section>

      <Section className="pt-0">
        {testimonials.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.author}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <Quote className="size-6 text-accent" />
                {t.text ? (
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
                    “{t.text}”
                  </blockquote>
                ) : (
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    A laissé un avis {t.rating} étoiles sur notre fiche Google.
                  </p>
                )}
                <div
                  className="mt-4 flex gap-0.5"
                  aria-label={`Note de ${t.rating} sur 5`}
                  role="img"
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < t.rating ? "fill-accent text-accent" : "text-muted-foreground/40"}`}
                    />
                  ))}
                </div>
                <figcaption className="mt-3 text-sm">
                  <span className="font-display font-semibold">{t.author}</span>
                  <span className="block text-xs text-muted-foreground">{t.context}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
            <Star className="mx-auto size-7 text-accent" />
            <h2 className="mt-4 font-display text-xl font-bold">
              Nos avis sont pour l'instant publiés sur Google
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Retrouvez les retours de nos clients directement sur notre fiche Google. Vous avez fait
              appel à nous ? Votre avis nous aide beaucoup et sera repris sur cette page.
            </p>
            <a
              href={business.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("clic_fiche_google", { source: "page_avis_vide" })}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Star className="size-4" />
              Voir et laisser un avis sur Google
            </a>
          </div>
        )}
      </Section>

      <Section className="pt-0">
        <div className="mx-auto max-w-2xl">
          <Eyebrow>Votre avis</Eyebrow>
          <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
            Vous avez fait appel à {business.name} ? Laissez-nous un avis
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Quelques lignes suffisent. Votre avis nous est envoyé directement, et à la fin nous vous
            proposons de le publier aussi sur notre fiche Google en un clic.
          </p>
          <div className="mt-6">
            <ReviewForm />
          </div>
        </div>
      </Section>

      <QuoteBanner subject="avis clients" />
    </>
  );
}
