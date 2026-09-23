import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Quote, Star } from "lucide-react";
import { business } from "@/content/business";
import { testimonials } from "@/content/testimonials";
import { Breadcrumbs, Eyebrow, QuoteBanner, Section } from "@/components/site-blocks";
import { ReviewForm } from "@/components/review-form";
import { ReviewCard, Stars, publishedReviewsQuery } from "@/components/published-reviews";
import { canonicalUrl, breadcrumbJsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";

const title = "Avis clients — Témoignages PURE SPACE NETT (nettoyage 93 / IDF)";
const description =
  "Avis et témoignages de nos clients : bureaux, copropriétés, commerces et particuliers au Pré-Saint-Gervais, à Pantin, Paris et en Île-de-France.";

export const Route = createFileRoute("/avis")({
  staticData: { sitemap: true },
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedReviewsQuery),
  head: ({ loaderData }) => {
    // Schéma construit UNIQUEMENT à partir des avis publiés (review_submissions, statut « publié »).
    // Les témoignages historiques (Google) ne sont pas repris dans le balisage ni dans la moyenne.
    // Remarque : Google n'affiche pas d'étoiles pour les avis qu'une entreprise publie sur
    // elle-même (LocalBusiness) ; le balisage reste descriptif, sans garantie d'extrait enrichi.
    const published = loaderData?.reviews ?? [];
    const summary = loaderData && loaderData.count > 0 && loaderData.average !== null ? loaderData : null;
    return {
      meta: pageMeta({ title, description, path: "/avis" }),
      links: [{ rel: "canonical", href: canonicalUrl("/avis") }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            ...localBusinessJsonLd,
            url: canonicalUrl("/avis"),
            ...(summary
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: summary.average,
                    reviewCount: summary.count,
                    bestRating: 5,
                    worstRating: 1,
                  },
                  review: published.slice(0, 20).map((r) => ({
                    "@type": "Review",
                    author: { "@type": "Person", name: r.author_name },
                    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
                    reviewBody: r.message,
                    datePublished: r.created_at.slice(0, 10),
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
    };
  },
  errorComponent: () => (
    <Section>
      <p className="text-sm text-muted-foreground">Les avis ne peuvent pas être affichés pour le moment.</p>
    </Section>
  ),
  component: AvisPage,
});

function AvisPage() {
  const { data } = useSuspenseQuery(publishedReviewsQuery);
  const published = data.reviews;
  // Témoignages historiques conservés s'ils ne font pas doublon avec un avis publié.
  const publishedNames = new Set(published.map((r) => r.author_name.trim().toLowerCase()));
  const history = testimonials.filter((t) => !publishedNames.has(t.author.trim().toLowerCase()));

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
        {data.count > 0 && data.average !== null && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Stars rating={data.average} className="size-5" />
            <p className="text-sm font-semibold">
              {data.average.toLocaleString("fr-FR")}/5 · {data.count} avis publié{data.count > 1 ? "s" : ""} sur le site
            </p>
          </div>
        )}
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
        {published.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
            <Star className="mx-auto size-7 text-accent" />
            <h2 className="mt-4 font-display text-xl font-bold">Aucun avis publié sur le site pour l'instant</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Les avis laissés via le formulaire ci-dessous sont affichés ici après vérification.
              Vous pouvez aussi consulter notre fiche Google.
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

      {history.length > 0 && (
        <Section className="pt-0">
          <h2 className="font-display text-2xl font-bold">Avis reçus sur notre fiche Google</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Retours recopiés depuis Google, non comptés dans la note moyenne du site.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((t) => (
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
                <div className="mt-4">
                  <Stars rating={t.rating} />
                </div>
                <figcaption className="mt-3 text-sm">
                  <span className="font-display font-semibold">{t.author}</span>
                  <span className="block text-xs text-muted-foreground">{t.context}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

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
